import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { findRoot } from 'src/utils/find-root';
import { AccessTokenPayload, AuthenticatedUser } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const etcSecrets = '/etc/secrets';
    let secretsBase: string;

    if (fs.existsSync(etcSecrets)) {
      secretsBase = etcSecrets;
    } else {
      try {
        fs.mkdirSync(etcSecrets, { recursive: true });
        secretsBase = etcSecrets;
      } catch {
        const root = findRoot(process.cwd());
        secretsBase = path.join(root, 'secrets');
      }
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

    // === Initialize strategy ===
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

    if (!user) {
      throw new UnauthorizedException();
    }

    return { userId: user.id, role: user.role };
  }
}
