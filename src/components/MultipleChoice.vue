<template>
    <div class="question-container">
      <h2>Multiple Choice Spørgsmål</h2>
  
      <p><strong>Kategori:</strong> {{ category }}</p>
      <p><strong>Spørgsmål:</strong> {{ question }}</p>
      
      <div class="multiple-choice-options">
        <label v-for="(option, index) in options" :key="index">
            <input type="radio" :name="'answer'" :value="option" />
            {{ option }}
        </label>
      </div>
    </div>
  </template>

<script>
export default {
  name: 'MultipleChoice',
  props: {
    category: String,
    question: String,
    options: Array
  }
};
</script>