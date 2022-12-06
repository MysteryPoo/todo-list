<template>
  <Dialog
    header="Update Task"
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
        @click="$emit('update-task', form)"
        label="Submit"
      />
      <Button icon="pi pi-times" label="Cancel" @click="$emit('close')" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, type Ref } from "vue";
import type IUpdateTaskForm from "@/interfaces/updateTaskForm.interface";
import { TaskType } from "@/enums/tasktype.enum";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import type ITask from "@/interfaces/task.interface";

const props = defineProps<{
  visible: boolean;
  task: ITask | undefined;
}>();

defineEmits<{
  (e: "update-task", form: IUpdateTaskForm): void;
  (e: "close"): void;
}>();

const tasktypes: Ref<string[]> = ref([]);

for (const value of Object.keys(TaskType)) {
  tasktypes.value.push(TaskType[value as keyof typeof TaskType]);
}

const form: Ref<IUpdateTaskForm> = ref({
  id: "",
  title: "",
  description: undefined,
  taskType: "",
  due: new Date(),
  complete: false,
});

watch(
  () => props.visible,
  (newValue) => {
    if (newValue && props.task) {
      form.value.id = props.task.id;
      form.value.title = props.task.title;
      form.value.description = props.task.description;
      form.value.taskType = props.task.type;
      form.value.due = new Date(props.task.due.toISO());
      form.value.complete = props.task.completed;
    }
  }
);
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
