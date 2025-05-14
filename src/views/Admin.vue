<script setup>
import { watch, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Host from "../components/Host.vue";

const router = useRouter();
const visibleCard = ref("card");
const menuOpen = ref(false);
const taskTableShow = ref(false);

const submissions = ref([]);
const sessions = ref([]);
const teams = ref([]);
const tasks = ref([]);

const selectedSession = ref("");
const selectedTeam = ref("");
const selectedSubmission = ref(null);
const filteredTeams = ref([]);
const filteredSubmissions = ref([]);

// Funktion til visning af card
function showCard(cardName) {
  visibleCard.value = cardName;

  // Bruges samtidig til at fjerne tabel hvis man ikke er på task-siden mere
  if (cardName === "card1" || cardName === "card" || cardName === "card2-4" || cardName === "card5") {
    taskTableShow.value = false;
  }
}

// Funktion til at toggle burger menu
function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

// Funktion til at lukke menu igen
function closeMenu() {
  menuOpen.value = false;
}

// Lifecycle hook som kører når admin.vue er loadet (mounted)
onMounted(async () => {
  if (!localStorage.getItem("token")) {
    router.push("/login");
    return;
  }

  // Logout
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      router.push("/login");
    });
  }

  // Henter submissions fra brugerne (besvarelser)
  try {
    const res = await fetch("http://localhost:5500/api/submission", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT Authentication,
      },
    });

    // Håndtering af submissions
    // Den udtrækker unikke sessions og teams via. set til sessions og map til teams
    // teams.value bliver et array med unikke teams bundet til en session
    if (res.ok) {
      submissions.value = await res.json();
      sessions.value = [...new Set(submissions.value.map((s) => s.sessionId))];
      const uniqueTeams = new Map();
      submissions.value.forEach((submission) => {
        if (!uniqueTeams.has(submission.teamName)) {
          uniqueTeams.set(submission.teamName, {
            teamName: submission.teamName,
          });
        }
      });
      teams.value = Array.from(uniqueTeams.values());
    } else if (res.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      alert("Kunne ikke hente submissions");
    }
  } catch (error) {
    console.error("Fejl ved hentning af submissions:", error);
    alert("Netværksfejl ved hentning af data.");
  }
});

// Filtrer teams ud fra session
watch([selectedSession, teams, submissions], ([session, allTeams, allSubmissions]) => {
  if (session) {
    filteredTeams.value = allTeams.filter((team) =>
      allSubmissions.some((submission) => submission.sessionId === session && submission.teamName === team.teamName)
    );
  } else {
    filteredTeams.value = [];
  }
});

// Filtrer submissions ud fra valgt team og session
watch([selectedTeam, selectedSession, teams, submissions], ([teamName, sessionId, _allTeams, allSubmissions]) => {
  if (teamName && sessionId) {
    const teamSubmissions = allSubmissions.filter((sub) => sub.teamName === teamName && sub.sessionId === sessionId);
    filteredSubmissions.value = teamSubmissions.flatMap((submission) => submission.answers);
  } else {
    filteredSubmissions.value = [];
  }
});

// Asynkron funktion til registrering af admin/gamemaster
const handleRegister = async (event) => {
  event.preventDefault();
  const username = event.target.username.value;
  const password = event.target.password.value;

  try {
    const response = await fetch("http://localhost:5500/api/admin/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Bruger oprettet!");
    } else if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      alert(data.message || "Fejl ved oprettelse");
    }
  } catch (err) {
    console.error(err);
    alert("Netværksfejl");
  }
};

// Asynkron funktion til sletning af enkelt task
const handleDelete = async (event) => {
  event.preventDefault();

  const deleteId = event.target.deleteId.value;

  if (deleteId.trim()) {
    try {
      const response = await fetch(`http://localhost:5500/api/tasks/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "DELETE",
      });

      if (response.ok) {
        alert("Task deleted successfully");
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert("Error deleting task");
      }
    } catch (error) {
      alert("Error deleting task: " + error.message);
    }
  } else {
    alert("Please provide a valid task ID");
  }
};
// Asynkron funktion til sletning af alle tasks
const handleDeleteAllTasks = async (event) => {
  event.preventDefault();

  if (!confirm("Er du sikker på, at du vil slette ALLE opgaver?")) return;

  try {
    const response = await fetch("http://localhost:5500/api/tasks", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      alert("Alle opgaver blev slettet.");
    } else if (response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      alert("Fejl under sletning af opgaver.");
    }
  } catch (error) {
    alert("Netværksfejl under sletning: " + error.message);
  }
};

// Asynkron funktion til opdatering af enkelt task
const handlePatchTask = async (event) => {
  event.preventDefault();

  const taskId = event.target.taskId.value;
  const updatedFields = {};

  const formElements = event.target.elements;
  Array.from(formElements).forEach((element) => {
    if (element.name && element.value) {
      updatedFields[element.name] = element.value;
    }
  });

  delete updatedFields.taskId;

  if (taskId.trim() && Object.keys(updatedFields).length > 0) {
    try {
      const response = await fetch(`http://localhost:5500/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        alert("Task updated successfully");
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert("Error updating task");
      }
    } catch (error) {
      alert("Error updating task: " + error.message);
    }
  } else {
    alert("Please provide a valid task ID and update some fields");
  }
};

// Asynkron funktion til upload af nye opgaver via. CSV fil
const handleFileUpload = async (event) => {
  event.preventDefault();

  const fileInput = event.target.fileInput.files[0];
  if (!fileInput) {
    alert("Vælg venligst en fil.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const csvText = e.target.result;

    try {
      const response = await fetch("http://localhost:5500/api/tasks/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "text/csv",
        },
        body: csvText,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Spørgsmålene blev opdateret!");
      } else {
        alert(data.message || "Fejl ved fil-upload");
      }
    } catch (error) {
      alert("Fejl ved upload af fil: " + error.message);
    }
  };

  reader.readAsText(fileInput);
};

// Asynkron funktion til at se alle tasks
const handleGetAllTasks = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch("http://localhost:5500/api/tasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) throw new Error(`Fejl under hentning: ${response.statusText}`);

    const data = await response.json();
    if (data.length === 0) {
      alert("Der er ingen opgaver i opgavebanken.");
    } else {
      taskTableShow.value = true;
      tasks.value = data;
    }
  } catch (err) {
    console.error(err);
    alert("Kunne ikke hente opgaver.");
  }
};
function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}
</script>

<template>
  <div class="menu">
    <div class="title">
      <a href="/admin">GameMaster Menu</a>
      <div class="hamburger" :class="{ active: menuOpen }" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <Transition name="nav-fade">
      <nav v-if="menuOpen" class="navMenu">
        <ul>
          <li>
            <a
              href="#"
              @click.prevent="
                showCard('card');
                closeMenu();
              "
              >Game</a
            >
          </li>
          <li>
            <a
              href="#"
              @click.prevent="
                showCard('card6');
                closeMenu();
              "
              >Se besvarelser</a
            >
          </li>
          <li>
            <a
              href="#"
              @click.prevent="
                showCard('card1');
                closeMenu();
              "
              >Se opgaver</a
            >
          </li>
          <li>
            <a
              href="#"
              @click.prevent="
                showCard('card2-4');
                closeMenu();
              "
              >Administrer Opgaver</a
            >
          </li>
          <li>
            <a
              href="#"
              @click.prevent="
                showCard('card5');
                closeMenu();
              "
              >Opret Admin</a
            >
          </li>
          <li><a id="logout" href="#" @click.prevent="logout">Log ud</a></li>
        </ul>
      </nav>
    </Transition>
    <div class="menuControls">
      <div v-show="visibleCard === 'card'" class="w-full"><Host /></div>

      <form v-show="visibleCard === 'card1'" @submit="handleGetAllTasks" class="card1">
        <label for="">Hent alle opgaver</label>
        <button type="submit">Hent</button>
      </form>
      <div class="table-wrapper">
        <p style="text-align: center" v-if="taskTableShow">Scroll på tabellen 👉</p>
        <table v-if="taskTableShow" id="scrollable-table" class="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Spørgsmål</th>
              <th>Kategori</th>
              <th>Kompetencetype</th>
              <th>Medie</th>
              <th>Opgavetype</th>
              <th>Sværhedsgrad</th>
              <th>Tid</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task._id">
              <td>{{ task._id }}</td>
              <td>{{ task.Spørgsmål }}</td>
              <td>{{ task.Kategori }}</td>
              <td>{{ task.Kompetencetype }}</td>
              <td>{{ task.Medie }}</td>
              <td>{{ task.Opgavetype }}</td>
              <td>{{ task.Sværhedsgrad }}</td>
              <td>{{ task.Tid }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <form v-show="visibleCard === 'card2-4'" action="http://localhost:5500/api/tasks" method="POST" class="card2">
        <h2>Tilføj opgave</h2>
        <label for="Spørgsmål">Spørgsmål</label>
        <input type="text" name="Spørgsmål" />

        <label for="Kategori">Vælg kategori:</label>
        <select name="Kategori">
          <option value="anerkendelse">Anerkendelse</option>
          <option value="situationsbestemt-ledelse">Situationsbestemt Ledelse</option>
          <option value="delegering">Delegering</option>
          <option value="konflikthåndtering">Konflikthåndtering</option>
          <option value="motivation">Motivation</option>
          <option value="foelge-mig-ledelse">Følge mig-ledelse</option>
          <option value="tilpasning">Tilpasning</option>
          <option value="udvikling">Udvikling</option>
          <option value="tryghed">Tryghed</option>
          <option value="kommunikation">Kommunikation</option>
        </select>

        <label for="Kompetencetype">Kompetencetype:</label>
        <select name="Kompetencetype">
          <option value="motivation-kommunikation">Motivation / Kommunikation</option>
          <option value="beslutningstagning">Beslutningstagning</option>
          <option value="udvikling-af-andre">Udvikling af andre</option>
          <option value="relationel-ledelse">Relationel ledelse</option>
          <option value="lederskab-samarbejde">Lederskab / Samarbejde</option>
          <option value="eksempelgivende-ledelse">Eksempelgivende ledelse</option>
          <option value="situationsforstaelse">Situationsforståelse</option>
          <option value="mentorrolle-delegering">Mentorrolle / Delegering</option>
          <option value="planlaegning-kommunikation">Planlægning / Kommunikation</option>
          <option value="empati-strategi">Empati / Strategi</option>
        </select>

        <label for="Sværhedsgrad">Sværhedsgrad:</label>
        <select name="Sværhedsgrad">
          <option value="let">Let</option>
          <option value="mellem">Mellem</option>
          <option value="svaer">Svær</option>
        </select>

        <label for="Opgavetype">Opgavetype:</label>
        <select name="Opgavetype">
          <option value="essay-refleksion">Essay / Refleksion</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="case">Case</option>
          <option value="scenarieopgave">Scenarieopgave</option>
          <option value="essay">Essay</option>
        </select>

        <label for="Medie">Medie:</label>
        <select name="Medie">
          <option value="video">Video</option>
          <option value="valg">Valg (radio buttons)</option>
          <option value="tekst">Tekst</option>
        </select>

        <label for="Tid">Tid i minutter:</label>
        <input name="Tid" type="number" min="1" />
        <button type="submit">Opret</button>
      </form>
      <!-- Opdater opgaver -->
      <form v-show="visibleCard === 'card2-4'" @submit="handlePatchTask" class="card3">
        <label for="taskId">Opgave ID</label>
        <input type="text" name="taskId" placeholder="Indtast ID på den opgave du vil opdatere" required />

        <label for="Spørgsmål">Spørgsmål</label>
        <input type="text" name="Spørgsmål" placeholder="Indtast nyt spørgsmål" />

        <label for="Kategori">Vælg kategori:</label>
        <select name="Kategori">
          <option value="">-- Vælg ny kategori --</option>
          <option value="Anerkendelse">Anerkendelse</option>
          <option value="Situationsbestemt ledelse">Situationsbestemt Ledelse</option>
          <option value="Delegering">Delegering</option>
          <option value="Konflikthåndtering">Konflikthåndtering</option>
          <option value="Motivation">Motivation</option>
          <option value="Følge mig-ledelse">Følge mig-ledelse</option>
          <option value="Tilpasning">Tilpasning</option>
          <option value="Udvikling">Udvikling</option>
          <option value="Tryghed">Tryghed</option>
          <option value="Kommunikation">Kommunikation</option>
        </select>

        <label for="Kompetencetype">Kompetencetype:</label>
        <select name="Kompetencetype">
          <option value="">-- Vælg ny kompetencetype --</option>
          <option value="Motivation / Kommunikation">Motivation / Kommunikation</option>
          <option value="Beslutningstagning">Beslutningstagning</option>
          <option value="Udvikling af andre">Udvikling af andre</option>
          <option value="Relationel ledelse">Relationel ledelse</option>
          <option value="Lederskab / Samarbejde">Lederskab / Samarbejde</option>
          <option value="Eksempelgivende ledelse">Eksempelgivende ledelse</option>
          <option value="Situationsforståelse">Situationsforståelse</option>
          <option value="Mentorrolle / Delegering">Mentorrolle / Delegering</option>
          <option value="Planlaegning / Kommunikation">Planlægning / Kommunikation</option>
          <option value="Empati Strategi">Empati / Strategi</option>
        </select>

        <label for="Sværhedsgrad">Sværhedsgrad:</label>
        <select name="Sværhedsgrad">
          <option value="">-- Vælg ny sværhedsgrad --</option>
          <option value="let">Let</option>
          <option value="mellem">Mellem</option>
          <option value="svaer">Svær</option>
        </select>

        <label for="Opgavetype">Opgavetype:</label>
        <select name="Opgavetype">
          <option value="">-- Vælg ny opgavetype --</option>
          <option value="essay-refleksion">Essay / Refleksion</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="case">Case</option>
          <option value="scenarieopgave">Scenarieopgave</option>
          <option value="essay">Essay</option>
        </select>

        <label for="Medie">Medie:</label>
        <select name="Medie">
          <option value="">-- Vælg nyt medie --</option>
          <option value="video">Video</option>
          <option value="valg">Valg (radio buttons)</option>
          <option value="tekst">Tekst</option>
        </select>

        <label for="Tid">Tid i minutter:</label>
        <input name="Tid" type="number" min="1" />

        <button type="submit">Opdater</button>
      </form>
      <!-- Slet opgave -->
      <form v-show="visibleCard === 'card2-4'" @submit="handleDelete" class="card4">
        <label for="deleteId">Slet specifik opgave</label>
        <input type="text" name="deleteId" placeholder="Skriv ID på den opgave du vil slette" required />
        <button type="submit">Slet</button>
      </form>
      <!-- Slet ALLE opgaver -->
      <form v-show="visibleCard === 'card2-4'" @submit="handleDeleteAllTasks" class="card4">
        <h3>Slet alle opgaver</h3>
        <button type="submit">Slet alle</button>
      </form>
      <!-- Tilføj nyt opgavesæt -->
      <form v-show="visibleCard === 'card2-4'" @submit="handleFileUpload" class="card">
        <h2>Upload spørgsmål</h2>

        <label for="fileInput">Vælg CSV-fil</label>
        <input type="file" id="fileInput" name="tasksFile" accept=".csv" required />

        <button type="submit">Upload</button>
      </form>
      <!-- Opret Admin -->
      <form v-show="visibleCard === 'card5'" @submit="handleRegister" class="card5">
        <h2>Opret admin</h2>
        <label for="username">Brugernavn</label>
        <input type="text" name="username" id="username" />

        <label for="password">Adgangskode</label>
        <input type="password" name="password" id="password" />

        <button type="submit">Opret bruger</button>
      </form>
      <form v-show="visibleCard === 'card6'" class="card6">
        <h2>Se besvarelser</h2>

        <label for="session">Vælg session:</label>
        <select id="session" v-model="selectedSession">
          <option disabled value="">-- Vælg session --</option>
          <option v-for="session in sessions" :key="session" :value="session">
            {{ session }}
          </option>
        </select>

        <label for="team">Vælg hold:</label>
        <select id="team" v-model="selectedTeam" :disabled="!selectedSession">
          <option disabled value="">-- Vælg hold --</option>
          <option v-for="team in filteredTeams" :key="team.teamName" :value="team.teamName">
            {{ team.teamName }}
          </option>
        </select>

        <div v-if="filteredSubmissions.length">
          <h3>Besvarelser</h3>
          <table id="besvarelser-table" class="styled-table">
            <thead>
              <tr>
                <th>Spørgsmål</th>
                <th>Svar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(answer, index) in filteredSubmissions" :key="index">
                <td>{{ answer.taskId.Spørgsmål }}</td>
                <td>{{ answer.answer }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="selectedTeam">Ingen besvarelser fundet.</p>
      </form>
    </div>
    <div class="footerImg"></div>
  </div>
</template>

<style scoped>
.w-full {
  width: 100%;
}

.menu {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f4f4;
}

.title {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.title a {
  color: #8d1b3d;
  font-size: 1.5rem;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  text-decoration: none;
  font-weight: bold;
}

.menuControls {
  flex: 1;
  padding: 120px 20px 60px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

form {
  min-width: 90%;
  width: 90%;
  max-width: 600px;
  margin-bottom: 30px;
  padding: 1.5rem 20px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

form h2 {
  color: #333;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  margin-bottom: 0.5rem;
}

label {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  color: #444;
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
  transition: border-color 0.3s ease;
}

input:focus,
select:focus {
  border-color: #8d1b3d;
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

#logout {
  background-color: white;
  color: #551025;
  margin-top: 20px;
  border: 1px solid #551025;

  text-align: center;
}

.card1,
.card2,
.card3,
.card4,
.card5 {
  max-width: 800px;
}

.hamburger {
  width: 30px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
}

.hamburger span {
  display: block;
  height: 4px;
  background: #8d1b3d;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.navMenu {
  height: 100%;
  position: fixed;
  top: 100px;
  left: 0;
  width: 100%;
  background: #8d1b3d;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.navMenu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.navMenu ul li a {
  font-size: 20px;
  color: white;
  text-decoration: none;
  display: block;
  padding: 15px 20px 15px 0px;
  margin: 0 40px 0 0;
  border-bottom: 1px solid #ffffff;
  transition: background-color 0.2s;
}

.navMenu ul li a:hover {
  background-color: #a12a4d;
}

.nav-fade-enter-active,
.nav-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.nav-fade-enter-from,
.nav-fade-leave-to {
  opacity: 0;
  transform: translateX(400px);
}

.nav-fade-enter-to,
.nav-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

#besvarelser-table {
  width: 100%;
}

.styled-table {
  font-family: Verdana;
  max-width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 10px;
  text-align: left;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 50px;
}

.styled-table th,
.styled-table td {
  padding: 10px 7px;
  border: 1px solid #ddd;
}

.styled-table th {
  background-color: #8d1b3d;
  color: white;
  font-weight: bold;
}

.styled-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.styled-table tr:hover {
  background-color: #f1f1f1;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* For smooth scrolling på iOS-enheder */
  max-width: 100%; /* Forhindrer bredden i at gå ud over containeren */
}

.styled-table {
  width: 100%;
}

#scrollable-table {
  min-width: 800px;
  border-collapse: collapse;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

#scrollable-table th,
#scrollable-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}

/* Footer */
.footerImg {
  height: 120px;
  background: url("../assets/adminFooter.jpg") center/cover no-repeat;
  flex-shrink: 0;
}
</style>
