import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type { INewTaskDto } from "@/dtos/newtask.dto";
import type { IUpdateTaskDto } from "@/dtos/updatetask.dto";
import { DateTime } from "luxon";
import { useEnumFromValue } from "@/composables/enumFromValue.composable";
import type { IDeleteTaskDto } from "@/dtos/deleteTask.dto";

export default class TaskService {
  private enumFromValue = useEnumFromValue().enumFromValue;

  constructor(public apiEndpoint: string) {}

  public async newTask(task: INewTaskDto): Promise<ITask> {
    const response = await fetch(`${this.apiEndpoint}/v1/tasks`, {
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
    const response = await fetch(`/api/v1/tasks`);
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

  public async getLastUpdated(): Promise<string> {
    const response = await fetch(`/api/v1/tasks/lastUpdated`);
    const d = await response.json();
    return d.lastUpdated;
  }

  public async updateTask(task: IUpdateTaskDto): Promise<ITask> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...body } = task;
    const response = await fetch(`${this.apiEndpoint}/v1/tasks/${task.id}`, {
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

  public async deleteTask(task: IDeleteTaskDto): Promise<ITask> {
    const response = await fetch(`${this.apiEndpoint}/v1/tasks/${task.id}`, {
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
}
