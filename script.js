// ESTADO GERAL DA APLICAÇÃO
const appState = {
    isLoggedIn: false,
    userName: "Jogador",
    points: 2750,
};

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    updateEnergyAndStats();
});

function initEvents() {
    // LOGIN: Captura o nome
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('login-name').value.trim();
            if (nameInput) appState.userName = nameInput;
            
            appState.isLoggedIn = true;
            updateUIUserNames();
            navigateTo('screen-home');
        });
    }

    // CRIAR HÁBITO
    const createHabitForm = document.getElementById('create-habit-form');
    if (createHabitForm) createHabitForm.addEventListener('submit', handleCreateHabit);

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

// NAVEGAÇÃO ENTRE TELAS
function navigateTo(screenId) {
    if (!appState.isLoggedIn && screenId !== 'screen-login') {
        screenId = 'screen-login';
    }

    const pages = document.querySelectorAll('.page-section');
    pages.forEach(p => p.classList.remove('active'));

    const loginScreen = document.getElementById('screen-login');
    const mainHeader = document.getElementById('main-header');

    if (screenId === 'screen-login') {
        loginScreen.classList.add('active');
        mainHeader.classList.remove('active');
    } else {
        loginScreen.classList.remove('active');
        mainHeader.classList.add('active');

        const targetPage = document.getElementById(screenId);
        if (targetPage) targetPage.classList.add('active');

        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            if (btn.getAttribute('data-screen') === screenId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        if (screenId === 'screen-battle') startNewBattle();
    }
}

function handleLogout() {
    appState.isLoggedIn = false;
    document.getElementById('login-name').value = '';
    document.getElementById('login-pass').value = '';
    navigateTo('screen-login');
}

// SISTEMA DE HÁBITOS
function toggleHabitStatus(button) {
    const isDone = button.classList.contains('done');
    const habitCard = button.closest('.habit-card');
    const days = habitCard.querySelectorAll('.day');
    const lastDay = days[days.length - 1];

    if (isDone) {
        button.classList.remove('done');
        button.innerHTML = '<span>Concluir</span>';
        if (lastDay) lastDay.classList.remove('checked');
    } else {
        button.classList.add('done');
        button.innerHTML = '<i class="fa-solid fa-check"></i> <span>Concluído</span>';
        if (lastDay) lastDay.classList.add('checked');
    }
    updateEnergyAndStats();
}

function toggleDayCircle(circle) {
    circle.classList.toggle('checked');
    const habitCard = circle.closest('.habit-card');
    const days = habitCard.querySelectorAll('.day');
    const lastDay = days[days.length - 1];
    const button = habitCard.querySelector('.btn-toggle-habit');

    if (lastDay && button) {
        if (lastDay.classList.contains('checked')) {
            button.classList.add('done');
            button.innerHTML = '<i class="fa-solid fa-check"></i> <span>Concluído</span>';
        } else {
            button.classList.remove('done');
            button.innerHTML = '<span>Concluir</span>';
        }
    }
    updateEnergyAndStats();
}

function updateEnergyAndStats() {
    const allHabits = document.querySelectorAll('.habit-card');
    const completedHabits = document.querySelectorAll('.btn-toggle-habit.done');
    if (allHabits.length === 0) return;

    const percentage = Math.round((completedHabits.length / allHabits.length) * 100);
    const energyBar = document.getElementById('energy-bar');
    const energyText = document.getElementById('energy-text');

    if (energyBar && energyText) {
        energyBar.style.width = percentage + '%';
        energyText.innerText = percentage + '%';
    }

    const pointsDisplay = document.getElementById('user-points-display');
    if (pointsDisplay) {
        const bonusPoints = completedHabits.length * 50;
        pointsDisplay.innerText = (appState.points + bonusPoints).toLocaleString('pt-BR') + ' pts';
    }
}

function handleCreateHabit(e) {
    e.preventDefault();
    const titleInput = document.getElementById('habit-title');
    const descInput = document.getElementById('habit-desc');
    const activeSymbolBtn = document.querySelector('.symbol-btn.active');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim() || 'Hábito Diário';
    const symbol = activeSymbolBtn ? activeSymbolBtn.getAttribute('data-symbol') : '💧';

    if (title) {
        const habitsContainer = document.getElementById('habits-container');
        const newCard = document.createElement('div');
        newCard.className = 'habit-card';
        newCard.innerHTML = `
            <div class="habit-top">
                <div class="habit-info"><span class="habit-icon">${symbol}</span><div><h4>${title}</h4><p class="habit-desc">${desc}</p></div></div>
                <button class="btn-toggle-habit" onclick="toggleHabitStatus(this)"><span>Concluir</span></button>
            </div>
            <div class="habit-history">
                <span>Dias da semana:</span>
                <div class="days-row">
                    <span class="day" onclick="toggleDayCircle(this)"></span><span class="day" onclick="toggleDayCircle(this)"></span><span class="day" onclick="toggleDayCircle(this)"></span><span class="day" onclick="toggleDayCircle(this)"></span><span class="day" onclick="toggleDayCircle(this)"></span>
                </div>
            </div>`;
        habitsContainer.appendChild(newCard);
        titleInput.value = '';
        descInput.value = '';
        updateEnergyAndStats();
        navigateTo('screen-home');
    }
}

// SISTEMA DO JOGO DE CARTAS
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
    const attacks = [15, 20, 25, 30];
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

    const cards = document.querySelectorAll('.battle-card');
    cards.forEach(card => {
        const cost = parseInt(card.querySelector('.card-cost').innerText);
        if (cost > battle.player.energy || battle.isGameOver) {
            card.classList.add('disabled');
        } else {
            card.classList.remove('disabled');
        }
    });
}

function playCard(type) {
    if (battle.isGameOver) return;
    let energyCost = 0;

    if (type === 'ataque' && battle.player.energy >= 1) {
        energyCost = 1; damageEnemy(20);
    } else if (type === 'defesa' && battle.player.energy >= 1) {
        energyCost = 1; battle.player.shield += 15;
    } else if (type === 'magia' && battle.player.energy >= 2) {
        energyCost = 2; damageEnemy(45);
    } else return;

    battle.player.energy -= energyCost;
    updateBattleUI();
    checkWinCondition();
}

function damageEnemy(amount) {
    battle.enemy.hp -= amount;
    if (battle.enemy.hp < 0) battle.enemy.hp = 0;
    const enemyZone = document.getElementById('enemy-character');
    enemyZone.classList.add('shake');
    setTimeout(() => enemyZone.classList.remove('shake'), 300);
}

function endTurn() {
    if (battle.isGameOver) return;
    let damageToPlayer = battle.enemy.nextAttack;

    if (battle.player.shield > 0) {
        if (battle.player.shield >= damageToPlayer) {
            battle.player.shield -= damageToPlayer;
            damageToPlayer = 0;
        } else {
            damageToPlayer -= battle.player.shield;
            battle.player.shield = 0;
        }
    }

    if (damageToPlayer > 0) {
        battle.player.hp -= damageToPlayer;
        if (battle.player.hp < 0) battle.player.hp = 0;
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
        setTimeout(() => {
            alert(`✨ VITÓRIA! ${appState.userName} derrotou o inimigo!`);
            startNewBattle();
        }, 500);
    } else if (battle.player.hp === 0) {
        battle.isGameOver = true;
        setTimeout(() => {
            alert("💀 GAME OVER! Você ficou sem vida.");
            startNewBattle();
        }, 500);
    }
}