import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';
import { Role } from 'generated/prisma';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser) {
    const isAdmin = user.role === Role.ADMIN;

    return this.prisma.attachment.findMany({
      where: isAdmin ? {} : { uploadedById: user.userId },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.attachment.findUnique({
      where: { id },
      include: { uploadedBy: true },
    });
  }

  async update(
    id: string,
    updateAttachmentDto: UpdateAttachmentDto,
    user: AuthenticatedUser,
  ) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');

    if (attachment.uploadedById !== user.userId)
      throw new ForbiddenException('You can only update your own attachments');

    return this.prisma.attachment.update({
      where: { id },
      data: updateAttachmentDto,
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');

    if (attachment.uploadedById !== user.userId)
      throw new ForbiddenException('You can only delete your own attachments');

    return this.prisma.attachment.delete({ where: { id } });
  }
}
