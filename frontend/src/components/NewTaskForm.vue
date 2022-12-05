<template>
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
    <Button icon="pi pi-plus" @click="$emit('new-task', form)" label="Submit" />
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref } from "vue";
import type INewTaskForm from "@/interfaces/newTaskForm.interface";
import { TaskType } from "@/enums/tasktype.enum";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

defineEmits<{
  (e: "new-task", form: INewTaskForm): void;
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
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  .label {
    font-size: x-large;
    font-weight: 600;
    margin-right: 1rem;
    color: whitesmoke;
  }
}
</style>
