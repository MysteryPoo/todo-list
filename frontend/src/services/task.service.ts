import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import { DateTime } from "luxon";

const enumFromValue = <T extends Record<string, string>>(
  val: string,
  _enum: T
) => {
  const enumName = (Object.keys(_enum) as Array<keyof T>).find(
    (k) => _enum[k] === val
  );
  if (!enumName) throw Error(); // here fail fast as an example
  return _enum[enumName];
};

export default class TaskService {
  public async getTasks(): Promise<Array<ITask>> {
    const res = await fetch("http://localhost:3000/v1/tasks");
    const d = await res.json();
    const taskList: Array<ITask> = [];
    for (const task of d) {
      taskList.push({
        id: task._id,
        title: task.title,
        type: enumFromValue(task.type, TaskType),
        due: DateTime.fromISO(task.due),
        completed: task.complete,
        lastUpdated: DateTime.fromISO(task.lastUpdated),
      });
    }
    return taskList;
  }
}
