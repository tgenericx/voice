import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { JwtStrategy } from 'src/utils/strategies';
import { JwtAuthGuard } from 'src/utils/guards';

@Module({
  imports: [PrismaModule, TokensModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
