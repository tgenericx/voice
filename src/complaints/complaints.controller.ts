import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { CurrentUser } from 'src/utils/decorators';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';
import { ApiResponse, MethodReturn } from 'src/common/types';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  async create(
    @Body() createComplaintDto: CreateComplaintDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<MethodReturn<typeof this.complaintsService.create>>> {
    const message = 'Complaint issued successfully';
    const data = await this.complaintsService.create(createComplaintDto, user);
    return { message, data };
  }

  @Get()
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(+id, updateComplaintDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(+id);
  }
}
