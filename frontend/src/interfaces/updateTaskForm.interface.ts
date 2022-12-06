export default interface IForm {
  id: string;
  title: string;
  description?: string;
  taskType: string;
  due: Date;
  complete: boolean;
}
