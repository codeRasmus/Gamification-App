<script setup>
const handleDelete = async (event) => {
  event.preventDefault();

  const deleteId = event.target.deleteId.value;

  if (deleteId.trim()) {
    try {
      const response = await fetch(`http://localhost:5500/api/tasks/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Task deleted successfully');
      } else {
        alert('Error deleting task');
      }
    } catch (error) {
      alert('Error deleting task: ' + error.message);
    }
  } else {
    alert('Please provide a valid task ID');
  }
};

const handleGetTask = async (event) => {
  event.preventDefault();

  const taskId = event.target.taskId.value;

  if (taskId.trim()) {
    try {
      const response = await fetch(`http://localhost:5500/api/tasks/${taskId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const task = await response.json();
        console.log(task);  
      } else {
        alert('Error fetching task');
      }
    } catch (error) {
      alert('Error fetching task: ' + error.message);
    }
  } else {
    alert('Please provide a valid task ID');
  }
};

const handlePatchTask = async (event) => {
  event.preventDefault();

  const taskId = event.target.taskId.value;
  const updatedFields = {};

  // Gather updated fields from the form
  const formElements = event.target.elements;
  Array.from(formElements).forEach(element => {
    if (element.name && element.value) {
      updatedFields[element.name] = element.value;
    }
  });

  // Remove taskId from the fields (we don't want to update the ID)
  delete updatedFields.taskId;

  if (taskId.trim() && Object.keys(updatedFields).length > 0) {
    try {
      const response = await fetch(`http://localhost:5500/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        alert('Task updated successfully');
        console.log(updatedTask);
      } else {
        alert('Error updating task');
      }
    } catch (error) {
      alert('Error updating task: ' + error.message);
    }
  } else {
    alert('Please provide a valid task ID and update some fields');
  }
};
</script>

<template>
  <h1>Admin Panel</h1>

  <!-- Hent alle opgaver -->
  <form action="http://localhost:5500/api/tasks" method="GET" class="card">
    <label for="">Hent alle opgaver</label>
    <button type="submit">Hent</button>
  </form>

  <!-- Hent specifik opgave -->
  <form @submit="handleGetTask" class="card">
    <label for="taskId">Hent specifik opgave</label>
    <input 
      type="text" 
      name="taskId"
      placeholder="Indtast ID på den opgave du vil hente" 
      required
    />
    <button type="submit">Hent</button>
  </form>

  <!-- Tilføj opgaver -->
  <form action="http://localhost:5500/api/tasks" method="POST" class="card">
    <h2>Tilføj opgave</h2>
    <label for="Spørgsmål">Spørgsmål</label>
    <input type="text" name="Spørgsmål" id="Spørgsmål" />

    <label for="Kategori">Vælg kategori:</label>
    <select id="Kategori" name="Kategori">
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
    <select id="Kompetencetype" name="Kompetencetype">
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
<form @submit="handlePatchTask" class="card">
  <label for="taskId">Opgave ID</label>
  <input
    type="text"
    name="taskId"
    placeholder="Enter task ID to update"
    required
  />

  <label for="Spørgsmål">Spørgsmål</label>
  <input type="text" name="Spørgsmål" placeholder="Indtast nyt spørgsmål" />

  <label for="Kategori">Vælg kategori:</label>
  <select id="Kategori" name="Kategori">
    <option value="">-- Vælg ny kategori --</option>
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
  <select id="Kompetencetype" name="Kompetencetype">
    <option value="">-- Vælg ny kompetencetype --</option>
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
  <form @submit="handleDelete" class="card">
    <label for="deleteId">Slet specifik opgave</label>
    <input 
      type="text" 
      name="deleteId"
      placeholder="Skriv ID på den opgave du vil slette" 
      required
    />
    <button type="submit">Slet</button>
  </form>

  <form action="http://localhost:5500/api/admin/register" method="POST" class="card">
    <h2>Opret admin</h2>
    <label for="username">Brugernavn</label>
    <input type="text" name="username" id="username" />

    <label for="password">Adgangskode</label>
    <input type="password" name="password" id="password" />

    <button type="submit">Opret bruger</button>
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

