<template>
  <Dialog
    header="New Task"
    v-model:visible="$props.visible"
    :modal="true"
    :closable="false"
  >
    <div class="form">
      <label for="title" class="label">Title</label>
      <InputText id="title" type="text" v-model="form.title" />
      <label for="description" class="label">Description</label>
      <InputText id="description" type="text" v-model="form.description" />
      <label for="tasktype" class="label">Period</label>
      <Dropdown
        id="tasktype"
        v-model="form.taskType"
        :options="tasktypes"
        placeholder="Select period"
      />
    </div>
    <template #footer>
      <Button icon="pi pi-plus" @click="submit" label="Submit" />
      <Button icon="pi pi-times" label="Cancel" @click="$emit('close')" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, type Ref, watch } from "vue";
import type { INewTaskForm } from "@/interfaces/newTaskForm.interface";
import { NewTaskDto, type INewTaskDto } from "@/dtos/newtask.dto";
import { TaskType } from "@/enums/tasktype.enum";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { DateTime } from "luxon";

const props = defineProps<{
  visible: boolean;
  defaultType?: TaskType;
}>();

const emit = defineEmits<{
  (e: "new-task", form: INewTaskDto): void;
  (e: "close"): void;
}>();

const tasktypes: Ref<string[]> = ref([]);

for (const value of Object.keys(TaskType)) {
  tasktypes.value.push(TaskType[value as keyof typeof TaskType]);
}

const form: Ref<INewTaskForm> = ref({
  title: "",
  description: undefined,
  taskType: "",
  due: new Date(),
});

watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      form.value.title = "";
      form.value.description = "";
      form.value.due = new Date();
      form.value.taskType = props.defaultType ?? "";
    }
  }
);

function submit(): void {
  form.value.due = beginningOfPeriod(getTaskType(form.value.taskType));
  emit("new-task", NewTaskDto.fromForm(form.value));
}

function getTaskType(type: string): TaskType {
  switch (type) {
    case "Daily":
      return TaskType.DAILY;
    case "Weekly":
      return TaskType.WEEKLY;
    case "Monthly":
      return TaskType.MONTHLY;
    case "Quarterly":
      return TaskType.QUARTERLY;
    case "Annually":
      return TaskType.ANNUALLY;
    default:
      throw new Error("Invalid TaskType provided.");
  }
}

function beginningOfPeriod(period: TaskType): Date {
  switch (period) {
    case TaskType.DAILY:
      return DateTime.fromJSDate(new Date()).startOf("day").toJSDate();
    case TaskType.WEEKLY:
      return DateTime.fromJSDate(new Date()).startOf("week").toJSDate();
    case TaskType.MONTHLY:
      return DateTime.fromJSDate(new Date()).startOf("month").toJSDate();
    case TaskType.QUARTERLY:
      return DateTime.fromJSDate(new Date()).startOf("quarter").toJSDate();
    case TaskType.ANNUALLY:
      return DateTime.fromJSDate(new Date()).startOf("year").toJSDate();
    default:
      throw new Error("Invalid TaskType provided.");
  }
}
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  .label {
    font-size: x-large;
    font-weight: 600;
    margin-right: 1rem;
    color: darkslategrey;
  }
}
</style>
