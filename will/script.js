let currentUser = null;
let energy = 0;
let tasks = [];

// Инициализация
window.onload = () => {
    const savedUser = localStorage.getItem('tg_user');
    if (savedUser) {
        login(JSON.parse(savedUser));
    } else {
        showAuth();
    }
    checkPWA();
};

function showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-screen').classList.add('hidden');
    
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', 'ThelemaOneBot'); // ЗАМЕНИ НА СВОЕГО БОТА
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    document.getElementById('tg-widget-container').appendChild(script);
}

function onTelegramAuth(user) {
    localStorage.setItem('tg_user', JSON.stringify(user));
    login(user);
}

function login(user) {
    currentUser = user;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    loadData();
}

function logout() {
    localStorage.removeItem('tg_user');
    location.reload();
}

// Загрузка данных
function loadData() {
    const savedData = localStorage.getItem(`data_${currentUser.id}`);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        energy = parsed.energy;
        tasks = parsed.tasks;
    } else {
        energy = 50;
        tasks = [];
    }
    updateUI();
}

function saveData() {
    localStorage.setItem(`data_${currentUser.id}`, JSON.stringify({ energy, tasks }));
}

function updateUI() {
    document.getElementById('energy-val').innerText = energy;
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    tasks.forEach(t => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `<span>${t.text}</span><span class="task-energy">+${t.points}</span>`;
        list.appendChild(item);
    });
}

// ИИ Генератор задач
const taskInput = document.getElementById('task-input');
taskInput.onkeypress = (e) => {
    if (e.key === 'Enter') processTask(taskInput.value);
};

function processTask(text) {
    if (!text) return;
    // Имитация ИИ: разбивка фразы и назначение баллов
    const points = Math.floor(Math.random() * 15) + 5;
    tasks.push({ text, points, done: false });
    taskInput.value = '';
    saveData();
    updateUI();
}

// Голосовой ввод
const voiceBtn = document.getElementById('voice-btn');
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    voiceBtn.onclick = () => recognition.start();
    recognition.onresult = (e) => {
        const result = e.results[0][0].transcript;
        processTask(result);
    };
}

// Утилиты
function toggleModal(id) {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function checkPWA() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && currentUser) {
        setTimeout(() => toggleModal('pwa-modal'), 3000);
    }
}

function connectDevice() {
    alert("Поиск устройств... Доступ к Apple Health / Google Fit разрешен.");
    toggleModal('device-modal');
    energy = Math.min(100, energy + 10);
    saveData();
    updateUI();
}
