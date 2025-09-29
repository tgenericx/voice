import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    return context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
  }
}
