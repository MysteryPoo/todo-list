import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import mongoose, { HydratedDocument } from 'mongoose';
import { TaskType } from '../enums/tasktype.enum';

export type TaskDocument = HydratedDocument<Task>;

function getDateTime(datetime: string): DateTime {
  return DateTime.fromISO(datetime);
}

function setDateTime(datetime: DateTime): string {
  return datetime.toISO();
}

export class Task {
  title: string;

  description?: string;

  type: TaskType;

  due: string;

  complete: boolean;

  lastUpdated: string;
}

export const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: TaskType },
  due: String,
  complete: Boolean,
  lastUpdated: String,
});
