// ==================== 怪物資料庫 ====================
const MONSTER_DB = {
	small: [
		{ name: '史萊姆', emoji: '🫠', maxHp: 10, attacks: [{ dmg: 1, speed: 1, isVampiric: false, qType: 'slime_attack' }] },
		{ name: '僵尸', emoji: '🧟', maxHp: 16, attacks: [{ dmg: 1, speed: 0.8, isVampiric: false, qType: 'zombie_attack' }] },
		{ name: '骷髏', emoji: '💀', maxHp: 12, attacks: [{ dmg: 2, speed: 0.8, isVampiric: false, qType: 'skeleton_attack' }] },
		{ name: '吸血蝙蝠', emoji: '🦇', maxHp: 8, attacks: [{ dmg: 1, speed: 1.2, isVampiric: true, qType: 'bat_attack' }] },
		{ name: '幽靈', emoji: '👻', maxHp: 10, attacks: [{ dmg: 1, speed: 1, isVampiric: false, qType: 'ghost_attack' }] },
		{ name: '外星怪物', emoji: '👾', maxHp: 13, attacks: [{ dmg: 2, speed: 0.6, isVampiric: false, qType: 'alien_monster_attack' }] }
	],
	elite: [
		{ name: '魔鬼', emoji: '😈', maxHp: 25, attacks: [{ dmg: 4, speed: 0.8, isVampiric: false, qType: 'devil_attack' }] },
		{ name: '巨魔', emoji: '🧌', maxHp: 30, attacks: [{ dmg: 3, speed: 0.4, isVampiric: false, qType: 'troll_attack' }] }
	],
	boss: {
		dragon: {
			name: '龍',
			emoji: '🐉',
			maxHp: 50,
			attacks: [
				{ dmg: 5, speed: 0.5, isVampiric: false, qType: 'dragon_attack1' },
				{ dmg: 7, speed: 0.65, isVampiric: false, qType: 'dragon_attack2' },
				{ dmg: 3, speed: 0.8, isVampiric: false, qType: 'dragon_attack3' }
			]
		},
		vampire: {
			name: '吸血鬼',
			emoji: '🧛',
			maxHp: 40,
			attacks: [
				{ dmg: 3, speed: 0.9, isVampiric: false, qType: 'vamp_attack1' },
				{ dmg: 4, speed: 0.72, isVampiric: true, qType: 'vamp_attack2' },
				{ dmg: 6, speed: 0.65, isVampiric: false, qType: 'vamp_attack3' }
			]
		}
	}
};

// ==================== 怪物生成 ====================
function generateMonster(wave) {
	let base;
	if (wave % 10 === 0) {
		// Boss
		const isDragonTurn = Math.floor(wave / 10) % 2 === 1;
		base = isDragonTurn ? MONSTER_DB.boss.dragon : MONSTER_DB.boss.vampire;
		smallMonsterQueue = shuffle(MONSTER_DB.small);
	} else if (wave % 5 === 0) {
		// 精英
		base = MONSTER_DB.elite[Math.floor(Math.random() * MONSTER_DB.elite.length)];
		smallMonsterQueue = shuffle(MONSTER_DB.small);
	} else {
		// 小怪
		base = smallMonsterQueue[wave%5];
	}
	
	// 深層複製
	const monster = JSON.parse(JSON.stringify(base));
	monster.hp = monster.maxHp;
	return monster;
}