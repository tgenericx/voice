import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { loadOrGenerateKeys } from 'src/tokens/jwt/jwt-utils';
import { AccessTokenPayload, AuthenticatedUser } from 'src/auth/dto/auth.dto';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(RefreshTokenStrategy.name);

  constructor(private readonly prisma: PrismaService) {
    const { publicKey } = loadOrGenerateKeys(
      new Logger(RefreshTokenStrategy.name),
      'refresh',
    );

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!user) {
      this.logger.warn(
        `Unauthorized: user ${payload.sub} not found for refresh`,
      );
      throw new UnauthorizedException();
    }

    return { userId: user.id, role: user.role };
  }
}
