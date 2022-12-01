import { DateTime } from 'luxon';
import { TaskType } from '../enums/tasktype.enum';

export class Task {
  id: number;
  title: string;
  description?: string;
  type: TaskType;
  due: DateTime;
  complete: boolean;
  lastUpdated: DateTime;
}
