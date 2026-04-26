// Функция для обновления виджета
function updateEnergy() {
    const urlParams = new URLSearchParams(window.location.search);
    const steps = parseInt(urlParams.get('steps')) || 0;
    const goal = 10000;
    
    // Вычисляем процент (максимум 100%)
    let percentage = Math.min((steps / goal) * 100, 100);
    
    // Обновляем элементы на странице
    document.getElementById('energy-fill').style.width = percentage + '%';
    document.getElementById('step-count').innerText = steps.toLocaleString();

    // Логика статуса
    const statusText = document.getElementById('status-text');
    if (steps >= goal) {
        statusText.innerText = 'GREAT_WORK_WILL';
        statusText.style.color = '#fff';
    } else if (steps > 0) {
        statusText.innerText = 'MOVING_FORWARD';
    }
}

// Запуск при загрузке
window.onload = updateEnergy;
