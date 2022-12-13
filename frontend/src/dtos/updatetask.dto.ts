import { TaskType } from "@/enums/tasktype.enum";
import type { IUpdateTaskForm } from "@/interfaces/updateTaskForm.interface";
import type { DateTime } from "luxon";
import { useEnumFromValue } from "@/composables/enumFromValue.composable";
import { useMidnight } from "@/composables/midnight";

export interface IUpdateTaskDto {
  id: string;
  title?: string;
  description?: string;
  type?: TaskType;
  due?: DateTime;
  complete?: boolean;
}

export class UpdateTaskDto implements IUpdateTaskDto {
  private static enumFromValue = useEnumFromValue();
  private static midnight = useMidnight();

  static fromForm(form: IUpdateTaskForm): UpdateTaskDto {
    return new this(
      form.id,
      form.title,
      this.enumFromValue.enumFromValue(form.taskType, TaskType),
      this.midnight.getMidnight(form.due),
      form.complete,
      form.description
    );
  }
  constructor(
    public id: string,
    public title?: string,
    public type?: TaskType,
    public due?: DateTime,
    public complete?: boolean,
    public description?: string
  ) {}
}
