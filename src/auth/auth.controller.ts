import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, AuthPayload } from './dto/auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RefreshTokenGuard } from 'src/utils/guards';
import { CurrentUser } from 'src/utils/decorators';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/users/dto/user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto): Promise<AuthPayload> {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthPayload> {
    return this.authService.login(loginDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string, @Req() req): Promise<AuthPayload> {
    return this.authService.refreshToken(refreshToken);
  }

  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.userId,
      },
    });

    if (!currentUser) {
      throw new ForbiddenException('Unknown user');
    }

    return currentUser;
  }

  @ApiBearerAuth('Bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    return this.authService.logout(refreshToken);
  }
}
