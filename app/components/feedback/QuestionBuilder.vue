<template>
  <div class="space-y-3">
    <article v-for="(question, index) in questions" :key="question.localId" class="card card-border bg-base-100">
      <div class="card-body gap-4 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
          <span class="badge badge-ghost mt-1">{{ index + 1 }}</span>
          <fieldset class="fieldset flex-1"><legend class="fieldset-legend">Question</legend><input v-model="question.prompt" class="input w-full" placeholder="What should the tester answer?" /></fieldset>
          <fieldset class="fieldset sm:w-48"><legend class="fieldset-legend">Answer type</legend><select v-model="question.type" class="select w-full"><option v-for="type in types" :key="type" :value="type">{{ label(type) }}</option></select></fieldset>
          <button type="button" class="btn btn-ghost btn-sm text-error" title="Remove question" @click="remove(index)"><Icon name="lucide:trash-2" /></button>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <fieldset class="fieldset"><legend class="fieldset-legend">Help text <span class="font-normal text-base-content/40">optional</span></legend><input v-model="question.help_text" class="input w-full" placeholder="Clarify what you want the tester to consider" /></fieldset>
          <fieldset v-if="choiceTypes.includes(question.type)" class="fieldset"><legend class="fieldset-legend">Choices</legend><input v-model="question.optionsText" class="input w-full" placeholder="One choice, Another choice, Other" /><p class="label">Separate choices with commas.</p></fieldset>
          <template v-if="question.type === 'RATING'">
            <fieldset class="fieldset"><legend class="fieldset-legend">Scale</legend><div class="grid grid-cols-2 gap-2"><input v-model.number="question.rating_min" type="number" min="0" max="9" class="input w-full" aria-label="Minimum rating" /><input v-model.number="question.rating_max" type="number" min="1" max="10" class="input w-full" aria-label="Maximum rating" /></div></fieldset>
            <fieldset class="fieldset"><legend class="fieldset-legend">Scale labels</legend><div class="grid grid-cols-2 gap-2"><input v-model="question.low_label" class="input w-full" placeholder="Very difficult" /><input v-model="question.high_label" class="input w-full" placeholder="Very easy" /></div></fieldset>
          </template>
        </div>
        <label class="label cursor-pointer justify-start gap-3"><input v-model="question.required" type="checkbox" class="checkbox checkbox-sm" /><span>Required question</span></label>
      </div>
    </article>
    <button type="button" class="btn btn-outline btn-sm" @click="add"><Icon name="lucide:plus" />Add question</button>
  </div>
</template>

<script setup>
const questions = defineModel({ type: Array, required: true })
const types = ['SHORT_TEXT', 'LONG_TEXT', 'YES_NO', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RATING']
const choiceTypes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']
const label = value => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
const makeQuestion = () => ({ localId: crypto.randomUUID(), prompt: '', help_text: '', type: 'LONG_TEXT', options: [], optionsText: '', required: false, rating_min: 1, rating_max: 5, low_label: '', high_label: '' })
const add = () => questions.value.push(makeQuestion())
const remove = index => questions.value.splice(index, 1)
</script>
