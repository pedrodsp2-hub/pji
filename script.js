// ESTADO DO JOGO
const appState = {
    isLoggedIn: false,
    userName: "Jogador",
    password: "123",
    points: 2750,
    divisionXP: 140,
    notificationsEnabled: false,
    dailyBattleBonusClaimed: false,
    habits: [
        { id: 1, title: 'Beber água', desc: '2 Litros por dia', symbol: '💧', done: true, days: [true, true, true, true, true] },
        { id: 2, title: 'Correr 2km', desc: 'Exercício matinal', symbol: '🏃', done: false, days: [true, true, false, false, false] }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    renderHabits();
    updateEnergyAndStats();
    renderRanking();
});

function initEvents() {
    // FORM LOGIN
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('login-name').value.trim();
            const passInput = document.getElementById('login-pass').value;
            if (nameInput) appState.userName = nameInput;
            appState.password = passInput;
            appState.isLoggedIn = true;
            
            updateUIUserNames();
            navigateTo('screen-home');
        });
    }

    // FORM CRIAR HÁBITO
    const createHabitForm = document.getElementById('create-habit-form');
    if (createHabitForm) createHabitForm.addEventListener('submit', handleCreateHabit);

    // FORM EDITAR HÁBITO
    const editHabitForm = document.getElementById('edit-habit-form');
    if (editHabitForm) editHabitForm.addEventListener('submit', handleEditHabit);

    // FORM ALTERAR SENHA
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) passwordForm.addEventListener('submit', handleChangePassword);

    // SELETOR DE ÍCONES
    const symbolBtns = document.querySelectorAll('.symbol-btn');
    symbolBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            symbolBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function updateUIUserNames() {
    document.getElementById('header-user-name').innerText = appState.userName;
    document.getElementById('profile-user-name').innerText = appState.userName;
    document.getElementById('battle-user-name').innerText = `Você (${appState.userName})`;
}

// NAVEGAÇÃO
function navigateTo(screenId) {
    if (!appState.isLoggedIn && screenId !== 'screen-login') screenId = 'screen-login';

    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));

    const loginScreen = document.getElementById('screen-login');
    const mainHeader = document.getElementById('main-header');

    if (screenId === 'screen-login') {
        loginScreen.classList.add('active');
        mainHeader.classList.remove('active');
    } else {
        loginScreen.classList.remove('active');
        mainHeader.classList.add('active');

        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-screen') === screenId);
        });

        if (screenId === 'screen-battle') startNewBattle();
        if (screenId === 'screen-ranking') renderRanking();
    }
}

function handleLogout() {
    appState.isLoggedIn = false;
    navigateTo('screen-login');
}

// RENDERIZAR E GERENCIAR HÁBITOS
function renderHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    container.innerHTML = '';

    appState.habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.innerHTML = `
            <div class="habit-top">
                <div class="habit-info">
                    <span class="habit-icon">${habit.symbol}</span>
                    <div>
                        <h4>${habit.title}</h4>
                        <p style="font-size: 11px; color: var(--text-muted);">${habit.desc}</p>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="btn-icon" onclick="openEditModal(${habit.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteHabit(${habit.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                    <button class="btn-toggle-habit ${habit.done ? 'done' : ''}" onclick="toggleHabit(${habit.id})">
                        ${habit.done ? '<i class="fa-solid fa-check"></i> <span>Concluído</span>' : '<span>Concluir</span>'}
                    </button>
                </div>
            </div>
            <div class="habit-history">
                <span>Dias:</span>
                <div class="days-row">
                    ${habit.days.map((checked, index) => `<span class="day ${checked ? 'checked' : ''}" onclick="toggleHabitDay(${habit.id}, ${index})"></span>`).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// PREENCHIMENTO SEQUENCIAL
function toggleHabit(id) {
    const habit = appState.habits.find(h => h.id === id);
    if (!habit) return;

    // Procura o primeiro dia não marcado (da esquerda para a direita)
    const nextDayIndex = habit.days.indexOf(false);

    if (nextDayIndex !== -1) {
        // Preenche o próximo dia livre
        habit.days[nextDayIndex] = true;
        appState.divisionXP += 20;
    } else {
        // Se todos os 5 dias já estiverem marcados, desmarca o último
        const lastDayIndex = habit.days.lastIndexOf(true);
        if (lastDayIndex !== -1) {
            habit.days[lastDayIndex] = false;
        }
    }

    // O hábito só é considerado 100% "done" quando todos os 5 dias forem preenchidos
    habit.done = habit.days.every(day => day === true);

    renderHabits();
    updateEnergyAndStats();
}

function toggleHabitDay(id, dayIndex) {
    const habit = appState.habits.find(h => h.id === id);
    if (habit) {
        habit.days[dayIndex] = !habit.days[dayIndex];
        habit.done = habit.days.every(day => day === true);
        renderHabits();
        updateEnergyAndStats();
    }
}

function deleteHabit(id) {
    if (confirm("Tem certeza que deseja excluir este hábito?")) {
        appState.habits = appState.habits.filter(h => h.id !== id);
        renderHabits();
        updateEnergyAndStats();
    }
}

function handleCreateHabit(e) {
    e.preventDefault();
    const title = document.getElementById('habit-title').value.trim();
    const desc = document.getElementById('habit-desc').value.trim() || 'Sem meta definida';
    const activeSymbolBtn = document.querySelector('.symbol-btn.active');
    const symbol = activeSymbolBtn ? activeSymbolBtn.getAttribute('data-symbol') : '💧';

    if (title) {
        const newHabit = {
            id: Date.now(),
            title,
            desc,
            symbol,
            done: false,
            days: [false, false, false, false, false]
        };
        appState.habits.push(newHabit);
        renderHabits();
        updateEnergyAndStats();
        document.getElementById('habit-title').value = '';
        document.getElementById('habit-desc').value = '';
        navigateTo('screen-home');
    }
}

// MODAL EDITAR HÁBITO
function openEditModal(id) {
    const habit = appState.habits.find(h => h.id === id);
    if (habit) {
        document.getElementById('edit-habit-id').value = habit.id;
        document.getElementById('edit-habit-title').value = habit.title;
        document.getElementById('edit-habit-desc').value = habit.desc;
        document.getElementById('edit-habit-modal').classList.add('active');
    }
}

function closeEditModal() {
    document.getElementById('edit-habit-modal').classList.remove('active');
}

function handleEditHabit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-habit-id').value);
    const habit = appState.habits.find(h => h.id === id);
    if (habit) {
        habit.title = document.getElementById('edit-habit-title').value.trim();
        habit.desc = document.getElementById('edit-habit-desc').value.trim();
        renderHabits();
        closeEditModal();
    }
}

function updateEnergyAndStats() {
    const total = appState.habits.length;
    const completed = appState.habits.filter(h => h.done).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById('energy-bar').style.width = percentage + '%';
    document.getElementById('energy-text').innerText = percentage + '%';
    document.getElementById('user-points-display').innerText = (appState.points + (completed * 50)).toLocaleString('pt-BR') + ' pts';
}

// PERFIL & NOTIFICAÇÕES & SENHA
function openPasswordModal() {
    document.getElementById('password-modal').classList.add('active');
}

function closePasswordModal() {
    document.getElementById('password-modal').classList.remove('active');
}

function handleChangePassword(e) {
    e.preventDefault();
    const current = document.getElementById('current-pass').value;
    const newP = document.getElementById('new-pass').value;

    if (current !== appState.password) {
        alert("Senha atual incorreta!");
        return;
    }
    appState.password = newP;
    alert("Senha alterada com sucesso!");
    closePasswordModal();
    document.getElementById('current-pass').value = '';
    document.getElementById('new-pass').value = '';
}

function toggleNotifications(checkbox) {
    appState.notificationsEnabled = checkbox.checked;
    alert(appState.notificationsEnabled ? "Notificações ativadas!" : "Notificações desativadas.");
}

// TUTORIAL
function openTutorial() {
    document.getElementById('tutorial-modal').classList.add('active');
}
function closeTutorial() {
    document.getElementById('tutorial-modal').classList.remove('active');
}

// SISTEMA DE RANKING & DIVISÃO
function renderRanking() {
    const xp = appState.divisionXP;
    let league = "Liga Bronze 🛡️";
    let icon = "🛡️";
    let nextThreshold = 300;

    if (xp >= 300 && xp < 800) {
        league = "Liga Prata ⚔️";
        icon = "⚔️";
        nextThreshold = 800;
    } else if (xp >= 800) {
        league = "Liga Ouro 👑";
        icon = "👑";
        nextThreshold = "MAX";
    }

    document.getElementById('league-name').innerText = league;
    document.getElementById('league-icon').innerText = icon;
    document.getElementById('division-xp-text').innerText = `${xp} / ${nextThreshold} XP`;

    const opponents = [
        { name: "Lucas HabitMaster", xp: 450, league: "Liga Prata ⚔️" },
        { name: appState.userName, xp: appState.divisionXP, league: league, isUser: true },
        { name: "Mariana_Runner", xp: 120, league: "Liga Bronze 🛡️" },
        { name: "Pedro_Focus", xp: 90, league: "Liga Bronze 🛡️" }
    ];

    opponents.sort((a, b) => b.xp - a.xp);

    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = '';
    opponents.forEach((op, idx) => {
        const tr = document.createElement('tr');
        if (op.isUser) tr.className = 'current-user';
        tr.innerHTML = `
            <td class="rank-position">#${idx + 1}</td>
            <td>${op.name} ${op.isUser ? ' (Você)' : ''}</td>
            <td>${op.league}</td>
            <td><strong>${op.xp} XP</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// JOGO DE BATALHA
const battle = {
    player: { maxHp: 100, hp: 100, maxEnergy: 3, energy: 3, shield: 0 },
    enemy: { maxHp: 150, hp: 150, nextAttack: 20 },
    isGameOver: false
};

function startNewBattle() {
    battle.player.hp = battle.player.maxHp;
    battle.player.energy = battle.player.maxEnergy;
    battle.player.shield = 0;
    battle.enemy.hp = battle.enemy.maxHp;
    battle.isGameOver = false;
    randomizeEnemyIntent();
    updateBattleUI();
}

function randomizeEnemyIntent() {
    const attacks = [15, 20, 25];
    battle.enemy.nextAttack = attacks[Math.floor(Math.random() * attacks.length)];
}

function updateBattleUI() {
    document.getElementById('player-hp-bar').style.width = (battle.player.hp / battle.player.maxHp * 100) + '%';
    document.getElementById('player-hp-text').innerText = `${battle.player.hp} / ${battle.player.maxHp} HP`;
    
    document.getElementById('enemy-hp-bar').style.width = (battle.enemy.hp / battle.enemy.maxHp * 100) + '%';
    document.getElementById('enemy-hp-text').innerText = `${battle.enemy.hp} / ${battle.enemy.maxHp} HP`;
    
    document.getElementById('current-energy').innerText = battle.player.energy;

    const shieldBox = document.getElementById('player-shield-box');
    if (battle.player.shield > 0) {
        shieldBox.style.display = 'block';
        document.getElementById('player-shield').innerText = battle.player.shield;
    } else {
        shieldBox.style.display = 'none';
    }

    document.getElementById('enemy-intent-box').innerHTML = `<i class="fa-solid fa-crosshairs"></i> Vai Atacar (${battle.enemy.nextAttack} Dano)`;

    document.querySelectorAll('.battle-card').forEach(card => {
        const cost = parseInt(card.querySelector('.card-cost').innerText);
        card.classList.toggle('disabled', cost > battle.player.energy || battle.isGameOver);
    });
}

function playCard(type) {
    if (battle.isGameOver) return;
    let cost = 0;

    if (type === 'ataque' && battle.player.energy >= 1) { cost = 1; damageEnemy(20); }
    else if (type === 'defesa' && battle.player.energy >= 1) { cost = 1; battle.player.shield += 15; }
    else if (type === 'magia' && battle.player.energy >= 2) { cost = 2; damageEnemy(45); }
    else return;

    battle.player.energy -= cost;
    updateBattleUI();
    checkWinCondition();
}

function damageEnemy(amount) {
    battle.enemy.hp = Math.max(0, battle.enemy.hp - amount);
    const enemyZone = document.querySelector('.enemy-zone');
    enemyZone.classList.add('shake');
    setTimeout(() => enemyZone.classList.remove('shake'), 300);
}

function endTurn() {
    if (battle.isGameOver) return;
    let dmg = battle.enemy.nextAttack;

    if (battle.player.shield > 0) {
        if (battle.player.shield >= dmg) {
            battle.player.shield -= dmg;
            dmg = 0;
        } else {
            dmg -= battle.player.shield;
            battle.player.shield = 0;
        }
    }

    if (dmg > 0) {
        battle.player.hp = Math.max(0, battle.player.hp - dmg);
        const playerZone = document.getElementById('player-character');
        playerZone.classList.add('shake');
        setTimeout(() => playerZone.classList.remove('shake'), 300);
    }

    battle.player.energy = battle.player.maxEnergy;
    battle.player.shield = 0;
    randomizeEnemyIntent();
    updateBattleUI();
    checkWinCondition();
}

function checkWinCondition() {
    if (battle.enemy.hp === 0) {
        battle.isGameOver = true;
        let bonusText = "";
        if (!appState.dailyBattleBonusClaimed) {
            appState.divisionXP += 100;
            appState.dailyBattleBonusClaimed = true;
            bonusText = "\n🏆 Você ganhou +100 XP de Bônus Diário para o Ranking!";
        }
        setTimeout(() => {
            alert(`✨ VITÓRIA! ${appState.userName} derrotou o monstro!${bonusText}`);
            startNewBattle();
        }, 300);
    } else if (battle.player.hp === 0) {
        battle.isGameOver = true;
        setTimeout(() => {
            alert("💀 GAME OVER! Você foi derrotado.");
            startNewBattle();
        }, 300);
    }
}