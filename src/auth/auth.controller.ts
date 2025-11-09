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
  UploadedFile,
  BadRequestException,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!DEFAULT_SUPPORTED_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AuthPayload> {
    if (!file) {
      throw new BadRequestException('No files uploaded');
    }
    return this.authService.create(createUserDto, file);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthPayload> {
    return this.authService.login(loginDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(
    @Body('refreshToken') refreshToken: string,
    @Req() req,
  ): Promise<AuthPayload> {
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
