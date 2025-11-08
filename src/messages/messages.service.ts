import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMessageDto, user: AuthenticatedUser) {
    return await this.prisma.message.create({
      data: {
        ...data,
        senderId: user.userId,
      },
    });
  }

  async findAll() {
    return await this.prisma.message.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.message.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    user: AuthenticatedUser,
  ) {
    const owner = await this.prisma.message.findUnique({
      where: {
        id,
      },
      select: {
        senderId: true,
      },
    });
    if (owner?.senderId !== user.userId) {
      throw new UnauthorizedException(
        'You are not the owner of this resources',
      );
    }
    return await this.prisma.message.update({
      where: {
        id,
      },
      data: {
        ...updateMessageDto,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.message.delete({
      where: {
        id,
      },
    });
  }
}
