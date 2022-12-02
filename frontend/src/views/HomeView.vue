<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";
import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type INewTaskDTO from "@/dtos/newtask.dto";
import TaskService from "@/services/task.service";
import TheWelcome from "../components/TheWelcome.vue";
import FieldSet from "primevue/fieldset";
import TaskList from "@/components/TaskList.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import { DateTime } from "luxon";

const taskService: TaskService = new TaskService();
const tasks: Ref<Array<ITask>> = ref([]);

onMounted(async () => {
  tasks.value = await taskService.getTasks();
});

const dailyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.DAILY)
);
const weeklyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.WEEKLY)
);

function newTask() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const task: INewTaskDTO = {
    title: title.value,
    description: description.value !== "" ? description.value : undefined,
    type: taskService.enumFromValue(tasktype.value, TaskType),
    due: DateTime.fromJSDate(due.value),
  };
}

const tasktypes = ref(["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]);

const title = ref("");
const description = ref("");
const tasktype = ref("");
const due = ref();
</script>

<template>
  <main>
    <FieldSet
      class="dark"
      legend="New Task"
      :toggleable="true"
      :collapsed="true"
    >
      <div class="form">
        <label for="title" class="label">Title</label>
        <InputText id="title" type="text" v-model="title" />
        <label for="description" class="label">Description</label>
        <InputText id="description" type="text" v-model="description" />
        <label for="tasktype" class="label">Period</label>
        <Dropdown
          id="tasktype"
          v-model="tasktype"
          :options="tasktypes"
          placeholder="Select period"
        />
        <label for="due" class="label">Due Date</label>
        <Calendar inputId="due" v-model="due" autocomplete="off" />
        <Button icon="pi pi-plus" @click="newTask" label="Submit" />
      </div>
    </FieldSet>
    <FieldSet
      class="dark"
      legend="Daily"
      :toggleable="true"
      :collapsed="dailyTasks.length === 0"
    >
      <TaskList :tasks="dailyTasks" />
    </FieldSet>
    <FieldSet
      legend="Weekly"
      :toggleable="true"
      :collapsed="weeklyTasks.length === 0"
    >
      <TaskList :tasks="weeklyTasks" />
    </FieldSet>
    <TheWelcome />
  </main>
</template>

<style lang="scss" scoped>
.p-fieldset {
  background-color: rgba(25, 25, 25, 0.8);
  :deep(.p-fieldset-legend) {
    background-color: rgba(50, 50, 50, 0.8);
  }
  :deep(.p-fieldset-legend-text) {
    color: white;
  }
}
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
