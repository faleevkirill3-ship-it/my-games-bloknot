// ==========================================
// 1. НАСТРОЙКА ИГР И МИССИЙ (БАЗА ДАННЫХ)
// ==========================================
const gameData = {
    "Stardew Valley": {
        daily: ["Собрать капусту", "Собрать тыкву", "Полить огурцы", "Погладить кота"],
        hourly: ["Собрать кабачок", "Проверить улей"],
        counters:["Собрать кабачок", "Проверить улей"]
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
            tdControls.innerHTML = `
                <button onclick="changeCounter('${cellId}', -1)" style="padding: 2px 10px; margin-right: 5px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">-1</button>
                <button onclick="changeCounter('${cellId}', 1)" style="padding: 2px 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">+1</button>
            `;
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