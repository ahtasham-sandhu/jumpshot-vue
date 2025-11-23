<template>
    <q-input v-model="inputValue" :placeholder="placeholder" :color="color" :class="customClass"
        @keyup.enter="$emit('enter')" />
</template>

<script>
export default {
    name: 'CustomInput',
    props: {
        modelValue: String,
        placeholder: String,
        color: String,
        customClass: String,
    },
    computed: {
        inputValue: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            },
        },
    },
    emits: ['update:modelValue', 'enter'],
};
</script>