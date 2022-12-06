import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type INewTaskDTO from "@/dtos/newtask.dto";
import type IUpdateTaskDTO from "@/dtos/updatetask.dto";
import { DateTime } from "luxon";

export default class TaskService {
  public async newTask(task: INewTaskDTO): Promise<ITask> {
    const response = await fetch("http://localhost:3000/v1/tasks", {
      method: "POST",
      headers: {
        //Authorization: `Bearer ${window.localStorage.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (response.status === 201) {
      const taskFromServer = await response.json();
      return {
        id: taskFromServer._id,
        title: taskFromServer.title,
        type: this.enumFromValue(taskFromServer.type, TaskType),
        due: DateTime.fromISO(taskFromServer.due),
        completed: taskFromServer.complete,
        lastUpdated: DateTime.fromISO(taskFromServer.lastUpdated),
      };
    }
    throw new Error("Unknown error occurred");
  }

  public async getTasks(): Promise<Array<ITask>> {
    const response = await fetch("http://localhost:3000/v1/tasks");
    const d = await response.json();
    const taskList: Array<ITask> = [];
    for (const task of d) {
      taskList.push({
        id: task._id,
        title: task.title,
        type: this.enumFromValue(task.type, TaskType),
        due: DateTime.fromISO(task.due),
        completed: task.complete,
        lastUpdated: DateTime.fromISO(task.lastUpdated),
      });
    }
    return taskList;
  }

  public async updateTask(task: IUpdateTaskDTO): Promise<ITask> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...body } = task;
    const response = await fetch(`http://localhost:3000/v1/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        //Authorization: `Bearer ${window.localStorage.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.status === 200) {
      const taskFromServer = await response.json();
      return {
        id: taskFromServer._id,
        title: taskFromServer.title,
        type: this.enumFromValue(taskFromServer.type, TaskType),
        due: DateTime.fromISO(taskFromServer.due),
        completed: taskFromServer.complete,
        lastUpdated: DateTime.fromISO(taskFromServer.lastUpdated),
      };
    }
    throw new Error("Unknown error occurred");
  }

  public async deleteTask(id: string): Promise<ITask> {
    const response = await fetch(`http://localhost:3000/v1/tasks/${id}`, {
      method: "DELETE",
    });
    if (response.status === 200) {
      const taskFromServer = await response.json();
      return {
        id: taskFromServer._id,
        title: taskFromServer.title,
        type: this.enumFromValue(taskFromServer.type, TaskType),
        due: DateTime.fromISO(taskFromServer.due),
        completed: taskFromServer.complete,
        lastUpdated: DateTime.fromISO(taskFromServer.lastUpdated),
      };
    }
    throw new Error("Unknown error occurred");
  }

  public enumFromValue<T extends Record<string, string>>(
    val: string,
    _enum: T
  ) {
    const enumName = (Object.keys(_enum) as Array<keyof T>).find(
      (k) => _enum[k] === val
    );
    if (!enumName) throw Error(); // here fail fast as an example
    return _enum[enumName];
  }
}
