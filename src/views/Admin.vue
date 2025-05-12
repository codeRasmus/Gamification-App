<script setup>
import { watch, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Host from "../components/Host.vue";

const router = useRouter();
const visibleCard = ref("card");

const submissions = ref([]);
const sessions = ref([]);
const teams = ref([]);

const selectedSession = ref("");
const selectedTeam = ref("");
const selectedSubmission = ref(null);
const filteredTeams = ref([]);
const filteredSubmissions = ref([]);

function showCard(cardName) {
  visibleCard.value = cardName;
}

onMounted(async () => {
  if (!localStorage.getItem("token")) {
    router.push("/login");
    return;
  }

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      router.push("/login");
    });
  }

  const hamburger = document.querySelector(".hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      toggleMenu(this);
    });
  }

  try {
    const res = await fetch("http://localhost:5500/api/submission", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.ok) {
      submissions.value = await res.json();

      // Sessions udtrækkes fra submissions
      sessions.value = [...new Set(submissions.value.map((s) => s.sessionId))];

      // Teams udtrækkes unikt ud fra teamName
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
watch(
  [selectedSession, teams, submissions],
  ([session, allTeams, allSubmissions]) => {
    if (session) {
      filteredTeams.value = allTeams.filter((team) =>
        allSubmissions.some(
          (submission) =>
            submission.sessionId === session &&
            submission.teamName === team.teamName
        )
      );
    } else {
      filteredTeams.value = [];
    }
  }
);

// Filtrer submissions ud fra valgt team og session
watch(
  [selectedTeam, selectedSession, teams, submissions],
  ([teamName, sessionId, _allTeams, allSubmissions]) => {
    if (teamName) {
      filteredSubmissions.value = allSubmissions.filter(
        (sub) => sub.teamName === teamName && sub.sessionId === sessionId
      );
    } else {
      filteredSubmissions.value = [];
    }
  }
);

function toggleMenu(el) {
  el.classList.toggle("active");
  document.querySelector(".navMenu").classList.toggle("show");
}

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

const handleDelete = async (event) => {
  event.preventDefault();

  const deleteId = event.target.deleteId.value;

  if (deleteId.trim()) {
    try {
      const response = await fetch(
        `http://localhost:5500/api/tasks/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          method: "DELETE",
        }
      );

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
      const response = await fetch(
        `http://localhost:5500/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedFields),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        alert("Task updated successfully");
        console.log(updatedTask);
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
</script>

<template>
  <div class="menu">
    <div class="title">
      <a href="/admin">GameMaster Menu</a>
      <div class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <nav class="navMenu">
      <ul>
        <li><a href="#" @click.prevent="showCard('card')">Game</a></li>
        <li><a href="#" @click.prevent="showCard('card1')">Se opgaver</a></li>
        <li>
          <a href="#" @click.prevent="showCard('card2-4')"
            >Administrer Opgaver</a
          >
        </li>
        <li><a href="#" @click.prevent="showCard('card5')">Opret Admin</a></li>
        <li>
          <a href="#" @click.prevent="showCard('card6')">Se besvarelser</a>
        </li>
        <li><a href="#" id="logout">Log ud</a></li>
      </ul>
    </nav>
    <div class="menuControls">
      <div v-show="visibleCard === 'card'" class="w-full"><Host /></div>
      <form
        v-show="visibleCard === 'card1'"
        action="http://localhost:5500/api/tasks"
        method="GET"
        class="card"
      >
        <label for="">Hent alle opgaver</label>
        <button type="submit">Hent</button>
      </form>
      <form
        v-show="visibleCard === 'card1'"
        @submit="handleGetTask"
        class="card1"
      >
        <label for="taskId">Hent specifik opgave</label>
        <input
          type="text"
          name="taskId"
          placeholder="Indtast ID på den opgave du vil hente"
          required
        />
        <button type="submit">Hent</button>
      </form>

      <!-- Tilføj opgave -->
      <form
        v-show="visibleCard === 'card2-4'"
        action="http://localhost:5500/api/tasks"
        method="POST"
        class="card2"
      >
        <h2>Tilføj opgave</h2>
        <label for="Spørgsmål">Spørgsmål</label>
        <input type="text" name="Spørgsmål" id="Spørgsmål" />

        <label for="Kategori">Vælg kategori:</label>
        <select id="Kategori" name="Kategori">
          <option value="anerkendelse">Anerkendelse</option>
          <option value="situationsbestemt-ledelse">
            Situationsbestemt Ledelse
          </option>
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
        <select id="Kompetencetype" name="Kompetencetype">
          <option value="motivation-kommunikation">
            Motivation / Kommunikation
          </option>
          <option value="beslutningstagning">Beslutningstagning</option>
          <option value="udvikling-af-andre">Udvikling af andre</option>
          <option value="relationel-ledelse">Relationel ledelse</option>
          <option value="lederskab-samarbejde">Lederskab / Samarbejde</option>
          <option value="eksempelgivende-ledelse">
            Eksempelgivende ledelse
          </option>
          <option value="situationsforstaelse">Situationsforståelse</option>
          <option value="mentorrolle-delegering">
            Mentorrolle / Delegering
          </option>
          <option value="planlaegning-kommunikation">
            Planlægning / Kommunikation
          </option>
          <option value="empati-strategi">Empati / Strategi</option>
        </select>

        <label for="Sværhedsgrad">Sværhedsgrad:</label>
        <select id="Sværhedsgrad" name="Sværhedsgrad">
          <option value="let">Let</option>
          <option value="mellem">Mellem</option>
          <option value="svaer">Svær</option>
        </select>

        <label for="Opgavetype">Opgavetype:</label>
        <select id="Opgavetype" name="Opgavetype">
          <option value="essay-refleksion">Essay / Refleksion</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="case">Case</option>
          <option value="scenarieopgave">Scenarieopgave</option>
          <option value="essay">Essay</option>
        </select>

        <label for="Medie">Medie:</label>
        <select id="Medie" name="Medie">
          <option value="video">Video</option>
          <option value="valg">Valg (radio buttons)</option>
          <option value="tekst">Tekst</option>
        </select>

        <label for="Tid">Tid i minutter:</label>
        <input name="Tid" id="Tid" type="number" min="1" />
        <button type="submit">Opret</button>
      </form>

      <!-- Opdater opgaver -->
      <form
        v-show="visibleCard === 'card2-4'"
        @submit="handlePatchTask"
        class="card3"
      >
        <label for="taskId">Opgave ID</label>
        <input
          type="text"
          name="taskId"
          placeholder="Enter task ID to update"
          required
        />

        <label for="Spørgsmål">Spørgsmål</label>
        <input
          type="text"
          name="Spørgsmål"
          placeholder="Indtast nyt spørgsmål"
        />

        <label for="Kategori">Vælg kategori:</label>
        <select id="Kategori" name="Kategori">
          <option value="">-- Vælg ny kategori --</option>
          <option value="anerkendelse">Anerkendelse</option>
          <option value="situationsbestemt-ledelse">
            Situationsbestemt Ledelse
          </option>
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
        <select id="Kompetencetype" name="Kompetencetype">
          <option value="">-- Vælg ny kompetencetype --</option>
          <option value="motivation-kommunikation">
            Motivation / Kommunikation
          </option>
          <option value="beslutningstagning">Beslutningstagning</option>
          <option value="udvikling-af-andre">Udvikling af andre</option>
          <option value="relationel-ledelse">Relationel ledelse</option>
          <option value="lederskab-samarbejde">Lederskab / Samarbejde</option>
          <option value="eksempelgivende-ledelse">
            Eksempelgivende ledelse
          </option>
          <option value="situationsforstaelse">Situationsforståelse</option>
          <option value="mentorrolle-delegering">
            Mentorrolle / Delegering
          </option>
          <option value="planlaegning-kommunikation">
            Planlægning / Kommunikation
          </option>
          <option value="empati-strategi">Empati / Strategi</option>
        </select>

        <label for="Sværhedsgrad">Sværhedsgrad:</label>
        <select id="Sværhedsgrad" name="Sværhedsgrad">
          <option value="">-- Vælg ny sværhedsgrad --</option>
          <option value="let">Let</option>
          <option value="mellem">Mellem</option>
          <option value="svaer">Svær</option>
        </select>

        <label for="Opgavetype">Opgavetype:</label>
        <select id="Opgavetype" name="Opgavetype">
          <option value="">-- Vælg ny opgavetype --</option>
          <option value="essay-refleksion">Essay / Refleksion</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="case">Case</option>
          <option value="scenarieopgave">Scenarieopgave</option>
          <option value="essay">Essay</option>
        </select>

        <label for="Medie">Medie:</label>
        <select id="Medie" name="Medie">
          <option value="">-- Vælg nyt medie --</option>
          <option value="video">Video</option>
          <option value="valg">Valg (radio buttons)</option>
          <option value="tekst">Tekst</option>
        </select>

        <label for="Tid">Tid i minutter:</label>
        <input name="Tid" id="Tid" type="number" min="1" />

        <button type="submit">Opdater</button>
      </form>

      <!-- Slet opgave -->
      <form
        v-show="visibleCard === 'card2-4'"
        @submit="handleDelete"
        class="card4"
      >
        <label for="deleteId">Slet specifik opgave</label>
        <input
          type="text"
          name="deleteId"
          placeholder="Skriv ID på den opgave du vil slette"
          required
        />
        <button type="submit">Slet</button>
      </form>

      <!-- Slet ALLE opgaver -->
      <form
        v-show="visibleCard === 'card2-4'"
        @submit="handleDeleteAllTasks"
        class="card4"
      >
        <h3>Slet alle opgaver</h3>
        <button type="submit">Slet alle</button>
      </form>

      <!-- Tilføj nyt opgavesæt -->
      <form
        v-show="visibleCard === 'card2-4'"
        @submit="handleFileUpload"
        class="card"
      >
        <h2>Upload CSV-fil med nye spørgsmål</h2>

        <label for="fileInput">Vælg CSV-fil</label>
        <input
          type="file"
          id="fileInput"
          name="tasksFile"
          accept=".csv"
          required
        />

        <button type="submit">Upload</button>
      </form>

      <!-- Opret Admin -->
      <form
        v-show="visibleCard === 'card5'"
        @submit="handleRegister"
        class="card5"
      >
        <h2>Opret admin</h2>
        <label for="username">Brugernavn</label>
        <input type="text" name="username" id="username" />

        <label for="password">Adgangskode</label>
        <input type="password" name="password" id="password" />

        <button type="submit">Opret bruger</button>
      </form>
      <form v-show="visibleCard === 'card6'" class="card6">
        <h2>Hent besvarelser</h2>

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
          <option
            v-for="team in filteredTeams"
            :key="team.teamId"
            :value="team.teamId"
          >
            {{ team.teamName }}
          </option>
        </select>

        <label for="submission">Vælg besvarelse:</label>
        <select
          id="submission"
          v-model="selectedSubmission"
          :disabled="!selectedTeam"
        >
          <option disabled value="">-- Vælg besvarelse --</option>
          <option
            v-for="submission in filteredSubmissions"
            :key="submission._id"
            :value="submission._id"
          >
            {{ submission._id }}
          </option>
        </select>

        <button type="submit" :disabled="!selectedSubmission">Hent</button>
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
  padding: 120px 20px 140px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

form {
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
  display: none;
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

.navMenu.show {
  display: block;
}

/* Footer */
.footerImg {
  height: 120px;
  background: url("../assets/adminFooter.jpg") center/cover no-repeat;
  flex-shrink: 0;
}
</style>
