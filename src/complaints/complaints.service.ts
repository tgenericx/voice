import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';
import { Role } from 'generated/prisma';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateComplaintDto, user: AuthenticatedUser) {
    const hasAttachments =
      Array.isArray(data.attachments) && data.attachments.length > 0;

    return this.prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          madeBy: { connect: { id: user.userId } },
        },
      });

      if (hasAttachments) {
        await tx.attachment.createMany({
          data: data.attachments!.map((a) => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileId: a.fileId,
            fileSize: a.fileSize,
            uploadedById: user.userId,
            complaintId: complaint.id,
          })),
        });
      }

      return tx.complaint.findUnique({
        where: { id: complaint.id },
        include: {
          attachments: true,
          madeBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    });
  }

  async update(
    id: string,
    updateComplaintDto: UpdateComplaintDto,
    user: AuthenticatedUser,
  ) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');

    if (complaint.madeById !== user.userId)
      throw new ForbiddenException('You can only update your own complaints');

    const { attachments, ...data } = updateComplaintDto;
    const hasNewAttachments =
      Array.isArray(attachments) && attachments.length > 0;

    return this.prisma.$transaction(async (tx) => {
      await tx.complaint.update({
        where: { id },
        data,
      });

      if (hasNewAttachments) {
        await tx.attachment.createMany({
          data: attachments.map((a) => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileId: a.fileId,
            fileSize: a.fileSize,
            uploadedById: user.userId,
            complaintId: id,
          })),
        });
      }

      return tx.complaint.findUnique({
        where: { id },
        include: { attachments: true, madeBy: true },
      });
    });
  }

  async findAll(user: AuthenticatedUser) {
    const isAdmin = user.role === Role.ADMIN;

    return this.prisma.complaint.findMany({
      where: isAdmin ? {} : { madeById: user.userId },
      include: {
        attachments: true,
        madeBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.complaint.findUnique({
      where: { id },
      include: {
        attachments: true,
        madeBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    if (complaint.madeById !== user.userId)
      throw new ForbiddenException('You can only delete your own complaints');

    return this.prisma.complaint.delete({ where: { id } });
  }
}
