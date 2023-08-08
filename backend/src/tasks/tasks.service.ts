import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model, ObjectId } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new this.taskModel({
      title: createTaskDto.title,
      type: createTaskDto.type,
      due: createTaskDto.due ?? DateTime.now().setZone('UTC').toISO(),
      lastUpdated: DateTime.now().setZone('UTC').toISO(),
      complete: false,
    });
    return task.save();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async findOne(id: ObjectId): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }

  async update(
    id: ObjectId,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task | null> {
    const task: Task | null = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          title: updateTaskDto.title,
          description: updateTaskDto.description,
          complete: updateTaskDto.complete,
          type: updateTaskDto.type,
          due: updateTaskDto.due,
          lastUpdated: DateTime.now().setZone('UTC').toISO(),
        },
        {
          returnDocument: 'after',
        },
      )
      .exec();
    return task;
  }

  remove(id: ObjectId) {
    return this.taskModel.findByIdAndDelete(id).exec();
  }
}
