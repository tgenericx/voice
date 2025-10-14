import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from 'generated/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { TokenService } from 'src/tokens/token.service';
import { RefreshTokenService } from 'src/tokens/refresh-token.service';
import { AuthPayload } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async create(userData: CreateUserDto): Promise<AuthPayload> {
    if (userData.role && userData.role === Role.ADMIN) {
      throw new ForbiddenException(`Cannot self-assign ${Role.ADMIN} role`);
    }

    const hashedPassword = await argon2.hash(userData.password);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role ? userData.role : Role.STUDENT,
      },
    });
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(loginData: LoginDto): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({
      where: {
        matricNo: loginData.matricNo,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.password, loginData.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshToken(token: string): Promise<AuthPayload> {
    const { valid, userId } = await this.refreshTokenService.isValid(token);

    if (!valid || !userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.refreshTokenService.revokeToken(token);

    const newAccessToken = this.tokenService.generateAccessToken(user);
    const newRefreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }
}
