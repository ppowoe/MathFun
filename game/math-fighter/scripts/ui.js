// ==================== 輔助函數 ====================
// 橫式顯示
function getHorizontalHTML(expr) {
	return `<div class="fs-1 fw-bold">${expr} ？</div>`;
}

// 直式顯示（加法）
function getVerticalAddHTML(a, b) {
	return `
	<div class="mx-auto" style="max-width: 200px;">
		<div class="fs-2 text-end">${a}</div>
		<div class="fs-2 text-end">+ ${b}</div>
		<div class="border-top border-4 border-light mx-auto my-3" style="width: 140px;"></div>
		<div class="fs-2 fw-bold text-end">？</div>
	</div>`;
}

// 直式顯示（通用）
function getVerticalHTML(top, bottom, op = '+') {
	return `
	<div class="mx-auto" style="max-width: 200px;">
		<div class="fs-2 text-end">${top}</div>
		<div class="fs-2 text-end">${op} ${bottom}</div>
		<div class="border-top border-4 border-light mx-auto my-3" style="width: 140px;"></div>
		<div class="fs-2 fw-bold text-end">？</div>
	</div>`;
}

// ==================== UI 更新 ====================
function updatePlayerUI() {
	const percent = Math.max(0, Math.floor((playerHp / maxPlayerHp) * 100));
	$('#player-hp-bar').css('width', percent + '%');
	$('#player-hp-text').html(`❤️${playerHp}/20`);
}

function updateMonsterUI() {
	if (!currentMonster) return;
	const percent = Math.max(0, Math.floor((currentMonster.hp / currentMonster.maxHp) * 100));
	$('#monster-hp-bar').css('width', percent + '%');
	$('#monster-hp-text').html(`❤️${Math.max(0, Math.floor(currentMonster.hp))}/${currentMonster.maxHp}`);
	$('#monster-name-display').text(currentMonster.name);
	$('#monster-name-full').text(currentMonster.name);
	$('#monster-emoji').html(currentMonster.emoji);
}

function updateWaveUI() {
	$('#wave-number').html(`第 <span class="fs-3">${currentWave}</span> 波`);
}

function updateHighWave() {
	let highWaveNormal = parseInt(localStorage.getItem('mathFighterHighWaveNormal')) || 0;
	let highWaveHard = parseInt(localStorage.getItem('mathFighterHighWaveHard')) || 0;
	let highWaveHell = parseInt(localStorage.getItem('mathFighterHighWaveHell')) || 0;
	$('#high-wave-display-normal').text('一般：'+highWaveNormal);
	$('#high-wave-display-hard').text('困難：'+highWaveHard);
	$('#high-wave-display-hell').text('地獄：'+highWaveHell);
}

function showToast(message, type = 'success') {
	const toastHTML = `
	<div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 shadow" role="alert">
		<div class="d-flex">
			<div class="toast-body fw-bold fs-5">${message}</div>
			<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
		</div>
	</div>`;
	
	const $toast = $(toastHTML).appendTo('.toast-container');
	const toastInstance = new bootstrap.Toast($toast[0], { delay: 2200 });
	toastInstance.show();
	
	$toast.on('hidden.bs.toast', function () {
		$(this).remove();
	});
}

// ==================== UI 創建 ====================
function buildActionButtons(container) {
	container.empty();
	
	const actions = [
		{ id: 'normal', icon: '⚔️', label: '普通攻擊', sub: '1-2 傷害', color: 'outline-light' },
		{ id: 'special', icon: '💥', label: '特別攻擊', sub: '7 傷害', color: 'outline-warning' },
		{ id: 'heal', icon: '❤️', label: '治療', sub: '回復 5', color: 'outline-info' },
		{ id: 'flee', icon: '🏃‍', label: '逃跑', sub: '結束遊戲', color: 'outline-info' }
	];

	actions.forEach(act => {
		const html = `
		<div class="col-3">
			<button class="action-btn btn btn-${act.color} w-100 d-flex flex-column align-items-center justify-content-center" data-skill="${act.id}">
				<span class="fs-1 mb-1">${act.icon}</span>
				<span>${act.label}</span>
				<span class="fs-6">${act.sub}</span>
			</button>
		</div>`;
		container.append(html);
	});
}