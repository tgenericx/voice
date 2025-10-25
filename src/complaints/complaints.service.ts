import { Injectable } from '@nestjs/common';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateComplaintDto, user: AuthenticatedUser) {
    return await this.prisma.complaint.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        madeBy: { connect: { id: user.userId } },
        attachments: {
          create:
            data.attachments?.map((attachment) => ({
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              fileSize: attachment.fileSize,
              uploadedBy: { connect: { id: user.userId } },
            })) ?? [],
        },
      },
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
