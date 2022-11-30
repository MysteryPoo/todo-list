import type { TaskType } from "@/enums/tasktype.enum";
import type { DateTime } from "luxon";

export default interface ITask {
  id: number;
  title: string;
  description?: string;
  type: TaskType;
  due: Date;
  dueDT: DateTime;
}
