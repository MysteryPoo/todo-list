export interface IUpdateTaskForm {
  id: string;
  title: string;
  description?: string;
  taskType: string;
  due: Date;
  complete: boolean;
}
