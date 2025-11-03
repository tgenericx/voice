import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for validating refresh tokens using the `jwt-refresh` strategy.
 * Works seamlessly with your `RefreshTokenStrategy`.
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
