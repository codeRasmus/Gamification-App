<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

onMounted(() => {
  const form = document.querySelector("form");
  const statusMessage = document.querySelector(".statusMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:5500/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        statusMessage.style.display = "inline";
        statusMessage.style.color = "red";
        statusMessage.innerHTML = "Brugernavn eller adgangskode er forkert";
      }
    } catch (err) {
      console.error(err);
    }
  });
});
</script>

<template>
  <div class="loginComponent">
    <form class="card">
      <h1>GameMaster Login</h1>
      <p class="statusMessage"></p>
      <label for="username">Brugernavn</label>
      <input type="text" name="username" id="username" />

      <label for="password">Adgangskode</label>
      <input type="password" name="password" id="password" />

      <button type="submit">Login</button>
    </form>
  </div>
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

h1,
form h2 {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  color: #333;
}

label {
  font-family: "Arial", sans-serif;
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
  border-color: #551025;
  outline: none;
}

button {
  padding: 0.8rem 1.5rem;
  background-color: #8d1b3d;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

button:hover {
  background-color: #551025;
  transform: scale(1.05);
}

button:focus {
  outline: none;
}

.card {
  max-width: 600px;
}

.loginComponent {
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  background: #551025;
  background: linear-gradient(0deg, rgba(85, 16, 37, 1) 0%, rgba(141, 27, 61, 1) 100%);
}

h1 {
  text-align: left;
  font-size: 1.9rem;
}

.statusMessage {
  display: none;
}
</style>
