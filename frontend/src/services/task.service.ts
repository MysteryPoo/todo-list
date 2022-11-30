import type { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import { DateTime } from "luxon";

interface IGetTasksContract {
  data: {
    taskList: Array<{ id: number; title: string; type: TaskType; due: string }>;
  };
}

export default class TaskService {
  public getTasks(): Promise<Array<ITask>> {
    return fetch("dummyTasks.json")
      .then((res) => res.json())
      .then((d: IGetTasksContract) => {
        const taskList: Array<ITask> = [];
        for (const task of d.data.taskList) {
          taskList.push({
            id: task.id,
            title: task.title,
            type: task.type,
            due: new Date(task.due),
            dueDT: DateTime.fromISO(task.due),
          });
        }
        return taskList;
      });
  }
}
