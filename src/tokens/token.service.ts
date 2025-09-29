import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { AccessTokenPayload, VerifiedToken } from 'src/auth/dto/auth.dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly jwt: JwtService) {}

  generateAccessToken(user: Pick<User, 'id' | 'role'>): string {
    try {
      const payload: AccessTokenPayload = {
        sub: user.id,
        role: user.role,
      };
      return this.jwt.sign(payload);
    } catch (error) {
      this.logger.error('Failed to generate access token', error);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  generateToken(user: Pick<User, 'id'>): string {
    try {
      const payload = {
        sub: user.id,
      };
      return this.jwt.sign(payload, {
        expiresIn: '24h',
      });
    } catch (error) {
      this.logger.error('Failed to generate access token', error);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  verify<T = AccessTokenPayload>(token: string): VerifiedToken<T> {
    try {
      return this.jwt.verify(token);
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
