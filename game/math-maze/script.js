// 基礎配置與變數
const M_MAP = { easy: 1, normal: 2, hard: 3 };
const SIZE_MAP = { easy: 5, normal: 7, hard: 9 };

let currentDifficulty = 'easy';
let level = 1;
let targetNumber = 0;
let currentScore = 0;
let timeLeft = 60;
let timerInterval = null;

// 迷宮核心資料架構
let mazeSize = 5;
let mazeData = [];       // 儲存每格數字的 2D 陣列
let visitedData = [];    // 儲存是否走過的布林值 2D 陣列
let initialMazeData = [];// 備份初始地圖供重試使用

let playerX = 0;
let playerY = 0;
let initialPlayerX = 0;
let initialPlayerY = 0;
let isPlaying = false;

// 初始化 Modal 對象
let bsModal = new bootstrap.Modal(document.getElementById('customModal'));

$(document).ready(function() {
    loadHighScores();

    // 綁定按鈕事件
    $('#btn-start').click(startGame);
    $('#btn-retry').click(retryLevel);
    $('#btn-exit').click(exitGame);

    // 綁定方向控制
    $('#btn-left').click(() => movePlayer(-1, 0));
    $('#btn-right').click(() => movePlayer(1, 0));
    $('#btn-up').click(() => movePlayer(0, -1));
    $('#btn-down').click(() => movePlayer(0, 1));

    // 支援鍵盤操控 (箭頭及WASD)
    $(document).keydown(function(e) {
        if (!isPlaying) return;
        switch(e.which) {
            case 37: movePlayer(-1, 0); e.preventDefault(); break; // 左
            case 38: movePlayer(0, -1); e.preventDefault(); break; // 上
            case 39: movePlayer(1, 0); e.preventDefault(); break; // 右
            case 40: movePlayer(0, 1); e.preventDefault(); break; // 下
			
			case 65: movePlayer(-1, 0); e.preventDefault(); break; // 左
            case 87: movePlayer(0, -1); e.preventDefault(); break; // 上
            case 68: movePlayer(1, 0); e.preventDefault(); break; // 右
            case 83: movePlayer(0, 1); e.preventDefault(); break; // 下
        }
    });
});

// 載入最高紀錄
function loadHighScores() {
    $('#best-easy').text(localStorage.getItem('maze_best_easy') || 0);
    $('#best-normal').text(localStorage.getItem('maze_best_normal') || 0);
    $('#best-hard').text(localStorage.getItem('maze_best_hard') || 0);
}

// 開始新遊戲
function startGame() {
    currentDifficulty = $('input[name="difficulty"]:checked').val();
    mazeSize = SIZE_MAP[currentDifficulty];
    level = 1;
    
    $('.screen').removeClass('active');
	$('.screen').addClass('d-none');
	
    $('#screen-game').addClass('active');
	$('#screen-game').removeClass('d-none');
    
    initLevel();
    startTimer();
}

// 初始化關卡
function initLevel() {
    const M = M_MAP[currentDifficulty];
    
    // 計算格子數字範圍公式
    let minGrid = Math.min(1 + Math.floor(0.1 * level * M), M * 4);
    let maxGrid = Math.min(3 + M * 3 + Math.floor((level * M) / 3), M * 33);
    
    // 1. 生成方格迷宮與隨機數字
    mazeData = [];
    for (let r = 0; r < mazeSize; r++) {
        mazeData[r] = [];
        for (let c = 0; c < mazeSize; c++) {
            mazeData[r][c] = Math.floor(Math.random() * (maxGrid - minGrid + 1)) + minGrid;
        }
    }
    
    // 2. 隨機生成玩家起始位置
    initialPlayerX = Math.floor(Math.random() * mazeSize);
    initialPlayerY = Math.floor(Math.random() * mazeSize);
    
    // 3. 模擬路徑來計算目標數字（確保絕對有解）
    let totalCells = mazeSize * mazeSize;
    let requiredSteps = Math.max(Math.min(Math.floor(M * 2 + 2 + 0.5 * level), Math.floor(totalCells * 0.5)), 4);
    
    let simX = initialPlayerX;
    let simY = initialPlayerY;
    let simVisited = Array(mazeSize).fill().map(() => Array(mazeSize).fill(false));
    simVisited[simY][simX] = true;
    
    let calculatedTarget = 0;
    let validGeneration = true;
    
    for (let s = 0; s < requiredSteps; s++) {
        let options = [];
        // 檢查上下左右可行走的方向
        if (simX > 0 && !simVisited[simY][simX - 1]) options.push({x: simX - 1, y: simY});
        if (simX < mazeSize - 1 && !simVisited[simY][simX + 1]) options.push({x: simX + 1, y: simY});
        if (simY > 0 && !simVisited[simY - 1][simX]) options.push({x: simX, y: simY - 1});
        if (simY < mazeSize - 1 && !simVisited[simY + 1][simX]) options.push({x: simX, y: simY + 1});
        
        if (options.length === 0) {
            validGeneration = false;
            break; // 陷入死胡同，需要重新生成
        }
        
        let nextMove = options[Math.floor(Math.random() * options.length)];
        simX = nextMove.x;
        simY = nextMove.y;
        simVisited[simY][simX] = true;
        calculatedTarget += mazeData[simY][simX];
    }
    
    // 如果生成失敗（走不到指定步數），遞迴重新生成
    if (!validGeneration) {
        initLevel();
        return;
    }
    
    // 設定生成位置為0與目標數字
    mazeData[initialPlayerY][initialPlayerX] = 0;
    targetNumber = calculatedTarget;
    
    // 備份初始地圖供重試按鈕使用
    initialMazeData = JSON.parse(JSON.stringify(mazeData));
    
    // 載入當前關卡狀態
    loadLevelState();
    timeLeft = 60; // 每關重設 1 分鐘
    updateUI();
}

// 載入/還原關卡狀態
function loadLevelState() {
	isPlaying = true;
    playerX = initialPlayerX;
    playerY = initialPlayerY;
    currentScore = 0;
    
    mazeData = JSON.parse(JSON.stringify(initialMazeData));
    visitedData = Array(mazeSize).fill().map(() => Array(mazeSize).fill(false));
    visitedData[playerY][playerX] = true;
    
    renderGrid();
}

// 渲染迷宮畫面
function renderGrid() {
    const $grid = $('#maze-grid');
    $grid.css('grid-template-columns', `repeat(${mazeSize}, 1fr)`);
    $grid.empty();
    
    for (let r = 0; r < mazeSize; r++) {
        for (let c = 0; c < mazeSize; c++) {
            let isPlayer = (r === playerY && c === playerX);
            let isVisited = visitedData[r][c];
            
            let cellClass = 'maze-cell';
            let cellContent = mazeData[r][c];
            
            if (isPlayer) {
                cellClass += ' player-cell';
                cellContent = currentScore; // 玩家格子顯示當前累計分數
            } else if (isVisited) {
                cellClass += ' visited-cell';
            }
            
            $grid.append(`<div class="${cellClass}">${cellContent}</div>`);
        }
    }
}

// 更新文字資訊
function updateUI() {
    $('#ui-level').text(level);
    $('#ui-target').text(targetNumber);
    $('#ui-time').text(timeLeft);
}

// 通用自定義彈窗函數
function showMsg(title, msg, onConfirm, showCancel = false) {
    $('#modalTitle').text(title);
    $('#modalBody').html(msg);
    
    if (showCancel) {
        $('#btn-modal-cancel').removeClass('d-none');
    } else {
        $('#btn-modal-cancel').addClass('d-none');
    }

    // 清除舊的事件綁定
    $('#btn-modal-ok').off('click').on('click', function() {
        bsModal.hide();
        if (onConfirm) onConfirm();
    });

    $('#btn-modal-cancel').off('click').on('click', function() {
        bsModal.hide();
    });

    bsModal.show();
}

// 計時器運作
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        $('#ui-time').text(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showMsg("時間到", "很遺憾，挑戰超時了！", function() {
                endGameProcedure();
            });
        }
    }, 1000);
}

// 移動玩家
function movePlayer(dx, dy) {
    let nextX = playerX + dx;
    let nextY = playerY + dy;
    
    // 檢查邊界限制與是否重複拜訪
    if (nextX >= 0 && nextX < mazeSize && nextY >= 0 && nextY < mazeSize) {
        if (!visitedData[nextY][nextX]) {
            playerX = nextX;
            playerY = nextY;
            visitedData[playerY][playerX] = true;
            
            // 累加分數公式：新玩家方塊數 = 當前玩家方塊數 + 目標格子數
            currentScore += mazeData[playerY][playerX];
            
            renderGrid();
            
            // 判定勝利條件
            if (currentScore === targetNumber) {
				isPlaying = false;
				clearInterval(timerInterval);
				showMsg("恭喜過關", `你成功抵達了目標數字：${targetNumber}！`, function() {
					level++;
					initLevel();
					startTimer();
				});
			}
        }
    }
}

// 重試功能
function retryLevel() {
    loadLevelState();
    updateUI();
}

// 退出與結算程序
function exitGame() {
    showMsg("確認退出", "確定要結束目前挑戰並回到主畫面嗎？", function() {
        clearInterval(timerInterval);
        endGameProcedure();
    }, true); // 顯示取消按鈕
}

function endGameProcedure() {
	isPlaying = false;
	
    // 儲存到達關卡數（若高於歷史記錄）
    let recordKey = `maze_best_${currentDifficulty}`;
    let currentBest = parseInt(localStorage.getItem(recordKey) || 0);
    
    if (level - 1 > currentBest) {
        localStorage.setItem(recordKey, level-1);
    }
    
    loadHighScores();
    
    // 切換回封面
	$('#screen-game').removeClass('active');
	$('#screen-game').addClass('d-none');
    $('#screen-cover').addClass('active');
	$('#screen-cover').removeClass('d-none');
}