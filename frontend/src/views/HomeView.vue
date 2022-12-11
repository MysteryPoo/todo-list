<template>
  <header>
    {{ lastUpdated }}
  </header>
  <main>
    <FieldSet legend="New Task" :toggleable="true" :collapsed="true">
      <NewTaskForm @new-task="newTask" />
      <UpdateTaskForm
        :visible="updateTaskVisible"
        :task="taskToUpdate"
        @close="updateTaskVisible = false"
        @update-task="requestUpdateTask"
      />
    </FieldSet>
    <FieldSet
      legend="Daily"
      :toggleable="true"
      :collapsed="dailyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        @complete-task="completeTask"
        :tasks="dailyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Weekly"
      :toggleable="true"
      :collapsed="weeklyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        :tasks="weeklyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Monthly"
      :toggleable="true"
      :collapsed="monthlyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        :tasks="monthlyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Quarterly"
      :toggleable="true"
      :collapsed="quarterlyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        :tasks="quarterlyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Yearly"
      :toggleable="true"
      :collapsed="yearlyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        :tasks="yearlyTasks"
      />
    </FieldSet>
    <DynamicDialog />
    <TheWelcome />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from "vue";
import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type INewTaskForm from "@/interfaces/newTaskForm.interface";
import type IUpdateTaskForm from "@/interfaces/updateTaskForm.interface";
import newTaskDto from "@/dtos/newtask.dto";
import type IUpdateTaskDTO from "@/dtos/updatetask.dto";
import TaskService from "@/services/task.service";
import TheWelcome from "../components/TheWelcome.vue";
import FieldSet from "primevue/fieldset";
import DynamicDialog from "primevue/dynamicdialog";
import TaskList from "@/components/TaskList.vue";
import NewTaskForm from "@/components/NewTaskForm.vue";
import UpdateTaskForm from "@/components/UpdateTaskForm.vue";
import { DateTime } from "luxon";
import { useActionStore, ActionType, type IAction } from "@/stores/action";

const store = useActionStore();
const taskService: TaskService = new TaskService();
const tasks: Ref<Array<ITask>> = ref([]);
const updateTaskVisible = ref(false);
const taskToUpdate: Ref<ITask | undefined> = ref(undefined);
const lastUpdated = ref("");
const refreshInterval: Ref<number | undefined> = ref(undefined);
const actionQueue: Ref<IAction[]> = ref([]);

onMounted(async () => {
  refreshInterval.value = setInterval(async () => {
    try {
      lastUpdated.value = await taskService.getLastUpdated();
      while (actionQueue.value.length > 0) {
        const action = actionQueue.value.shift();
        if (!action) return;
        try {
          switch (action.type) {
            case ActionType.CREATE: {
              const taskFromServer = await taskService.newTask(
                action.task as newTaskDto
              );
              for (const taskAction of actionQueue.value) {
                switch (taskAction.type) {
                  case ActionType.CREATE: {
                    const task = taskAction.task as newTaskDto;
                    if (task.id === (action.task as newTaskDto).id) {
                      task.id = taskFromServer.id;
                    }
                    break;
                  }
                  case ActionType.UPDATE: {
                    const task = taskAction.task as IUpdateTaskDTO;
                    if (task.id === (action.task as IUpdateTaskDTO).id) {
                      task.id = taskFromServer.id;
                    }
                    break;
                  }
                  case ActionType.DELETE: {
                    const task = taskAction.task as string;
                    if (task === (action.task as string)) {
                      taskAction.task = taskFromServer.id;
                    }
                    break;
                  }
                }
              }
              break;
            }
            case ActionType.UPDATE: {
              await taskService.updateTask(action.task as IUpdateTaskDTO);
              break;
            }
            case ActionType.DELETE: {
              await taskService.deleteTask(action.task as string);
              break;
            }
            default:
              throw new Error("Unknown action type in queue");
          }
        } catch {
          if (action.attempts++ < 5) actionQueue.value.unshift(action);
        }
      }
    } catch {
      console.log("There was an error.");
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

const dailyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.DAILY)
);
const weeklyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.WEEKLY)
);
const monthlyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.MONTHLY)
);
const quarterlyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.QUARTERLY)
);
const yearlyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.ANNUALLY)
);

async function newTask(newTask: INewTaskForm): Promise<void> {
  const midnight = DateTime.fromJSDate(newTask.due).plus({
    hour: -newTask.due.getHours(),
    minute: -newTask.due.getMinutes(),
    second: -newTask.due.getSeconds(),
    millisecond: -newTask.due.getMilliseconds(),
  });
  const task: newTaskDto = new newTaskDto(
    newTask.title,
    taskService.enumFromValue(newTask.taskType, TaskType),
    midnight,
    newTask.description
  );
  tasks.value.push({
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    due: task.due,
    completed: false,
    lastUpdated: DateTime.now(),
  });
  actionQueue.value.push({
    task: task,
    type: ActionType.CREATE,
    attempts: 0,
  });
}

async function requestUpdateTask(taskToUpdate: IUpdateTaskForm): Promise<void> {
  const task: IUpdateTaskDTO = {
    id: taskToUpdate.id,
    title: taskToUpdate.title,
    description: taskToUpdate.description,
    type: taskService.enumFromValue(taskToUpdate.taskType, TaskType),
    due: DateTime.fromJSDate(taskToUpdate.due),
    complete: taskToUpdate.complete,
  };
  actionQueue.value.push({
    task,
    type: ActionType.UPDATE,
    attempts: 0,
  });
  const cachedTask = tasks.value.find((t) => t.id === task.id);
  if (cachedTask) {
    cachedTask.title = task.title;
    cachedTask.due = task.due;
    cachedTask.description = task.description;
    cachedTask.type = task.type;
  }
  updateTaskVisible.value = false;
}

async function removeTask(id: string): Promise<void> {
  actionQueue.value.push({
    task: id,
    type: ActionType.DELETE,
    attempts: 0,
  });
  const index = tasks.value.findIndex((task: ITask) => task.id === id);
  if (index > -1) {
    tasks.value.splice(index, 1);
  }
}

function updateTask(id: string): void {
  console.log(`Editing ${id}`);
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;
  taskToUpdate.value = task;
  updateTaskVisible.value = true;
}

function completeTask(info: { id: string; isComplete: boolean }): void {
  // TODO: Refactor into smaller DTO
  console.log(`HomeView: Completing task with: ${info.isComplete}`);
  const taskToUpdate = tasks.value.find((task) => task.id === info.id);
  if (!taskToUpdate) return;
  const task: IUpdateTaskDTO = {
    id: taskToUpdate.id,
    title: taskToUpdate.title,
    description: taskToUpdate.description,
    type: taskToUpdate.type,
    due: taskToUpdate.due,
    complete: info.isComplete,
  };
  actionQueue.value.push({
    task: task,
    type: ActionType.UPDATE,
    attempts: 0,
  });
}

watch(lastUpdated, async () => (tasks.value = await taskService.getTasks()));
</script>

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
</style>
