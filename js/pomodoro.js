// ------------------------
//       STATE VARIABLES
// ------------------------
let pomodoroInterval = null;         // setInterval for Pomodoro
let pomodoroTimeRemaining = 25 * 60; // default = 25 minutes
let isPomodoroRunning = false;

// Break
let breakInterval = null;           
let breakTimeRemaining = 0;         
let isOnBreak = false;

// For convenience
const defaultPomodoroTime = 25 * 60; 
const shortBreakTime = 5 * 60;      

// ------------------------
//       DOM ELEMENTS
// ------------------------
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const shortBreakBtn = document.getElementById("shortBreakBtn");

// ------------------------
//       LOCALSTORAGE
// ------------------------
function getLastPomodoroMessage() {
  return localStorage.getItem("lastPomodoroMessage") || "";
}
function setLastPomodoroMessage(msg) {
  localStorage.setItem("lastPomodoroMessage", msg);
}

// ------------------------
//       TIME DISPLAY
// ------------------------
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay(seconds) {
  timerDisplay.textContent = formatTime(seconds);
  document.title = formatTime(pomodoroTimeRemaining) + " - Pomodoro";
}

// ------------------------
//       POMODORO LOGIC
// ------------------------
function startPomodoro() {
  // If a Pomodoro is already running, alert and stop
  if (isPomodoroRunning) {
    alert("A Pomodoro is already running. Pause or Reset it before starting a new one.");
    return;
  }
  
  // If a break is active (running or paused), cancel it and reset to default Pomodoro
  if (isOnBreak) {
    if (breakInterval !== null) {
      clearInterval(breakInterval);
      breakInterval = null;
    }
    isOnBreak = false;
    alert("Break cancelled. Starting new Pomodoro.");
  }
  
  // **Reset the pomodoro timer to its default value**
  pomodoroTimeRemaining = defaultPomodoroTime;
  updateTimerDisplay(pomodoroTimeRemaining);
  
  // Prompt for a task with last message as default
  const defaultMessage = getLastPomodoroMessage();
  const taskDescription = prompt("What are you working on this Pomodoro?", defaultMessage);
  if (!taskDescription) {
    // User canceled or left blank: do nothing
    return;
  }
  // Save the message as "last used"
  setLastPomodoroMessage(taskDescription);
  
  // Add to the localStorage history
  addNewPomodoroTask(taskDescription);
  
  // Start counting down
  isPomodoroRunning = true;
  pomodoroInterval = setInterval(() => {
    pomodoroTimeRemaining--;
    updateTimerDisplay(pomodoroTimeRemaining);
  
    if (pomodoroTimeRemaining <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      isPomodoroRunning = false;
      alert("Time is up!");
      markLastTaskFinished();
    }
  }, 1000);
}

function pausePomodoro() {
  if (!isPomodoroRunning) {
    alert("No Pomodoro is running to pause.");
    return;
  }
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
  isPomodoroRunning = false;
}

function resetPomodoro() {
  // Stop if running
  if (isPomodoroRunning) {
    clearInterval(pomodoroInterval);
  }
  pomodoroInterval = null;
  isPomodoroRunning = false;

  // Reset time
  pomodoroTimeRemaining = defaultPomodoroTime;
  updateTimerDisplay(pomodoroTimeRemaining);
}

// ------------------------
//       BREAK LOGIC
// ------------------------
function startShortBreak() {
  // If there's already a break running, do nothing
  if (isOnBreak) {
    alert("A break is already in progress.");
    return;
  }

  // If a Pomodoro is running, pause it
  if (isPomodoroRunning) {
    pausePomodoro(); 
  }

  // Start break
  isOnBreak = true;
  breakTimeRemaining = shortBreakTime; 
  updateTimerDisplay(breakTimeRemaining);

  breakInterval = setInterval(() => {
    breakTimeRemaining--;
    updateTimerDisplay(breakTimeRemaining);

    if (breakTimeRemaining <= 0) {
      clearInterval(breakInterval);
      breakInterval = null;
      isOnBreak = false;
      alert("Short break is over!");

      // If we had paused a Pomodoro, resume it
      if (pomodoroTimeRemaining > 0 && !isPomodoroRunning) {
        resumePomodoroAfterBreak();
      }
    }
  }, 1000);
}

function resumePomodoroAfterBreak() {
  isPomodoroRunning = true;
  pomodoroInterval = setInterval(() => {
    pomodoroTimeRemaining--;
    updateTimerDisplay(pomodoroTimeRemaining);

    if (pomodoroTimeRemaining <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      isPomodoroRunning = false;
      alert("Time is up!");
      markLastTaskFinished();
    }
  }, 1000);
}

// ------------------------
//       HISTORY LOGIC
// ------------------------
function getPomodoroTasks() {
  const tasksString = localStorage.getItem("pomodoroTasks");
  return tasksString ? JSON.parse(tasksString) : [];
}
function savePomodoroTasks(tasks) {
  localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
}
function addNewPomodoroTask(taskDescription) {
  const tasks = getPomodoroTasks();
  const newTask = {
    task: taskDescription,
    startTime: new Date().toISOString(),
    finishTime: null
  };
  tasks.push(newTask);
  savePomodoroTasks(tasks);
  updateHistoryUI();
}
function markLastTaskFinished() {
  const tasks = getPomodoroTasks();
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (!tasks[i].finishTime) {
      tasks[i].finishTime = new Date().toISOString();
      break;
    }
  }
  savePomodoroTasks(tasks);
  updateHistoryUI();
}

// ------------------------
//       HISTORY UI
// ------------------------
function updateHistoryUI() {
  const tasks = getPomodoroTasks();
  const historyBody = document.getElementById("historyBody");
  historyBody.innerHTML = "";

  tasks.forEach(taskObj => {
    const row = document.createElement("tr");

    const taskCell = document.createElement("td");
    taskCell.textContent = taskObj.task;

    const startCell = document.createElement("td");
    const startDate = new Date(taskObj.startTime);
    startCell.textContent = startDate.toLocaleString();

    const finishCell = document.createElement("td");
    if (taskObj.finishTime) {
      const finishDate = new Date(taskObj.finishTime);
      finishCell.textContent = finishDate.toLocaleString();
    } else {
      finishCell.textContent = "In progress";
    }

    row.appendChild(taskCell);
    row.appendChild(startCell);
    row.appendChild(finishCell);
    historyBody.appendChild(row);
  });
}

// ------------------------
//       EVENT LISTENERS
// ------------------------
startBtn.addEventListener("click", startPomodoro);
pauseBtn.addEventListener("click", pausePomodoro);
resetBtn.addEventListener("click", resetPomodoro);
shortBreakBtn.addEventListener("click", startShortBreak);

// ------------------------
//       ON LOAD
// ------------------------
updateTimerDisplay(pomodoroTimeRemaining);
updateHistoryUI();

