<script setup>
defineProps(['modelValue', 'rules', 'label'])
defineEmits(['update:modelValue'])
</script>

<template lang="pug">
q-input.col(
  :model-value="modelValue"
  :label="label"
  lazy-rules
  :rules="[val => !!val || 'Obrigatório']"
  mask="##/##/####"
  clearable
  @update:model-value="val => $emit('update:modelValue', val)"
)
  template(#append)
    q-icon.cursor-pointer(name="event")
      q-popup-proxy(
        transition-show="scale"
        transition-hide="scale"
        cover
      )
        q-date(
          :model-value="modelValue"
          mask="DD/MM/YYYY"
          @update:model-value="val => $emit('update:modelValue', val)"
        )
</template>
