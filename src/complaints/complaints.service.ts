import { Injectable } from '@nestjs/common';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateComplaintDto, user: AuthenticatedUser) {
    const hasAttachments =
      Array.isArray(data.attachments) && data.attachments.length > 0;

    const complaintData: Prisma.ComplaintCreateInput = {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      madeBy: { connect: { id: user.userId } },
    };

    if (hasAttachments) {
      complaintData.attachments = {
        create: data.attachments?.map((attachment) => ({
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileSize: attachment.fileSize,
          uploadedBy: { connect: { id: user.userId } },
        })),
      };
    }

    return await this.prisma.complaint.create({
      data: complaintData,
      include: {
        attachments: true,
        madeBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  findAll() {
    return `This action returns all complaints`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaint`;
  }

  update(id: number, updateComplaintDto: UpdateComplaintDto) {
    return `This action updates a #${id} complaint`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaint`;
  }
}
