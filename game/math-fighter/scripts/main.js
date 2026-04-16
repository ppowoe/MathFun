// ==================== 玩家技能處理 ====================
function playerAction(skill) {
	if (!isPlayerTurn || !currentMonster) return;
	// isPlayerTurn = false;
	
	let config;
	let dmg = 0;
	let heal = 0;
	
	if (skill === 'normal') {
		config = getQuestionConfig('player_normal');
		dmg = config.answer > 10 ? 2 : 1;
	} else if (skill === 'special') {
		config = getQuestionConfig('player_special');
		dmg = 7;
	} else if (skill === 'heal') {
		config = getQuestionConfig('player_heal');
		heal = 5;
	}
	
	currentQuestion = {
		...config,
		isPlayerAction: true,
		skillType: skill,
		dmg: dmg,
		heal: heal
	};
	
	// 開啟 Modal
	$('#modal-mode').text('玩家行動');
	$('#question-display').html(currentQuestion.displayHTML);
	$('#timer-container').addClass('d-none');
	
	if (currentQuestion.isMCQ) {
		$('#mcq-container').removeClass('d-none').html('');
		currentQuestion.options.forEach(opt => {
			const btn = $(`<button class="col-6 col-md-3 btn btn-outline-light py-3 fs-3">${opt}</button>`);
			btn.on('click', () => handleMCQAnswer(opt));
			$('#mcq-container').append(btn);
		});
		$('#input-container').addClass('d-none');
	} else {
		$('#mcq-container').addClass('d-none');
		$('#input-container').removeClass('d-none');
		$('#answer-input').val('').focus();
	}
	
	$('#submit-btn').text('確認答案').removeClass('btn-danger').addClass('btn-success');
	questionModal.show();
}

// ==================== 怪物攻擊 ====================
function monsterAttack() {
	if (!currentMonster) return;
	
	// 選擇攻擊
	const attacks = currentMonster.attacks;
	const attack = attacks.length > 1 
		? attacks[Math.floor(Math.random() * attacks.length)] 
		: attacks[0];
	
	// 計算時間
	speedBonus = 1 + 0.1 * Math.floor((currentWave - 1) / 10);
	timeLimit = 10 / (attack.speed * speedBonus * difficultySpeedBonus);
	timeLimit = Math.max(3, timeLimit); // 最少3秒
	
	const config = getQuestionConfig(attack.qType);
	
	currentQuestion = {
		...config,
		isPlayerAction: false,
		dmg: attack.dmg,
		isVampiric: attack.isVampiric
	};
	
	// 開啟 Modal
	$('#modal-mode').html(`<span class="text-danger">⚔️ 怪物攻擊</span>`);
	$('#question-display').html(currentQuestion.displayHTML);
	$('#timer-container').removeClass('d-none');
	
	if (currentQuestion.isMCQ) {
		$('#mcq-container').removeClass('d-none').html('');
		currentQuestion.options.forEach(opt => {
			const btn = $(`<button class="col-6 col-md-3 btn btn-outline-light py-3 fs-3">${opt}</button>`);
			btn.on('click', () => handleMCQAnswer(opt));
			$('#mcq-container').append(btn);
		});
		$('#input-container').addClass('d-none');
	} else {
		$('#mcq-container').addClass('d-none');
		$('#input-container').removeClass('d-none');
		$('#answer-input').val('').focus();
	}
	
	$('#submit-btn').text('確認答案').addClass('btn-success');
	
	// 啟動計時器
	startTimer();
	questionModal.show();
}

function startTimer() {
	if (timerInterval) clearInterval(timerInterval);
	timerStartTime = Date.now();
	
	timerInterval = setInterval(() => {
		const elapsed = (Date.now() - timerStartTime) / 1000;
		const remaining = Math.max(0, timeLimit - elapsed);
		
		const percent = (remaining / timeLimit) * 100;
		$('#timer-progress').css('width', percent + '%');
		$('#time-remaining').text(remaining.toFixed(1) + ' 秒');
		
		if (remaining <= 0) {
			clearInterval(timerInterval);
			handleTimeout();
		}
	}, 50);
}

// ==================== 答案處理 ====================
function handleAnswer(submitted) {
	if (!currentQuestion) return;
	
	const isCorrect = parseInt(submitted) === currentQuestion.answer;
	
	// 關閉 Modal
	questionModal.hide();
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
	
	if (currentQuestion.isPlayerAction) {
		// 玩家回合
		isPlayerTurn = false
		if (isCorrect) {
			if (currentQuestion.dmg > 0) {
				currentMonster.hp -= currentQuestion.dmg;
				showToast(`✅ 答案正確！造成 ${currentQuestion.dmg} 點傷害！`, 'success');
			} else if (currentQuestion.heal > 0) {
				playerHp = Math.min(maxPlayerHp, playerHp + currentQuestion.heal);
				showToast(`✅ 答案正確！回復 ${currentQuestion.heal} 點血量！`, 'success');
			}
		} else {
			showToast('答錯了！技能失敗…', 'danger');
		}
		
		updatePlayerUI();
		updateMonsterUI();
		
		// 檢查怪物是否死亡
		if (currentMonster.hp <= 0) {
			nextWave();
			return;
		}
		
		// 怪物攻擊
		setTimeout(() => {
			monsterAttack();
		}, 800);
		
	} else {
		// 怪物攻擊回合
		if (isCorrect) {
			showToast('✅ 答案正確！成功閃避！', 'success');
		} else {
			const damage = Math.ceil(currentQuestion.dmg * difficultyDamageBonus);
			playerHp = Math.max(0, playerHp - damage);
			updatePlayerUI();
			
			if (currentQuestion.isVampiric && currentMonster) {
				currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + damage);
				updateMonsterUI();
				showToast(`🦷 答案錯誤！怪物吸血！造成 ${damage} 點傷害並回復。`, 'danger');
			} else {
				showToast(`❌ 答案錯誤！受到 ${damage} 點傷害！`, 'danger');
			}
			
			// 檢查玩家死亡
			if (playerHp <= 0) {
				setTimeout(gameOver, 600);
				return;
			}
		}

		// 回到玩家回合
		isPlayerTurn = true;
	}
}

function handleMCQAnswer(selected) {
	handleAnswer(selected);
}

function handleTimeout() {
	questionModal.hide();
	if (timerInterval) clearInterval(timerInterval);
	
	if (!currentQuestion.isPlayerAction) {
		// 怪物攻擊超時 = 失敗
		const damage = Math.ceil(currentQuestion.dmg * difficultyDamageBonus);
		playerHp = Math.max(0, playerHp - damage);
		updatePlayerUI();
		
		if (currentQuestion.isVampiric && currentMonster) {
			currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + damage);
			updateMonsterUI();
			showToast(`🦷 時間到！怪物吸血！造成 ${damage} 點傷害並回復。`, 'danger');
		} else {
			showToast(`⏰ 時間到！受到 ${damage} 點傷害`, 'danger');
		}
		
		if (playerHp <= 0) {
			setTimeout(gameOver, 600);
			return;
		}
	} else {
		// 玩家技能超時不可能發生（無計時）
		showToast('發生錯誤', 'danger');
	}
	
	isPlayerTurn = true;
}

// ==================== 下一波 ====================
function nextWave() {
	currentWave++;
	currentMonster = generateMonster(currentWave);
	updateWaveUI();
	updateMonsterUI();
	showToast(`🎉 擊敗第 ${currentWave - 1} 波！`, 'success');
	
	// 玩家回合
	isPlayerTurn = true;
}

// ==================== 遊戲結束 ====================
function gameOver() {
	questionModal.hide();
	$('#action-buttons').find('button').prop('disabled', true);
	const reached = currentWave - 1;
	
	if (reached > highWave) {
		highWave = reached;
		localStorage.setItem('mathFighterHighWave'+difficulty, highWave);
	}
	
	showToast(`💥 遊戲結束！到達第 ${reached} 波 (${difficultyChineseTranslate[difficulty]}難度)。`, 'danger');
	
	// 切回封面
	setTimeout(() => {
		updateHighWave();
		$('#game-screen').addClass('d-none');
		$('#cover-screen').removeClass('d-none');
		$('#high-wave-display').text(highWave);
	}, 1500);
}

// ==================== 輸入綁定 ====================
function initActionButtons() {
	const container = $('#action-buttons');
	buildActionButtons(container);

	// 綁定點擊
	container.find('button').on('click', function() {
		const skill = $(this).data('skill');
		if (skill === 'flee') {
			exitModal.show();
		} else {
			playerAction(skill);
		}
	});
}

function bindInputEvents() {
	// 難度選擇
	$('input[name="difficulty-radio"]').on('change', function() {
		difficulty = $(this).val();
		highWave = parseInt(localStorage.getItem('mathFighterHighWave'+difficulty)) || 0;
		$('#start-game-btn').html(`開始遊戲 (${difficultyChineseTranslate[difficulty]})`);
		$(':root').css('--background', `url("assets/background${difficulty}.png")`);
		
		difficultySpeedBonus = difficultySpeedBonusTranslate[difficulty];
		difficultyDamageBonus = difficultyDamageBonusTranslate[difficulty];
	});
	
	// 封面開始按鈕
	$('#start-game-btn').on('click', function() {
		startNewGame();
	});
	
	// Modal 送出按鈕
	$('#submit-btn').on('click', function() {
		if (!currentQuestion) return;
		
		if (currentQuestion.isMCQ) {
			// MCQ 已透過按鈕處理
			return;
		}
		
		const inputVal = $('#answer-input').val().trim();
		if (inputVal === '') {
			showToast('請輸入答案！', 'danger');
			return;
		}
		handleAnswer(parseInt(inputVal));
	});
	
	$('#exit-confirm-btn').on('click', function() {
		exitModal.hide();
		gameOver();
	});
	
	$('#exit-deny-btn').on('click', function() {
		exitModal.hide();
	});
	
	// 鍵盤 Enter 支援
	$('#answer-input').on('keypress', function(e) {
		if (e.which === 13) {
			$('#submit-btn').trigger('click');
		}
	});
}

// ==================== 啟動遊戲 ====================
function startNewGame() {
	playerHp = 20;
	currentWave = 1;
	smallMonsterQueue = shuffle(MONSTER_DB.small);
	currentMonster = generateMonster(1);
	isPlayerTurn = true;
	
	updatePlayerUI();
	updateWaveUI();
	updateMonsterUI();
	
	$('#cover-screen').addClass('d-none');
	$('#game-screen').removeClass('d-none');
	
	initActionButtons();
}

// ==================== 主程式 ====================
$(document).ready(function() {
	// 讀取最高紀錄
	updateHighWave();
	highWave = parseInt(localStorage.getItem('mathFighterHighWave'+difficulty)) || 0;
	
	// 綁定輸入事件
	bindInputEvents();
	
	// 初始化 Modal
	questionModal = new bootstrap.Modal(document.getElementById('question-modal'), {backdrop: 'static', keyboard: false});
	exitModal = new bootstrap.Modal(document.getElementById('exit-modal'), {backdrop: 'static', keyboard: false});
	
	console.log('%c✅ 數學小鬥士 HTML 遊戲已完整載入！', 'color:#00ffcc; font-size:18px; font-weight:bold');
	console.log('🎮 按「開始遊戲」即可遊玩，適合手機與平板使用');
});
