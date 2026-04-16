// ==================== 全域變數 ====================
let difficulty = 'Normal';
const difficultyChineseTranslate = {'Normal':'一般','Hard':'困難','Hell':'地獄'};
let difficultySpeedBonus = 1;
const difficultySpeedBonusTranslate = {'Normal':1,'Hard':1.5,'Hell':2};
let difficultyDamageBonus = 1;
const difficultyDamageBonusTranslate = {'Normal':1,'Hard':1.5,'Hell':2};

let playerHp = 20;
let maxPlayerHp = 20;

let currentWave = 1;
let highWave = 0;

let currentMonster = null;
let smallMonsterQueue = null;
let speedBonus = 1;

let isPlayerTurn = true;
let currentQuestion = null; // {answer, isMCQ, options, isPlayerAction, skillType, dmg, isVampiric}
let timerInterval = null;
let timerStartTime = 0;
let timeLimit = 0;

// Bootstrap modal 實例
let questionModal = null;
let exitModal = null;