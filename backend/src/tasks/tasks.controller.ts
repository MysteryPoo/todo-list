import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PatchTaskParams } from './dto/patch-task.params.dto';
import { GetTaskParams } from './dto/get-task.params.dto';
import { DeleteTaskParams } from './dto/delete-task.params.dto';
import { Task } from './schemas/task.schema';

@Controller({
  path: 'tasks',
  version: '1',
})
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: GetTaskParams) {
    const task: Task | null = await this.tasksService.findOne(params.id);
    if (null === task)
      throw new NotFoundException(`Task (${params.id}) could not be found.`);
    return task;
  }

  @Patch(':id')
  async update(
    @Param() params: PatchTaskParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const task: Task | null = await this.tasksService.update(
      params.id,
      updateTaskDto,
    );
    if (!task)
      throw new NotFoundException(`Task (${params.id}) could not be found.`);
    return task;
  }

  @Delete(':id')
  async remove(@Param() params: DeleteTaskParams) {
    const task: Task | null = await this.tasksService.remove(params.id);
    if (!task)
      throw new NotFoundException(`Task (${params.id}) could not be found.`);
    return task;
  }
}
