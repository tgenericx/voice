import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role, User } from 'generated/prisma';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async create(userData: CreateUserDto): Promise<User> {
    if (userData.role && userData.role === Role.ADMIN) {
      throw new ForbiddenException(`Cannot self-assign ${Role.ADMIN} role`);
    }

    const hashedPassword = await argon2.hash(userData.password);

    return await this.usersService.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: Role.USER,
      },
    });
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
