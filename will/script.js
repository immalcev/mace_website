import { GoogleGenerativeAI } from "@google/generative-ai";

// ВСТАВЬ СВОЙ КЛЮЧ ЗДЕСЬ
const API_KEY = "AIzaSyDHtKWjiBA0izEaQyXEzmPLYBn3AZhWpu8";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let currentUser = null;
let energy = 0;
let tasks = [];

window.onload = () => {
    const savedUser = localStorage.getItem('tg_user');
    if (savedUser) login(JSON.parse(savedUser));
    else showAuth();
};

function showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', 'ThelemaOneBot'); // ТВОЙ БОТ
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    document.getElementById('tg-widget-container').appendChild(script);
}

window.onTelegramAuth = (user) => {
    localStorage.setItem('tg_user', JSON.stringify(user));
    login(user);
};

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

// РАБОТА С GEMINI
async function processTask(userInput) {
    if (!userInput) return;
    
    const inputField = document.getElementById('task-input');
    inputField.disabled = true;
    inputField.placeholder = "Gemini анализирует Волю...";

    try {
        const prompt = `Ты — ИИ-модуль системы Mayhem Control. Пользователь сказал: "${userInput}". 
        Сформулируй из этого короткую задачу (2-4 слова) и оцени её сложность в единицах энергии от 5 до 25. 
        Ответь строго в формате JSON: {"text": "название", "points": число}.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = JSON.parse(response.text());

        tasks.push({ text: data.text, points: data.points });
        energy = Math.min(100, energy + data.points);
        
        saveData();
        updateUI();
    } catch (e) {
        console.error("Ошибка ИИ:", e);
        alert("Ошибка связи с ИИ. Попробуй еще раз.");
    } finally {
        inputField.disabled = false;
        inputField.placeholder = "Расскажи, что нужно сделать...";
        inputField.value = '';
    }
}

document.getElementById('task-input').onkeypress = (e) => {
    if (e.key === 'Enter') processTask(e.target.value);
};

// Голосовой ввод
const voiceBtn = document.getElementById('voice-btn');
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    voiceBtn.onclick = () => recognition.start();
    recognition.onresult = (e) => processTask(e.results[0][0].transcript);
}

// Утилиты (модалки и т.д.)
window.toggleModal = (id) => {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.connectDevice = () => {
    alert("Кольца синхронизированы.");
    energy = Math.min(100, energy + 10);
    saveData();
    updateUI();
    window.toggleModal('device-modal');
};
