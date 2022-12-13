import { useEnumFromValue } from "@/composables/enumFromValue.composable";
import { useMidnight } from "@/composables/midnight";
import { TaskType } from "@/enums/tasktype.enum";
import type { INewTaskForm } from "@/interfaces/newTaskForm.interface";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

export interface INewTaskDto {
  id: string;
  title: string;
  type: TaskType;
  due: DateTime;
  description?: string;
}
export class NewTaskDto implements INewTaskDto {
  private static enumFromValue = useEnumFromValue();
  private static midnight = useMidnight();

  static fromForm(form: INewTaskForm): NewTaskDto {
    return new this(
      form.title,
      this.enumFromValue.enumFromValue(form.taskType, TaskType),
      this.midnight.getMidnight(form.due),
      form.description
    );
  }

  public id: string;

  constructor(
    public title: string,
    public type: TaskType,
    public due: DateTime,
    public description?: string
  ) {
    this.id = uuidv4();
  }
}
