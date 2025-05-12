import { defineStore } from "pinia";
import socket from "../socket";

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
    taskQueue: [], // shuffled list
    currentIndex: 0,
    componentKey: 0,
    gameCompleted: false,
    sessionCodeConfirmed: false,
    selectedTeamName: null,
  }),

  actions: {
    setTasks(taskList) {
      this.tasks = taskList;
    },
    toggleTaskSelection(taskId) {
      if (this.selectedTaskIds.includes(taskId)) {
        this.selectedTaskIds = this.selectedTaskIds.filter((id) => id !== taskId);
      } else {
        this.selectedTaskIds.push(taskId);
      }
    },
    createSession() {
      const id = Math.floor(100000 + Math.random() * 900000).toString();
      this.sessionId = id;
      this.gameCreated = true;
    },
    startGame() {
      if (this.selectedTaskIds.length === 0) return false;
      this.gameStarted = true;
      return true;
    },
    updateTeamStatus(updatedTeams) {
      for (const team in this.teamStatus) {
        this.teamStatus[team] = !!updatedTeams[team];
      }
    },
    updateScoreboard(data) {
      this.scoreboard = data;
    },
    setCurrentTask(task) {
      if (!task) return;

      // Lav en ny reference og tving opdatering
      this.taskAnswer = "";
      this.seconds = (task.Tid || 5) * 60;
      this.currentTask = { ...task }; // 🧠 tving ny reference
      this.componentKey++; // 🧠 tving rerender

      localStorage.setItem("task", JSON.stringify(task));
      console.log("✅ setCurrentTask: Ny task ID", task._id);
    },
    restoreTaskFromStorage() {
      const storedTask = localStorage.getItem("task");
      if (storedTask) {
        const task = JSON.parse(storedTask);
        this.setCurrentTask(task);
      }
    },

    updateTimerFromScoreboard(scoreboard, teamName) {
      const serverTime = scoreboard[teamName]?.time;
      if (typeof serverTime === "number") {
        this.seconds = serverTime;
      }
    },

    setAnswer(value) {
      this.taskAnswer = value;
    },

    saveAnswer(teamName, sessionId) {
      if (!this.taskAnswer || !this.currentTask || !this.currentTask._id) return;

      const allAnswers = JSON.parse(localStorage.getItem("allAnswers")) || [];
      console.log("💾 Gemmer svar med spørgsmål:", this.currentTask.Spørgsmål, this.taskAnswer);
      allAnswers.push({
        taskId: this.currentTask._id,
        question: this.currentTask.Spørgsmål || this.currentTask.title || "Ukendt spørgsmål",
        answer: this.taskAnswer,
      });

      localStorage.setItem("allAnswers", JSON.stringify(allAnswers));
      console.log("Svar gemt i localStorage");

      this.taskAnswer = "";
      socket.emit("next-task", { sessionId, teamName });
      console.log("📨 Emitting next-task til server", { sessionId, teamName });
    },
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
            console.log("Besvarelser indsendt:", data);
            localStorage.removeItem("allAnswers");
          })
          .catch((err) => {
            console.error("Fejl ved indsendelse af svar:", err);
          });
      }
    },
    moveToNextTask() {
      if (this.currentIndex < this.taskQueue.length - 1) {
        this.currentIndex++;
        this.setCurrentTask(this.taskQueue[this.currentIndex]);
      } else {
        this.currentTask = null;
      }
    },
    initializeTaskQueue(taskList) {
      this.taskQueue = taskList;
      this.currentIndex = 0;
      if (taskList.length > 0) {
        this.setCurrentTask(taskList[0]);
      }
    },
    setJoinedTeam(teamName) {
      this.selectedTeamName = teamName;
      localStorage.setItem("selectedTeam", teamName);
      localStorage.setItem("sessionId", this.sessionId);
      localStorage.removeItem("task");
      localStorage.removeItem("allAnswers");
    },
  },
});
