import type { TaskType } from "@/enums/tasktype.enum";
import type { DateTime } from "luxon";

export default interface ITask {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  due: DateTime;
  completed: boolean;
  lastUpdated: DateTime;
}
