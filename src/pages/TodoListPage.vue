<template>
    <q-page class="flex row flex-center">
        <div class="col-11 col-sm-10 col-md-8 col-lg-6">
            <q-card flat bordered>
                <q-card-section>
                    <div class="text-h6 text-center q-mb-md">My Tasks</div>

                    <!-- Input Section -->
                    <div class="row items-center no-wrap q-mb-md">
                        <CustomCheckbox
                            v-if="todos?.length > 0"
                            v-model="bulkActiveOrInactive"
                            size="lg"
                            val="primary"
                            rounded
                            customClass="q-mr-md"
                            :disable="todoStore.loading"
                        />
                        <CustomInput
                            v-model="newTodo"
                            placeholder="Add a new task..."
                            color="primary"
                            customClass="col-grow"
                            @enter="addTodo"
                            :disable="todoStore.loading"
                        />
                        <q-btn
                            round
                            color="primary"
                            icon="add"
                            size="md"
                            class="q-ml-sm"
                            @click="addTodo"
                            :disable="todoStore.loading || !newTodo.trim()"
                        >
                            <q-tooltip>Add Task</q-tooltip>
                        </q-btn>
                    </div>

                    <!-- Progress Bar -->
                    <div v-if="todos?.length > 0" class="q-mb-md">
                        <div class="row items-center justify-between q-mb-xs">
                            <span class="text-caption text-grey-7">Progress</span>
                            <span class="text-caption text-weight-medium">
                                {{ completedCount }} of {{ todos.length }} completed
                            </span>
                        </div>
                        <q-linear-progress
                            :value="progressPercent"
                            size="8px"
                            rounded
                            color="positive"
                            track-color="grey-3"
                        />
                    </div>

                    <!-- Filter Tabs -->
                    <FilterTabs
                        v-model="currentFilter"
                        :filters="filterOptions"
                        :disable="todoStore.loading"
                        class="q-mb-md"
                        @update:model-value="filterTodos"
                    />

                    <!-- Todo List -->
                    <q-list v-if="todos?.length > 0" bordered separator class="rounded-borders q-mb-md todo-list">
                        <q-item
                            v-for="todo in todos"
                            :key="todo.entity_id"
                            class="q-py-sm"
                        >
                            <q-item-section side>
                                <CustomCheckbox
                                    :model-value="todo.is_completed"
                                    size="md"
                                    @update:model-value="(newStatus) => updateTodoStatus(todo, newStatus)"
                                    :disable="todoStore.loading"
                                />
                            </q-item-section>

                            <q-item-section>
                                <span
                                    v-if="editingTodoId !== todo.entity_id"
                                    :class="{ 'text-strike text-grey-6': todo.is_completed }"
                                    @dblclick="startEditing(todo.entity_id)"
                                >
                                    {{ todo.title }}
                                </span>
                                <q-input
                                    v-else
                                    v-model="editingTodoText"
                                    dense
                                    autofocus
                                    borderless
                                    @blur="editItem(todo)"
                                    @keyup.enter="editItem(todo)"
                                    @keyup.esc="cancelEditing"
                                    :disable="todoStore.loading"
                                />
                            </q-item-section>

                            <q-item-section side>
                                <q-btn
                                    flat
                                    round
                                    dense
                                    icon="delete_outline"
                                    color="negative"
                                    size="sm"
                                    @click="removeItem(todo)"
                                    :disable="todoStore.loading"
                                >
                                    <q-tooltip>Delete</q-tooltip>
                                </q-btn>
                            </q-item-section>
                        </q-item>
                    </q-list>

                    <!-- Empty State -->
                    <div v-else class="text-center q-py-xl text-grey-6">
                        <q-icon name="task_alt" size="48px" class="q-mb-md" />
                        <div class="text-body1">No tasks yet</div>
                        <div class="text-caption">
                            {{ currentFilter === 'all' ? 'Add your first task above' : 'No ' + currentFilter + ' tasks' }}
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div v-if="todos?.length > 0" class="row items-center justify-between">
                        <div class="text-caption text-grey-7">
                            {{ activeCount }} task{{ activeCount !== 1 ? 's' : '' }} remaining
                        </div>
                        <q-btn
                            v-if="completedCount > 0"
                            flat
                            dense
                            label="Clear Completed"
                            color="negative"
                            size="sm"
                            @click="bulkRemoveTodo"
                            :disable="todoStore.loading"
                            no-caps
                        />
                    </div>
                </q-card-section>
            </q-card>

            <!-- Helper Text -->
            <div class="text-center text-caption text-grey-5 q-mt-sm">
                Double-click any task to edit it
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import CustomInput from '@/components/CustomInput.vue'
import CustomCheckbox from '@/components/CustomCheckbox.vue'
import FilterTabs from '@/components/FilterTabs.vue'
import { useTodoStore } from '@/stores/todo'
import { notifyFailure } from 'src/utils/notify'

const todoStore = useTodoStore()
const newTodo = ref('')
const editingTodoId = ref(null)
const editingTodoText = ref('')
const currentFilter = ref('all')

const todos = computed(() => {
    return todoStore.todos?.todos.slice().reverse() || []
})

const activeCount = computed(() => {
    return todos.value.filter(todo => !todo.is_completed).length
})

const completedCount = computed(() => {
    return todos.value.filter(todo => todo.is_completed).length
})

const progressPercent = computed(() => {
    if (todos.value.length === 0) return 0
    return completedCount.value / todos.value.length
})

const bulkActiveOrInactive = computed({
  get() {
    return todos.value.length > 0 && todos.value.every(todo => todo.is_completed);
  },
  set(value) {
    if (value) {
      bulkMarkAsCompleted();
    } else {
      bulkMarkAsPending();
    }
  },
});

const filterOptions = computed(() => [
  {
    label: 'All',
    value: 'all',
    count: todos.value.length,
    color: 'primary',
  },
  {
    label: 'Active',
    value: 'pending',
    count: activeCount.value,
    color: 'primary',
  },
  {
    label: 'Completed',
    value: 'completed',
    count: completedCount.value,
    color: 'positive',
  },
])

const cancelEditing = () => {
    editingTodoId.value = null
    editingTodoText.value = ''
}

// Start editing a task
const startEditing = (taskId) => {
    const task = todos.value.find((t) => t.entity_id === taskId)
    if (task) {
        editingTodoId.value = taskId
        editingTodoText.value = task.title
    }
}

// Fetch todos from the API based on the status filter
const fetchTodos = async (status) => {
    try {
        await todoStore.fetchTodos(status)
    } catch (error) {
        console.error('Failed to fetch todos:', error)
    }
}

// Filter todos
const filterTodos = (filter) => {
    fetchTodos(filter)
}

// Add a new task to the list using the API
const addTodo = async () => {
    if (newTodo.value.trim()) {
        const tempTodo = { entity_id: Date.now(), title: newTodo.value.trim(), is_completed: false };
        todos.value.unshift(tempTodo); // Optimistically add to the list
        newTodo.value = ''; // Clear input field

        try {
            await todoStore.addTodo({ title: tempTodo.title });
            await fetchTodos(currentFilter.value); // Refresh the todo list
        } catch (error) {
            todos.value.shift(); // Revert optimistic update
            notifyFailure(error.message);
        }
    }
};

const bulkMarkAsPending = async () => {
    todos.value.forEach((todo) => (todo.is_completed = false)); // Optimistically update all to incomplete
    try {
        await todoStore.markAllAsPending();
    } catch (error) {
        notifyFailure(error.message);
        await fetchTodos(currentFilter.value); // Revert changes if API fails
    }
};

const bulkMarkAsCompleted = async () => {
    todos.value.forEach((todo) => (todo.is_completed = true)); // Optimistically update all to completed
    try {
        await todoStore.markAllAsCompleted();
    } catch (error) {
        notifyFailure(error.message);
        await fetchTodos(currentFilter.value); // Revert changes if API fails
    }
};

// Update the completion status of a task
const updateTodoStatus = async (task, newStatus) => {
    const originalStatus = task.is_completed;
    task.is_completed = newStatus; // Optimistically update the status

    try {
        await todoStore.updateTodo(task.entity_id, { is_completed: task.is_completed });
    } catch (error) {
        task.is_completed = originalStatus; // Revert optimistic update
        notifyFailure(error.message);
    }
};

// Delete a task by its ID
const bulkRemoveTodo = async (taskId) => {
    try {
        await todoStore.bulkDeleteTodo(taskId)
        await fetchTodos(currentFilter.value)
    } catch (error) {
        notifyFailure(error.message)
    }
}

// Finish editing a task
const editItem = async (todo) => {
    const originalTitle = todo.title; // Store original title for rollback
    const newTitle = editingTodoText.value.trim();

    // Don't update if title hasn't changed or is empty
    if (!newTitle || newTitle === originalTitle) {
        cancelEditing();
        return;
    }

    // Optimistically update the UI
    todo.title = newTitle;
    cancelEditing(); // Exit edit mode immediately

    try {
        // Update in background
        await todoStore.updateTodo(todo.entity_id, { title: newTitle });
    } catch (error) {
        // Revert on error
        todo.title = originalTitle;
        notifyFailure(error.message);
    }
}

const removeItem = async (todo) => {
    const index = todos.value.findIndex((t) => t.entity_id === todo.entity_id);
    const removedTodo = todos.value.splice(index, 1)[0]; // Optimistically remove the task

    try {
        // Use DELETE HTTP method to delete the todo
        await todoStore.deleteTodo(todo.entity_id)
        cancelEditing()
    } catch (error) {
        todos.value.splice(index, 0, removedTodo); // Revert optimistic update
        notifyFailure(error.message)
    }
}

// Initial fetch of todos
onMounted(() => fetchTodos('all'))
</script>

<style scoped>
.todo-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
