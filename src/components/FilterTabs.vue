<template>
  <div class="row q-gutter-sm">
    <q-btn
      v-for="filter in filters"
      :key="filter.value"
      :outline="modelValue !== filter.value"
      :unelevated="modelValue === filter.value"
      :label="filter.label"
      :color="filter.color || 'primary'"
      size="sm"
      padding="xs md"
      @click="$emit('update:modelValue', filter.value)"
      :disable="disable"
      no-caps
    >
      <q-badge
        v-if="filter.count > 0"
        :color="modelValue === filter.value ? 'white' : filter.color || 'primary'"
        :text-color="modelValue === filter.value ? filter.color || 'primary' : 'white'"
        class="q-ml-xs"
      >
        {{ filter.count }}
      </q-badge>
    </q-btn>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  filters: {
    type: Array,
    required: true,
  },
  disable: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>
