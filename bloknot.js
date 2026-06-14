// ==========================================
// 1. НАСТРОЙКА ИГР И МИССИЙ (БАЗА ДАННЫХ)
// ==========================================
const gameData = {
    "GTAV RP": {
        daily: [
                  "3 часа в онлайне 2/4 BP",
                  "Нули в казино 2/4 BP",
                  "Ставка в казино (межсерверное колесо) 3/6BP",
                  "Сыграть в мафию в казино 3/6 BP",
                  "Выиграть гонку в картинге 1/2 BP",
                  "Проехать 1 уличную гонку (1000$) 1/2 BP",
                  "25 действий на стройке 2/4 BP",
                  "25 действий в порту 2/4 BP",
                  "25 действий в шахте 2/4 BP",
                  "10 действий на ферме  1/2 BP",
                  "Потушить 25 \"огоньков\" пожарным 1/2 BP",
                  "2 круга на автобусе 2/4 BP",
                  "Выполнить 3 дальнобойщиком (в бизнес или порт) 2/4 BP",
                  "20 подходов в зале 1/2 BP",
                  "Победа в тире 1/2 BP",
                  "10 посылок на почте 1/2 BP",
                  "Арендовать киностудию 2/4 BP",
                  "Добавить 5 видео в кинотеатре 1/2 BP",
                  "Выкопать 1 сокровище 1/2 BP",
                  "5 раз снять 100% шкуру животных 2/4 BP",
                  "Поймать 20 рыб 4/8 BP",
                  "Поймать золотую рыбку 10/10 BP",
                  "Купить лотерейный билет 1/2 BP",
                  "Посетить любой сайт 1/2 BP",
                  "Зайти в Brawl 1/2 BP",
                  "Поставить лайк в Match 1/2 BP",
                  "Кинуть мяч питомцу 15 раз 2/4 BP",
                  "15 выполненных питомцем команд 2/4 BP",
                  "Проехать 1 станцию на метро 2/4 BP",
                  "Выполнить 2 квеста клубов 4/8 BP",
                  "Починить деталь в автосервисе 1/2 BP",
                  "Забросить 2 мяча в баскетболе 1/2 BP",
                  "Забить 2 гола в футболе 1/2",
                  "Победить в дартс 1/2 BP",
                  "Поиграть 1 минуту в волейбол 1/2 BP",
                  "Поиграть 1 минуту в настольный теннис 1/2 BP",
                  "Поиграть 1 минуту в большой теннис 1/2 BP",
                  "Победить в армрестлинге 1/2 BP",
                  "Выиграть 5 игр в тренировочном комплексе ставкой (от 100$) 1/2 BP",
                  "Выиграть 3 любых игры на арене ставкой (от 100$) 1/2 BP*", 
                  "3 победы в Дэнс Баттлах 2/4 BP",
                  "Принять участие в 2 аирдропах 4/8",
                  "Сделать платеж по лизингу 1/2 BP",
                  "Посадить траву в теплице 4/8 BP",
                  "Запустить переработку обезболивающих в лаборатории 4/8 BP",
],
        hourly: ["тир", "pochta"],
        counters:["лотерея","pochta","пропускать BP","миссии пропуска"]
    },
    "Genshin Impact": {
        daily: ["Дейлики (4 шт)", "Потратить густую смолу", "Экспедиции Катерины"],
        hourly: ["Сбор сокровищ обители"],
        counters:["Собрать кабачок", "Проверить улей"]
    }
};

// Состояние приложения
let currentFolder = Object.keys(gameData)[0];
let currentType = 'daily'; 
let searchQuery = '';

// Загрузка логов из локальной памяти браузера (LocalStorage)
let historyLog = JSON.parse(localStorage.getItem('game_tracker_history')) || {};

// Функция сохранения галочек в память
function saveData() {
    localStorage.setItem('game_tracker_history', JSON.stringify(historyLog));
}

// ==========================================
// 2. РАБОТА С КАЛЕНДАРЕМ И ВРЕМЕНЕМ
// ==========================================
function getColumns() {
    const columns = [];
    const now = new Date();
    let d, day, month, hour;
    if (currentType === 'daily') {
        // Создаем массив из последних 5 дней (включая сегодня)
        for (let i = 4; i >= 0; i--) {
            d = new Date();
            d.setDate(now.getDate() - i);
            
            day = String(d.getDate()).padStart(2, '0');
            month = String(d.getMonth() + 1).padStart(2, '0');
            
            const key =`${d.getFullYear()}-${month}-${day}`;
            const label = `${day}.${month}`;                 
            columns.push({ key, label });
        }
    } else {
        // Создаем массив из последних 5 часов
        for (let i = 4; i >= 0; i--) {
            d = new Date(now.getTime() - i * 60 * 60 * 1000);
            
            day = String(d.getDate()).padStart(2, '0');
            month = String(d.getMonth() + 1).padStart(2, '0');
            hour = String(d.getHours()).padStart(2, '0');
            
            const key = `${d.getFullYear()}-${month}-${day} ${hour}:00`; 
            const label = `${hour}:00`;                                  
            const subLabel = `${day}.${month}`;
            columns.push({ key, label, subLabel });
        }
    }
    return columns;
}

// ==========================================
// 3. ОТРИСОВКА ИНТЕРФЕЙСА
// ==========================================

function renderFolders() {
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '';
    
    Object.keys(gameData).forEach(folder => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = `folder-btn ${folder === currentFolder ? 'active' : ''}`;
        btn.innerText = folder;
        
        btn.onclick = () => {
            currentFolder = folder;
            renderFolders();
            renderTable();
        };
        
        li.appendChild(btn);
        folderList.appendChild(li);
    });
}

function switchType(type) {
    document.getElementById('btnDaily').classList.toggle('active', type === 'daily');
    document.getElementById('btnHourly').classList.toggle('active', type === 'hourly');
    document.getElementById('btnCounters').classList.toggle('active', type === 'counters');
    currentType = type;
    renderTable()
}

function renderTable() {
    const headerRow = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    
    headerRow.innerHTML = '<th>Миссии</th>';
    tableBody.innerHTML = '';
    const missions = gameData[currentFolder][currentType] || [];
    const filteredMissions = missions.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    // РЕЖИМ СЧЁТЧИКОВ (Добавь этот блок сюда)
    if (currentType === 'counters') {
        headerRow.innerHTML += '<th>Значение</th><th>Управление</th>';
        
        filteredMissions.forEach(mission => {
            const tr = document.createElement('tr');
            
            const tdName = document.createElement('td');
            tdName.innerText = mission;
            tr.appendChild(tdName);
            
            const cellId = `${currentFolder}_counter_${mission}`;
            if (historyLog[cellId] === undefined) {
                historyLog[cellId] = 0;
            }
            
            const tdValue = document.createElement('td');
            tdValue.id = `val_${cellId}`;
            tdValue.style.textAlign = 'center';
            tdValue.innerText = historyLog[cellId];
            tr.appendChild(tdValue);
            
           const tdControls = document.createElement('td');
        tdControls.style.textAlign = 'center';

            // Проверяем, содержит ли название миссии слово "пропуска" (или "пропуск")
           if (mission.toLowerCase().includes('пропуск')) {
            // Для миссий пропуска добавляем кнопку сброса с большим отступом слева (margin-left: 25px)
            tdControls.innerHTML = `
                <button onclick="changeCounter('${cellId}', -1)" style="padding: 2px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">-1</button>
                <button onclick="changeCounter('${cellId}', 1)" style="padding: 2px 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">+1</button>
                <button onclick="resetCounter('${cellId}')" style="padding: 2px 10px; margin-left: 300px; background: #34495e; color: white; border: none; border-radius: 4px; cursor: pointer;">🔄</button>
            `;
            } else {
            // Для всех остальных обычных счетчиков оставляем только две кнопки
            tdControls.innerHTML = `
                <button onclick="changeCounter('${cellId}', -1)" style="padding: 2px 10px; margin-right: 5px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">-1</button>
                <button onclick="changeCounter('${cellId}', 1)" style="padding: 2px 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">+1</button>
            `;
              }
            tr.appendChild(tdControls);
            tableBody.appendChild(tr);
        });
        return;
    }
    const columns = getColumns();

    columns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'checkbox-cell';
        th.innerHTML = col.label + (col.subLabel ? `<span class="time-label">${col.subLabel}</span>` : '');
        headerRow.appendChild(th);
    });
    if (filteredMissions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${columns.length + 1}" style="text-align:center; color:var(--text-muted); padding: 30px;">Ничего не найдено</td></tr>`;
        return;
    }

    filteredMissions.forEach(mission => {
        const tr = document.createElement('tr');
        
        const tdName = document.createElement('td');
        tdName.innerText = mission;
        tr.appendChild(tdName);

        columns.forEach(col => {
            const tdCheck = document.createElement('td');
            tdCheck.className = 'checkbox-cell';

            const cellId =`${currentFolder}_${mission}_${col.key}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox';
            checkbox.checked = !!historyLog[cellId]; 

            checkbox.onchange = (e) => {
                if (e.target.checked) {
                    historyLog[cellId] = true;
                } else {
                    delete historyLog[cellId]; 
                }
                saveData();
            };

            tdCheck.appendChild(checkbox);
            tr.appendChild(tdCheck);
        });

        tableBody.appendChild(tr);
    });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
});

renderFolders();
renderTable();

function changeCounter(cellId, delta) {
    historyLog[cellId] = Math.max(0, (historyLog[cellId] || 0) + delta);
    const valueElement = document.getElementById(`val_${cellId}`);
    if (valueElement) {
        valueElement.innerText = historyLog[cellId];
    }
    saveData();
}
function resetCounter(cellId) {
        historyLog[cellId] = 0;
        const valueElement = document.getElementById(`val_${cellId}`);
        if (valueElement) {
            valueElement.innerText = 0;
        }
        saveData();
    
}