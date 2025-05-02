<script setup>
</script>

<template>
  <h1>Login</h1>
  <form action="http://localhost:5500/api/admin/login" method="POST" class="card">
    <h2>Log in</h2>
    <label for="username">Brugernavn</label>
    <input type="text" name="username" id="username" />

    <label for="password">Adgangskode</label>
    <input type="password" name="password" id="password" />

    <button type="submit">Login</button>
    </form>
</template>

<style scoped>
form {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 20px;
}

h1, form h2 {
  font-family: 'Arial', sans-serif;
  color: #333;
}

label {
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.5rem;
}

input[type="text"],
input[type="number"],
input[type="password"],
select {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #f9f9f9;
  margin-bottom: 1rem;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  border-color: #0057b7;
  outline: none;
}

button {
  padding: 0.8rem 1.5rem;
  background-color: #0057b7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

button:hover {
  background-color: #004099;
  transform: scale(1.05);
}

button:focus {
  outline: none;
}

.card {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}
</style>

