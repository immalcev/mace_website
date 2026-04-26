import { GoogleGenerativeAI } from "@google/generative-ai";

// Инициализация Gemini
const API_KEY = "AIzaSyDHtKWjiBA0izEaQyXEzmPLYBn3AZhWpu8"; // Вставь свой ключ здесь
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let currentUser = null;
let energy = 0;
let tasks = [];

// Инициализация при загрузке
window.onload = () => {
    const savedUser = localStorage.getItem('tg_user');
    if (savedUser) {
        login(JSON.parse(savedUser));
    } else {
        showAuth();
    }
};

function showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-screen').classList.add('hidden');
    
    const container = document.getElementById('tg-widget-container');
    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', 'ThelemaOneBot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    container.appendChild(script);
}

// Глобальная функция для виджета Telegram
window.onTelegramAuth = (user) => {
    localStorage.setItem('tg_user', JSON.stringify(user));
    login(user);
};

function login(user) {
    currentUser = user;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    loadUserData();
    checkPWA();
}

window.logout = () => {
    localStorage.removeItem('tg_user');
    location.reload();
};

function loadUserData() {
    const saved = localStorage.getItem(`data_${currentUser.id}`);
    if (saved) {
        const data = JSON.parse(saved);
        energy = data.energy;
        tasks = data.tasks;
    } else {
        energy = 50;
        tasks = [];
    }
    updateUI();
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

// Обработка задач через Gemini
async function processTaskAI(input) {
    if (!input) return;
    const inputEl = document.getElementById('task-input');
    inputEl.disabled = true;
    inputEl.placeholder = "Анализ Воли...";

    try {
        const prompt = `Ты — ИИ системы Mayhem Control. Пользователь сделал: "${input}". 
        Сформулируй задачу (2-3 слова) и оцени её в баллах энергии (5-25). 
        Ответь только JSON: {"text": "что сделано", "points": число}`;

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());

        tasks.push(data);
        energy = Math.min(100, energy + data.points);
        
        localStorage.setItem(`data_${currentUser.id}`, JSON.stringify({ energy, tasks }));
        updateUI();
    } catch (e) {
        console.error(e);
    } finally {
        inputEl.disabled = false;
        inputEl.value = '';
        inputEl.placeholder = "Расскажи Gemini, что сделано...";
    }
}

document.getElementById('task-input').onkeypress = (e) => {
    if (e.key === 'Enter') processTaskAI(e.target.value);
};

// Голосовой ввод
const voiceBtn = document.getElementById('voice-btn');
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    voiceBtn.onclick = () => recognition.start();
    recognition.onresult = (e) => processTaskAI(e.results[0][0].transcript);
}

// Модалки
window.toggleModal = (id) => {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.connectDevice = () => {
    alert("Кольца синхронизированы.");
    energy = Math.min(100, energy + 15);
    updateUI();
    window.toggleModal('device-modal');
};

function checkPWA() {
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => toggleModal('pwa-modal'), 3000);
    }
}
