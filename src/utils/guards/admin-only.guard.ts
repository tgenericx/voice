import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'generated/prisma';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request & { user?: AuthenticatedUser } = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!(user.role === Role.ADMIN)) {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
