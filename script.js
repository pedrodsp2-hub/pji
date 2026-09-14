// ESTADO DO JOGO
const appState = {
    isLoggedIn: false,
    userName: "",
    userAvatar: "🐸",
    password: "",
    points: 0,
    streak: 8,
    divisionXP: 0,
    notificationsEnabled: false,
    dailyBattleBonusClaimed: false,
    history: [], // Armazena o histórico
    habits: [
        { id: 1, title: 'Beber água', desc: '2 Litros por dia', symbol: '💧', done: false, pointsClaimed: false },
        { id: 2, title: 'Correr 2km', desc: 'Exercício matinal', symbol: '🏃', done: false, pointsClaimed: false }
    ],
    deck: [
        { id: 1, name: 'Golpe', icon: 'fa-khanda', color: '#e74c3c', unlocked: true },
        { id: 2, name: 'Escudo', icon: 'fa-shield-halved', color: '#3498db', unlocked: true },
        { id: 3, name: 'Boss Killer', icon: 'fa-skull', color: '#8e44ad', unlocked: true },
        { id: 4, name: 'Bola de Fogo', icon: 'fa-fire', color: '#e67e22', unlocked: true },
    
        { id: 5, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 6, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 7, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 8, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 9, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 10, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 11, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 12, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 13, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 14, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false },
        { id: 15, name: '???', icon: 'fa-lock', color: '#94a3b8', unlocked: false }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    renderHabits();
    updateEnergyAndStats();
    renderRanking();
    updateUIUserProfile();
    renderDeck();
});

function initEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('login-name').value.trim();
            const passInput = document.getElementById('login-pass').value;
            if (nameInput) appState.userName = nameInput;
            appState.password = passInput;
            appState.isLoggedIn = true;
            
            updateUIUserProfile();
            logHistory("Login realizado no sistema.");
            navigateTo('screen-home');
        });
    }

    const createHabitForm = document.getElementById('create-habit-form');
    if (createHabitForm) createHabitForm.addEventListener('submit', handleCreateHabit);

    const editHabitForm = document.getElementById('edit-habit-form');
    if (editHabitForm) editHabitForm.addEventListener('submit', handleEditHabit);

    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) editProfileForm.addEventListener('submit', handleSaveProfile);

    const avatarFileInput = document.getElementById('profile-avatar-file');
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    appState.userAvatar = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const passwordForm = document.getElementById('password-form');
    if (passwordForm) passwordForm.addEventListener('submit', handleChangePassword);

    const symbolBtns = document.querySelectorAll('.symbol-btn');
    symbolBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            symbolBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function updateUIUserProfile() {
    document.getElementById('header-user-name').innerText = appState.userName;
    document.getElementById('profile-user-name').innerText = appState.userName;
    document.getElementById('profile-name-input').value = appState.userName;
    document.getElementById('battle-user-name').innerText = `Você (${appState.userName})`;

    renderAvatarElement(document.getElementById('header-avatar-box'), appState.userAvatar);
    renderAvatarElement(document.getElementById('profile-avatar-display'), appState.userAvatar);
    renderAvatarElement(document.getElementById('battle-user-avatar'), appState.userAvatar);
}

function renderAvatarElement(element, avatarValue) {
    if (!element) return;
    if (avatarValue.startsWith('http') || avatarValue.startsWith('data:image')) {
        element.innerHTML = `<img src="${avatarValue}" alt="Avatar">`;
    } else {
        element.innerHTML = avatarValue;
    }
}

function selectPresetAvatar(emoji) {
    appState.userAvatar = emoji;
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.toggle('selected', opt.innerText === emoji);
    });
    document.getElementById('profile-avatar-url').value = '';
}

function handleSaveProfile(e) {
    e.preventDefault();
    const newName = document.getElementById('profile-name-input').value.trim();
    const newUrl = document.getElementById('profile-avatar-url').value.trim();

    if (newName) appState.userName = newName;
    if (newUrl) appState.userAvatar = newUrl;

    updateUIUserProfile();
    renderRanking();
    logHistory("Perfil atualizado.");
    alert("Perfil atualizado com sucesso!");
}

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
        if (screenId === 'screen-history') renderHistory();
    }
}

function handleLogout() {
    appState.isLoggedIn = false;
    navigateTo('screen-login');
}

function renderHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    container.innerHTML = '';

    // Dias da semana ordenados: Domingo (D) a Sábado (S)
    const daysOfWeek = [
        { label: 'D', name: 'Domingo' },
        { label: 'S', name: 'Segunda' },
        { label: 'T', name: 'Terça' },
        { label: 'Q', name: 'Quarta' },
        { label: 'Q', name: 'Quinta' },
        { label: 'S', name: 'Sexta' },
        { label: 'S', name: 'Sábado' }
    ];
    const todayIndex = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    appState.habits.forEach(habit => {
        const weekDaysHTML = daysOfWeek.map((dayObj, idx) => {
            const isToday = idx === todayIndex;
            // Marca se já passou na semana ou se é o dia atual e o hábito foi concluído
            const isChecked = idx < todayIndex || (isToday && habit.done);
            const classes = `day ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''}`;
            return `<span class="${classes}" title="${dayObj.name}${isToday ? ' (Hoje)' : ''}">${dayObj.label}</span>`;
        }).join('');

        const card = document.createElement('div');
        card.className = `habit-card ${habit.done ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="habit-main">
                <div class="habit-left">
                    <div class="habit-icon-wrapper">
                        <span class="habit-icon">${habit.symbol}</span>
                    </div>
                    <div class="habit-details">
                        <h4>${habit.title}</h4>
                        <p class="habit-desc">${habit.desc}</p>
                        
                        <div class="habit-rewards">
                            <span class="reward-energy"><i class="fa-solid fa-bolt"></i> +1 Energia</span>
                            <span class="reward-points"><i class="fa-solid fa-star"></i> +20 XP</span>
                        </div>
                        
                        <div class="habit-week">
                            ${weekDaysHTML}
                        </div>
                    </div>
                </div>
                
                <div class="habit-right">
                    <button class="btn-toggle-habit ${habit.done ? 'done' : ''}" onclick="toggleHabit(${habit.id})">
                        ${habit.done ? '<i class="fa-solid fa-check"></i> Concluído' : 'Concluir'}
                    </button>
                    <div class="habit-actions-bottom">
                        <button class="btn-icon" onclick="openEditModal(${habit.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon delete" onclick="deleteHabit(${habit.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleHabit(id) {
    const habit = appState.habits.find(h => h.id === id);
    if (!habit) return;

    if (habit.done) {
        habit.done = false;
        logHistory(`Hábito desmarcado: ${habit.title}`);
        
        // Remove energia caso desmarque e esteja acima do limite
        if (battle.player.energy > 0) {
            battle.player.energy -= 1; 
        }
    } else {
        habit.done = true;
        logHistory(`Hábito concluído: ${habit.title}`);
        
        if (!habit.pointsClaimed) {
            appState.divisionXP += 20;
            habit.pointsClaimed = true;
        }
        
        // Ganha energia na hora
        if (battle.player.energy < 3) {
            battle.player.energy += 1;
        }
    }

    renderHabits();
    updateEnergyAndStats();
}

function deleteHabit(id) {
    const habit = appState.habits.find(h => h.id === id);
    if (confirm("Deseja excluir este hábito?")) {
        appState.habits = appState.habits.filter(h => h.id !== id);
        logHistory(`Hábito excluído: ${habit.title}`);
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
        appState.habits.push({
            id: Date.now(),
            title,
            desc,
            symbol,
            done: false,
            pointsClaimed: false
        });
        logHistory(`Novo hábito criado: ${title}`);
        renderHabits();
        updateEnergyAndStats();
        document.getElementById('habit-title').value = '';
        document.getElementById('habit-desc').value = '';
        navigateTo('screen-home');
    }
}

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
        logHistory(`Hábito editado: ${habit.title}`);
        renderHabits();
        closeEditModal();
    }
}

function updateEnergyAndStats() {
    const total = appState.habits.length;
    const completed = appState.habits.filter(h => h.done).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 1. Atualiza a barra do dashboard
    document.getElementById('energy-bar').style.width = percentage + '%';
    document.getElementById('energy-text').innerText = percentage + '%';
    document.getElementById('user-points-display').innerText = (appState.points + (completed * 50)).toLocaleString('pt-BR') + ' pts';

    const streakDisplay = document.getElementById('streak-display');
    if (streakDisplay) {
        streakDisplay.innerText = `${appState.streak} Dias`;
    }

    // 2. Conecta com a Batalha: Cada hábito concluído dá 1 de energia máxima (Limite de 3)
    battle.player.maxEnergy = Math.min(3, completed);
    
    // 3. Impede que a energia atual fique maior que o limite permitido
    if (battle.player.energy > battle.player.maxEnergy) {
        battle.player.energy = battle.player.maxEnergy;
    }

    // 4. Atualiza os botões e textos dentro da arena imediatamente
    if (typeof updateBattleUI === "function") {
        updateBattleUI();
    }
}

function openPasswordModal() { document.getElementById('password-modal').classList.add('active'); }
function closePasswordModal() { document.getElementById('password-modal').classList.remove('active'); }

function handleChangePassword(e) {
    e.preventDefault();
    const current = document.getElementById('current-pass').value;
    const newP = document.getElementById('new-pass').value;
    if (current !== appState.password) { alert("Senha atual incorreta!"); return; }
    appState.password = newP;
    alert("Senha alterada!");
    closePasswordModal();
}

function toggleNotifications(cb) { appState.notificationsEnabled = cb.checked; }
function openTutorial() { document.getElementById('tutorial-modal').classList.add('active'); }
function closeTutorial() { document.getElementById('tutorial-modal').classList.remove('active'); }

function renderRanking() {
    document.getElementById('league-name').innerText = "Divisão Obsidiana 🛡️";
    document.getElementById('league-icon').innerText = "💎";
    document.getElementById('division-xp-text').innerText = `${appState.divisionXP} XP`;

    const opponents = [
        { name: "Cinthia Ribeiro", xp: 733, avatar: "🐱" },
        { name: "Misha L", xp: 408, avatar: "🦊" },
        { name: "Clarinha", xp: 240, avatar: "🦁" },
        { name: appState.userName, xp: appState.divisionXP, avatar: appState.userAvatar, isUser: true },
        { name: "Ana Cecília Soares", xp: 218, avatar: "🤖" },
        { name: "Carla Vaz", xp: 190, avatar: "🐱" },
        { name: "Mora Serra", xp: 150, avatar: "🥷" }
    ];

    opponents.sort((a, b) => b.xp - a.xp);

    const podiumContainer = document.getElementById('podium-container');
    podiumContainer.innerHTML = '';
    
    if (opponents.length >= 3) {
        const top3 = [opponents[1], opponents[0], opponents[2]];
        const classes = ['second', 'first', 'third'];
        const crowns = ['🥈', '👑 🥇', '🥉'];

        top3.forEach((op, idx) => {
            const item = document.createElement('div');
            item.className = `podium-item ${classes[idx]}`;
            const avatarHTML = op.avatar.startsWith('http') || op.avatar.startsWith('data:image') ? `<img src="${op.avatar}">` : op.avatar;
            item.innerHTML = `
                <div class="podium-avatar">
                    <span class="podium-crown">${crowns[idx]}</span>
                    ${avatarHTML}
                </div>
                <span class="podium-name">${op.name}</span>
                <span class="podium-xp">${op.xp} XP</span>
            `;
            podiumContainer.appendChild(item);
        });
    }

    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';

    opponents.forEach((op, idx) => {
        const item = document.createElement('div');
        item.className = `ranking-item ${op.isUser ? 'current-user' : ''}`;
        const avatarHTML = op.avatar.startsWith('http') || op.avatar.startsWith('data:image') ? `<img src="${op.avatar}">` : op.avatar;

        item.innerHTML = `
            <div class="ranking-left">
                <span class="ranking-pos">${idx + 1}</span>
                <div class="avatar ranking-avatar">${avatarHTML}</div>
                <span class="ranking-name">${op.name} ${op.isUser ? ' (Você)' : ''}</span>
            </div>
            <span class="ranking-xp-badge">${op.xp} XP</span>
        `;
        rankingList.appendChild(item);
    });
}

function renderDeck() {
    const container = document.getElementById('deck-container');
    if (!container) return;
    container.innerHTML = '';

    appState.deck.forEach(card => {
        const el = document.createElement('div');
        el.className = `deck-item ${card.unlocked ? '' : 'locked'}`;

        el.innerHTML = `
            <div class="deck-card-visual" style="border-color: ${card.unlocked ? card.color : '#64748b'}">
                <i class="fa-solid ${card.icon}" style="color: ${card.unlocked ? card.color : '#cbd5e1'}; font-size: ${card.unlocked ? '40px' : '28px'}; text-shadow: 0 0 10px ${card.unlocked ? card.color : 'transparent'};"></i>
            </div>
            <span class="deck-card-name">${card.name}</span>
        `;
        container.appendChild(el);
    });
}

const battle = { player: { maxHp: 100, hp: 100, maxEnergy: 0, energy: 0, shield: 0 }, enemy: { maxHp: 150, hp: 150, nextAttack: 20 }, isGameOver: false };

function startNewBattle() {
    battle.player.hp = battle.player.maxHp;
    battle.player.energy = battle.player.maxEnergy; // Inicia com a energia ganha pelos hábitos
    battle.player.shield = 0;
    battle.enemy.hp = battle.enemy.maxHp;
    battle.isGameOver = false;
    randomizeEnemyIntent();
    updateBattleUI();
    logHistory("Nova batalha iniciada contra o Cavaleiro Corrompido!");
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
    let actionDesc = "";

    if (type === 'ataque' && battle.player.energy >= 1) { 
        cost = 1; 
        damageEnemy(20); 
        actionDesc = "Jogou [Golpe Rápido] e causou 20 de dano.";
    }
    else if (type === 'defesa' && battle.player.energy >= 1) { 
        cost = 1; 
        battle.player.shield += 15; 
        actionDesc = "Jogou [Bloqueio] e ganhou +15 de Escudo.";
    }
    else if (type === 'magia' && battle.player.energy >= 2) { 
        cost = 2; 
        damageEnemy(45); 
        actionDesc = "Jogou [Bola de Fogo] e causou 45 de dano.";
    }
    else return;

    battle.player.energy -= cost;
    logHistory(`Batalha: ${actionDesc}`);
    
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
        logHistory(`Batalha: Inimigo atacou causando ${dmg} de dano direto.`);
    } else {
        logHistory(`Batalha: Inimigo tentou atacar, mas o seu escudo absorveu o impacto.`);
    }

    // A energia se restaura com base na quantidade de hábitos feitos
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
        logHistory("Vitória na Batalha! O monstro foi derrotado.");
        if (!appState.dailyBattleBonusClaimed) {
            appState.divisionXP += 100;
            appState.dailyBattleBonusClaimed = true;
            bonusText = "\n🏆 Você ganhou +100 XP de Bônus Diário para o Ranking!";
            logHistory("Ganhou +100 XP de bônus diário.");
        }
        setTimeout(() => {
            alert(`✨ VITÓRIA! ${appState.userName} derrotou o monstro!${bonusText}`);
            startNewBattle();
        }, 300);
    } else if (battle.player.hp === 0) {
        battle.isGameOver = true;
        logHistory("Derrota na Batalha! O jogador foi abatido.");
        setTimeout(() => {
            alert("💀 GAME OVER! Você foi derrotado.");
            startNewBattle();
        }, 300);
    }
}

// ==========================================
// NOVAS FUNÇÕES (HISTÓRICO E TEMA)
// ==========================================
function logHistory(text) {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    appState.history.unshift({ time, text }); // Adiciona sempre no topo
    
    // Limita a 50 registros para não pesar a memória
    if (appState.history.length > 50) {
        appState.history.pop();
    }
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (appState.history.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhuma ação registrada ainda.</p>';
        return;
    }

    appState.history.forEach(item => {
        const el = document.createElement('div');
        el.className = 'ranking-item'; 
        el.innerHTML = `
            <div class="ranking-left">
                <span class="ranking-pos" style="font-size: 11px; width: 45px;">${item.time}</span>
                <span class="ranking-name" style="font-weight: normal; font-size: 13px;">${item.text}</span>
            </div>
        `;
        container.appendChild(el);
    });
}

function toggleTheme(cb) {
    if (cb.checked) {
        document.body.classList.add('light-theme');
        logHistory("Configuração: Fundo Branco ativado.");
    } else {
        document.body.classList.remove('light-theme');
        logHistory("Configuração: Fundo Escuro ativado.");
    }
}