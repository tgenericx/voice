import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { CurrentUser } from 'src/utils/decorators';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';
import { ApiResponse, AwaitedMethodReturn } from 'src/common/types';
import { JwtAuthGuard } from 'src/utils/guards';

@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  async create(
    @Body() createComplaintDto: CreateComplaintDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<
    ApiResponse<AwaitedMethodReturn<typeof this.complaintsService.create>>
  > {
    const message = 'Complaint issued successfully';
    const data = await this.complaintsService.create(createComplaintDto, user);
    return { message, data };
  }

  @Get()
  async findAll(): Promise<
    ApiResponse<AwaitedMethodReturn<typeof this.complaintsService.findAll>>
  > {
    const message = 'Complaints retrieved successfully';
    const data = await this.complaintsService.findAll();
    return { message, data };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.complaintsService.update(id, updateComplaintDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(id);
  }
}
