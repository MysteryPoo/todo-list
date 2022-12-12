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
      <label for="due" class="label">Due Date</label>
      <Calendar inputId="due" v-model="form.due" autocomplete="off" />
    </div>
    <template #footer>
      <Button
        icon="pi pi-plus"
        @click="$emit('new-task', convertFormToDto())"
        label="Submit"
      />
      <Button icon="pi pi-times" label="Cancel" @click="$emit('close')" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, type Ref } from "vue";
import type INewTaskForm from "@/interfaces/newTaskForm.interface";
import newTaskDto from "@/dtos/newtask.dto";
import { TaskType } from "@/enums/tasktype.enum";
import TaskService from "@/services/task.service";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import { useMidnight } from "@/composables/midnight";

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  (e: "new-task", form: newTaskDto): void;
  (e: "close"): void;
}>();

const tasktypes: Ref<string[]> = ref([]);

for (const value of Object.keys(TaskType)) {
  tasktypes.value.push(TaskType[value as keyof typeof TaskType]);
}

const taskService = new TaskService();
const midnight = useMidnight();

const form: Ref<INewTaskForm> = ref({
  title: "",
  description: undefined,
  taskType: "",
  due: new Date(),
});

function convertFormToDto(): newTaskDto {
  return new newTaskDto(
    form.value.title,
    taskService.enumFromValue(form.value.taskType, TaskType),
    midnight.getMidnight(form.value.due),
    form.value.description
  );
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
