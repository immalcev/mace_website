function registerUser() {
    const userName = prompt("Введи свой ID или имя:");
    if (userName) {
        localStorage.setItem('user_id', userName);
        checkAuth();
        showInstallPrompt();
    }
}

function checkAuth() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('user-display').innerText = userId;
        updateDisplay();
    }
}

function showInstallPrompt() {
    // Проверяем, не запущено ли уже как PWA (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (!isStandalone) {
        document.getElementById('install-modal').style.display = 'flex';
    }
}

function closeModal() {
    document.getElementById('install-modal').style.display = 'none';
}

function updateDisplay() {
    const params = new URLSearchParams(window.location.search);
    const steps = params.get('steps');
    if (steps) {
        // Умная логика: каждые 100 шагов = 1% воли
        const energy = Math.min(Math.round(steps / 100), 100);
        document.getElementById('energy-display').innerText = energy + '%';
        document.getElementById('status-text').innerText = "Статус: Синхронизировано";
    }
}

// Проверка входа при загрузке
window.onload = () => {
    checkAuth();
};
