import type { TaskType } from "@/enums/tasktype.enum";
import type { DateTime } from "luxon";

export default interface updateTaskDTO {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  due: DateTime;
  complete: boolean;
}