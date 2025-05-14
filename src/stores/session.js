import { defineStore } from "pinia";
import socket from "../socket";

// Pinia state management
// Bruges til at håndtere states på tværs af alle komponenter
// Bruges samtidig til at dele state på tværs af host / player.
export const useSessionStore = defineStore("session", {
  state: () => ({
    sessionId: null,
    tasks: [],
    selectedTaskIds: [],
    teamStatus: {
      Alpha: false,
      Beta: false,
      Delta: false,
      Sigma: false,
      Omega: false,
    },
    scoreboard: {},
    gameStarted: false,
    gameCreated: false,
    currentTask: null,
    seconds: null,
    taskAnswer: "",
    taskQueue: [], // shuffled array
    currentIndex: 0,
    componentKey: 0,
    gameCompleted: false,
    sessionCodeConfirmed: false,
    selectedTeamName: null,
  }),

  actions: {
    // Sætter listen af opgaver
    setTasks(taskList) {
      this.tasks = taskList;
    },
    // Tilføjer taskId hvis den ikke er valgt, ellers fjerner den det fra de valgte opgaver
    toggleTaskSelection(taskId) {
      if (this.selectedTaskIds.includes(taskId)) {
        this.selectedTaskIds = this.selectedTaskIds.filter((id) => id !== taskId);
      } else {
        this.selectedTaskIds.push(taskId);
      }
    },
    // Opretter en ny spil-session med tilfældigt 6 cifret tal-ID
    createSession() {
      const id = Math.floor(100000 + Math.random() * 900000).toString();
      this.sessionId = id;
      this.gameCreated = true;
    },
    // Starter spillet hvis mindst én opgave er valgt
    startGame() {
      if (this.selectedTaskIds.length === 0) return false;
      this.gameStarted = true;
      return true;
    },
    // Opdaterer status (connected/disconnected) for alle teams
    updateTeamStatus(updatedTeams) {
      for (const team in this.teamStatus) {
        this.teamStatus[team] = !!updatedTeams[team];
      }
    },
    // Opdaterer scoreboard-data
    updateScoreboard(data) {
      this.scoreboard = data;
    },
    // Sætter den aktuelle opgave og timeren, samt gemmer den i localStorage
    setCurrentTask(task) {
      if (!task) return;
      this.taskAnswer = "";
      this.seconds = (task.Tid || 5) * 60;
      this.currentTask = { ...task };
      this.componentKey++;

      localStorage.setItem("task", JSON.stringify(task));
    },
    // Gendanner opgave fra localStorage ved genindlæsning
    restoreTaskFromStorage() {
      const storedTask = localStorage.getItem("task");
      if (storedTask) {
        const task = JSON.parse(storedTask);
        this.setCurrentTask(task);
      }
    },
    // Synkroniserer timer med serverens tid for det specifikke team
    updateTimerFromScoreboard(scoreboard, teamName) {
      const serverTime = scoreboard[teamName]?.time;
      if (typeof serverTime === "number") {
        this.seconds = serverTime;
      }
    },
    // Sætter nuværende svar (taskAnswer)
    setAnswer(value) {
      this.taskAnswer = value;
    },
    // Gemmer et svar lokalt og sender signal til serveren om næste opgave
    saveAnswer(teamName, sessionId) {
      if (!this.taskAnswer || !this.currentTask || !this.currentTask._id) return;

      const allAnswers = JSON.parse(localStorage.getItem("allAnswers")) || [];
      allAnswers.push({
        taskId: this.currentTask._id,
        question: this.currentTask.Spørgsmål || this.currentTask.title || "Ukendt spørgsmål",
        answer: this.taskAnswer,
      });

      localStorage.setItem("allAnswers", JSON.stringify(allAnswers));

      this.taskAnswer = "";
      socket.emit("next-task", { sessionId, teamName });
    },
    // Indsender alle gemte svar til serveren som én samlet submission
    submitAllAnswers(sessionId, teamName) {
      const allAnswers = JSON.parse(localStorage.getItem("allAnswers")) || [];

      if (allAnswers.length > 0) {
        const submission = {
          sessionId,
          teamName,
          answers: allAnswers,
          submittedAt: Date.now(),
        };

        fetch("http://localhost:5500/api/submission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submission),
        })
          .then((res) => res.json())
          .then((data) => {
            localStorage.removeItem("allAnswers");
          })
          .catch((err) => {
            console.error("Fejl ved indsendelse af svar:", err);
          });
      }
    },
    // Skifter til næste opgave i køen eller afslutter
    moveToNextTask() {
      if (this.currentIndex < this.taskQueue.length - 1) {
        this.currentIndex++;
        this.setCurrentTask(this.taskQueue[this.currentIndex]);
      } else {
        this.currentTask = null;
      }
    },
    // Initialiserer opgavekø og starter med første opgave
    initializeTaskQueue(taskList) {
      this.taskQueue = taskList;
      this.currentIndex = 0;
      if (taskList.length > 0) {
        this.setCurrentTask(taskList[0]);
      }
    },
    // Gemmer hvilket team brugeren har joined og nulstiller tidligere opgavedata
    setJoinedTeam(teamName) {
      this.selectedTeamName = teamName;
      localStorage.setItem("selectedTeam", teamName);
      localStorage.setItem("sessionId", this.sessionId);
      localStorage.removeItem("task");
      localStorage.removeItem("allAnswers");
    },
  },
});
