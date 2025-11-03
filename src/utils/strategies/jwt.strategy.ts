import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { AccessTokenPayload, AuthenticatedUser } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const secretsBase = '/etc/secrets';

    try {
      if (!fs.existsSync(secretsBase)) {
        fs.mkdirSync(secretsBase, { recursive: true });
      }
    } catch (err) {
      console.warn(`⚠️ Failed to ensure ${secretsBase}: ${err}`);
    }

    const publicKeyPath = path.join(secretsBase, 'access', 'access-public.pem');
    let secretOrKey: string;

    try {
      secretOrKey = fs.readFileSync(publicKeyPath, 'utf8');
      console.log(`✅ Loaded JWT public key from ${publicKeyPath}`);
    } catch (error) {
      console.warn(`⚠️ Failed to read public key from ${publicKeyPath}:`, error);
      secretOrKey = config.get<string>('JWT_PUBLIC_KEY', '');
      if (!secretOrKey) {
        throw new Error('No JWT public key available from file or config');
      }
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!user) throw new UnauthorizedException();

    return { userId: user.id, role: user.role };
  }
}
