import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { JwtStrategy, RefreshTokenStrategy } from 'src/utils/strategies';
import { JwtAuthGuard, RefreshTokenGuard } from 'src/utils/guards';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, TokensModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RefreshTokenStrategy,
    RefreshTokenGuard,
    CloudinaryModule,
  ],
})
export class AuthModule {}
