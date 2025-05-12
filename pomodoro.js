const timerDisplay = document.getElementById('timer-text');
const timerPath = document.getElementById('timer-path');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const statusDisplay = document.getElementById('status');
const svg = document.querySelector('.round-timer svg');
const radius = svg.querySelector('circle').getAttribute('r');
const circumference = 2 * Math.PI * radius;

const workTimeQuickInput = document.getElementById('work-time-quick');
const breakTimeQuickInput = document.getElementById('break-time-quick');
const applyQuickSettingsButton = document.getElementById('apply-quick-settings');

const taskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeButton = settingsModal.querySelector('.close-button');
const backgroundColorInput = document.getElementById('background-color');
const backgroundThemeSelect = document.getElementById('background-theme');
const customColorPicker = document.getElementById('custom-color-picker');
const newWorkDurationInput = document.getElementById('new-work-duration');
const newBreakDurationInput = document.getElementById('new-break-duration');
const saveSettingsButton = document.getElementById('save-settings');
const notificationSoundCheckbox = document.getElementById('notification-sound');

const logoutButton = document.getElementById('logout-button');
const totalFocusTimeDisplay = document.getElementById('total-focus-time');

let timerInterval;
let timeLeft;
let isRunning = false;
let isWorkSession = true;
let workTime = parseInt(localStorage.getItem('workTime')) * 60 || 25 * 60;
let breakTime = parseInt(localStorage.getItem('breakTime')) * 60 || 5 * 60;
let focusStartTime;
let totalFocusSecondsThisWeek = JSON.parse(localStorage.getItem('totalFocusSecondsThisWeek')) || 0;
const notificationEnabled = localStorage.getItem('notificationEnabled') === 'true' || true;

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const savedBackgroundColor = localStorage.getItem('backgroundColor');
const savedTheme = localStorage.getItem('backgroundTheme') || 'default';

document.body.className = savedTheme === 'default' ? '' : `${savedTheme}-theme`;
backgroundThemeSelect.value = savedTheme;
customColorPicker.style.display = savedTheme === 'custom' ? 'block' : 'none';

if (savedBackgroundColor) {
    document.body.style.backgroundColor = savedBackgroundColor;
    backgroundColorInput.value = savedBackgroundColor;
}

workTimeQuickInput.value = Math.floor(workTime / 60);
breakTimeQuickInput.value = Math.floor(breakTime / 60);

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;

    const totalTime = isWorkSession ? workTime : breakTime;
    const offset = circumference - (timeLeft / totalTime) * circumference;
    timerPath.style.strokeDashoffset = offset;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        statusDisplay.textContent = isWorkSession ? 'Focusing' : 'Taking a break';
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                isRunning = false;
                isWorkSession = !isWorkSession;
                timeLeft = isWorkSession ? workTime : breakTime;
                statusDisplay.textContent = isWorkSession ? 'Time to focus!' : 'Break time!';
                updateTimerDisplay();
                if (notificationEnabled) {
                    new Notification(isWorkSession ? 'Time to focus!' : 'Break time!');
                }
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        statusDisplay.textContent = 'Paused';
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isWorkSession = true;
    timeLeft = workTime; // Correctly reset timeLeft to the current workTime
    updateTimerDisplay();
    statusDisplay.textContent = '';
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        tasks.push({ text: taskText, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        taskInput.value = '';
    }
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
            <button class="delete-btn">✕</button>
        `;
        const completeButton = listItem.querySelector('.complete-btn');
        const deleteButton = listItem.querySelector('.delete-btn');

        completeButton.addEventListener('click', () => toggleComplete(index));
        deleteButton.addEventListener('click', () => deleteTask(index));
        taskList.appendChild(listItem);
    });
}

function applyQuickSettings() {
    const newWorkTime = parseInt(workTimeQuickInput.value) * 60;
    const newBreakTime = parseInt(breakTimeQuickInput.value) * 60;

    if (!isNaN(newWorkTime) && !isNaN(newBreakTime) && newWorkTime > 0 && newBreakTime > 0) {
        workTime = newWorkTime;
        breakTime = newBreakTime;
        localStorage.setItem('workTime', parseInt(workTimeQuickInput.value));
        localStorage.setItem('breakTime', parseInt(breakTimeQuickInput.value));
        resetTimer(); // Call resetTimer to update timeLeft
    } else {
        alert('Please enter valid positive numbers for work and break times.');
    }
}

function applySettings() {
    const selectedTheme = backgroundThemeSelect.value;
    localStorage.setItem('backgroundTheme', selectedTheme);
    document.body.className = selectedTheme === 'default' ? '' : `${selectedTheme}-theme`;

    const newBackgroundColor = backgroundColorInput.value;
    if (selectedTheme === 'custom') {
        document.body.style.backgroundColor = newBackgroundColor;
        localStorage.setItem('backgroundColor', newBackgroundColor);
    } else {
        localStorage.removeItem('backgroundColor');
        if (selectedTheme === 'cafe') document.body.style.backgroundColor = '#a36247';
        if (selectedTheme === 'library') document.body.style.backgroundColor = '#d1c4e9';
        if (selectedTheme === 'beach') document.body.style.backgroundColor = '#e0f2f7';
        if (selectedTheme === 'old-diary') document.body.style.backgroundColor = '#f4f0e8';
        if (selectedTheme === 'garden') document.body.style.backgroundColor = '#aed581';
    }

    const newWorkTime = parseInt(newWorkDurationInput.value) * 60;
    const newBreakTime = parseInt(newBreakDurationInput.value) * 60;

    if (!isNaN(newWorkTime) && !isNaN(newBreakTime) && newWorkTime > 0 && newBreakTime > 0) {
        workTime = newWorkTime;
        breakTime = newBreakTime;
        localStorage.setItem('workTime', parseInt(newWorkDurationInput.value));
        localStorage.setItem('breakTime', parseInt(newBreakDurationInput.value));
        resetTimer(); // Call resetTimer to update timeLeft
    } else {
        alert('Please enter valid positive numbers for work and break durations in advanced settings.');
    }

    localStorage.setItem('notificationEnabled', notificationSoundCheckbox.checked);
    settingsModal.classList.remove('active');
}

function logout() {
    window.location.href = 'index.html';
}

backgroundThemeSelect.addEventListener('change', () => {
    customColorPicker.style.display = backgroundThemeSelect.value === 'custom' ? 'block' : 'none';
});

settingsButton.addEventListener('click', () => {
    settingsModal.classList.add('active');
    newWorkDurationInput.value = Math.floor(workTime / 60);
    newBreakDurationInput.value = Math.floor(breakTime / 60);
    backgroundColorInput.value = localStorage.getItem('backgroundColor') || '#f8f0e3';
    notificationSoundCheckbox.checked = localStorage.getItem('notificationEnabled') === 'true' || true;
    customColorPicker.style.display = backgroundThemeSelect.value === 'custom' ? 'block' : 'none';
});

closeButton.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
});

saveSettingsButton.addEventListener('click', applySettings);
logoutButton.addEventListener('click', logout);
applyQuickSettingsButton.addEventListener('click', applyQuickSettings);

timerPath.style.strokeDasharray = circumference;
timeLeft = workTime;
updateTimerDisplay();
renderTasks();