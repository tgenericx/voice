import { UserDto } from 'src/users/dto/user.dto';

export class AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export class AccessTokenPayload {
  sub: UserDto['id'];
  roles: UserDto['role'];
}

export type VerifiedToken<T = unknown> = {
  iat?: number;
  exp?: number;
} & T;

export class AuthenticatedUser {
  userId: UserDto['id'];
  roles: UserDto['role'];
}
