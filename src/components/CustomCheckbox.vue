<template>
    <q-checkbox :model-value="modelValue" :size="size" :val="val" :rounded="rounded" :class="customClass"
        @update:model-value="$emit('update:modelValue', $event)" />
</template>

<script>
export default {
    name: 'CustomCheckbox',
    props: {
        modelValue: Boolean,
        size: String,
        val: String,
        rounded: Boolean,
        customClass: String,
    },
    emits: ['update:modelValue'],
};
</script>