import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAttachmentDto: CreateAttachmentDto,
    user: AuthenticatedUser,
  ) {
    return await this.prisma.attachment.create({
      data: {
        fileName: createAttachmentDto.fileName,
        fileUrl: createAttachmentDto.fileUrl,
        fileSize: createAttachmentDto.fileSize,
        uploadedBy: { connect: { id: user.userId } },
      },
    });
  }

  findAll() {
    return this.prisma.attachment.findMany({
      include: { uploadedBy: true },
    });
  }

  findOne(id: string) {
    return this.prisma.attachment.findUnique({
      where: { id },
      include: { uploadedBy: true },
    });
  }

  update(id: string, updateAttachmentDto: UpdateAttachmentDto) {
    return this.prisma.attachment.update({
      where: { id },
      data: updateAttachmentDto,
    });
  }

  remove(id: string) {
    return this.prisma.attachment.delete({
      where: { id },
    });
  }
}
