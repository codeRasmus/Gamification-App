<template>
    <div class="feedback-container">
      <h2>Feedback</h2>
  
      <p><strong>Kategori:</strong> {{ category }}</p>
      <p><strong>Status:</strong> 
          {{ passed ? 'Bestået' : 'Ikke bestået' }}
      </p>
  
      <div class="feedback-text">
        <p>{{ passed ? feedbackPassed : feedbackFailed }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Feedback',
    props: {
      category: String,
      passed: Boolean,
      feedbackPassed: String,
      feedbackFailed: String
    }
  };
  </script>