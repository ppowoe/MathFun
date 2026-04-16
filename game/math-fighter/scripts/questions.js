// ==================== 基礎生成函數 ====================
function genAddTwoSingle(minSum = 2) {
	let a = rand(1, 9);
	let b = rand(1, 9);
	while (a + b < minSum) b = rand(1, 9);
	return { a, b, ans: a + b };
}

function genAddThreeSingle(minSum = 11) {
	let a = rand(1, 9), b = rand(1, 9), c = rand(1, 9);
	while (a + b + c < minSum) c = rand(1, 9);
	return { a, b, c, ans: a + b + c };
}

function genSubTwoSingle() {
	let a = rand(2, 9);
	let b = rand(1, a - 1);
	return { a, b, ans: a - b };
}

function genAddTwoDouble(maxSum = 100) {
	// 先限制 a 的最大值，確保 b 永遠有空間（>=10）
	const maxA = Math.min(99, maxSum - 10);
	const a = rand(10, maxA);
	const b = rand(10, Math.min(99, maxSum - a));
	
	return { a, b, ans: a + b };
}

function genAddSingleDouble() {
	const single = rand(1, 9);
	const dbl = rand(10, 99);
	return { single, dbl, ans: single + dbl };
}

function genAddTwoSingleDouble() {
	const s1 = rand(1, 9);
	const s2 = rand(1, 9);
	const d = rand(10, 99);
	return { s1, s2, d, ans: s1 + s2 + d };
}

function genSubDoubleSingle() {
	const d = rand(11, 99);
	const s = rand(1, 9);
	return { d, s, ans: d - s };
}

function genMixedThree() {
	const dbl = rand(10, 99);
	const s1 = rand(1, 9);
	const s2 = rand(1, 9);
	const pattern = rand(1, 3);
	let expr = '';
	let ans = 0;
	if (pattern === 1) {
		expr = `${dbl} + ${s1} - ${s2}`;
		ans = dbl + s1 - s2;
	} else if (pattern === 2) {
		expr = `${dbl} - ${s1} + ${s2}`;
		ans = dbl - s1 + s2;
	} else {
		expr = `${s1} + ${dbl} - ${s2}`;
		ans = s1 + dbl - s2;
	}
	return { expr, ans };
}

// ==================== 選擇題生成器 ====================
function generateMCQOptions(correct, count = 4) {
	const options = [correct];
	const candidates = [];
	
	// 一次產生足夠候選答案，絕對不會卡住
	for (let offset = -4; offset <= 4; offset++) {
		if (offset === 0) continue;
		const wrong = correct + offset;
		if (wrong > 0 && !options.includes(wrong)) {
			candidates.push(wrong);
		}
	}
	
	// 隨機打亂
	const shuffled = shuffle(candidates);
	
	// 只取需要的數量
	for (let i = 0; i < count - 1 && i < shuffled.length; i++) {
		options.push(shuffled[i]);
	}
	
	return shuffle(options);
}

// ==================== 各類題目生成 ====================
function getQuestionConfig(type) {
	switch (type) {
		// 玩家技能
		case 'player_normal':
			const add2 = genAddTwoSingle();
			return {
				displayHTML: getHorizontalHTML(`${add2.a} + ${add2.b}`),
				answer: add2.ans,
				isMCQ: false
			};
		
		case 'player_special':
		case 'player_heal':
			const addDbl = genAddTwoDouble(100);
			const format = (type === 'player_heal') ? 'vertical' : 'horizontal';
			const html = format === 'vertical' 
				? getVerticalAddHTML(addDbl.a, addDbl.b) 
				: getHorizontalHTML(`${addDbl.a} + ${addDbl.b}`);
			return {
				displayHTML: html,
				answer: addDbl.ans,
				isMCQ: false
			};
		
		// 小怪
		case 'slime_attack':
			const s1 = genAddTwoSingle();
			const opts1 = generateMCQOptions(s1.ans);
			return {
				displayHTML: getHorizontalHTML(`${s1.a} + ${s1.b}`),
				answer: s1.ans,
				isMCQ: true,
				options: opts1
			};
		
		case 'zombie_attack':
			const z = genAddTwoSingle(11);
			return {
				displayHTML: getVerticalAddHTML(z.a, z.b),
				answer: z.ans,
				isMCQ: false
			};
		
		case 'skeleton_attack':
			const sk = genAddThreeSingle(11);
			const optsSk = generateMCQOptions(sk.ans);
			return {
				displayHTML: getHorizontalHTML(`${sk.a} + ${sk.b} + ${sk.c}`),
				answer: sk.ans,
				isMCQ: true,
				options: optsSk
			};
		
		case 'bat_attack':
			const bt = genAddTwoSingle();
			return {
				displayHTML: getHorizontalHTML(`${bt.a} + ${bt.b}`),
				answer: bt.ans,
				isMCQ: false
			};
		
		case 'ghost_attack':
			const gh = genSubTwoSingle();
			const optsGh = generateMCQOptions(gh.ans);
			return {
				displayHTML: getHorizontalHTML(`${gh.a} - ${gh.b}`),
				answer: gh.ans,
				isMCQ: true,
				options: optsGh
			};
		
		case 'alien_monster_attack':
			const go = genAddTwoDouble(50);
			const optsGo = generateMCQOptions(go.ans);
			return {
				displayHTML: getVerticalAddHTML(go.a, go.b),
				answer: go.ans,
				isMCQ: true,
				options: optsGo
			};
		
		// 精英怪
		case 'devil_attack':
			const bs = genAddSingleDouble();
			return {
				displayHTML: getVerticalHTML(bs.dbl, bs.single),
				answer: bs.ans,
				isMCQ: false
			};
		
		case 'troll_attack':
			const bg = genAddTwoDouble(100);
			const optsBg = generateMCQOptions(bg.ans);
			return {
				displayHTML: getVerticalAddHTML(bg.a, bg.b),
				answer: bg.ans,
				isMCQ: true,
				options: optsBg
			};
		
		// Boss - 龍
		case 'dragon_attack1':
			const dr1 = genAddTwoSingleDouble();
			return {
				displayHTML: getHorizontalHTML(`${dr1.s1} + ${dr1.s2} + ${dr1.d}`),
				answer: dr1.ans,
				isMCQ: false
			};
		
		case 'dragon_attack2':
			const dr2 = genAddTwoDouble(200);
			const optsDr2 = generateMCQOptions(dr2.ans);
			return {
				displayHTML: getVerticalAddHTML(dr2.a, dr2.b),
				answer: dr2.ans,
				isMCQ: true,
				options: optsDr2
			};
		
		case 'dragon_attack3':
			const dr3 = genSubDoubleSingle();
			return {
				displayHTML: getHorizontalHTML(`${dr3.d} - ${dr3.s}`),
				answer: dr3.ans,
				isMCQ: false
			};
		
		// Boss - 吸血鬼
		case 'vamp_attack1':
			const va1 = genAddSingleDouble();
			return {
				displayHTML: getHorizontalHTML(`${va1.single} + ${va1.dbl}`),
				answer: va1.ans,
				isMCQ: false
			};
		
		case 'vamp_attack2':
			const va2 = genAddTwoDouble(100);
			const optsVa2 = generateMCQOptions(va2.ans);
			return {
				displayHTML: getVerticalAddHTML(va2.a, va2.b),
				answer: va2.ans,
				isMCQ: true,
				options: optsVa2
			};
		
		case 'vamp_attack3':
			const va3 = genMixedThree();
			return {
				displayHTML: getHorizontalHTML(va3.expr),
				answer: va3.ans,
				isMCQ: false
			};
		
		default:
			return { displayHTML: '<div class="text-danger">題目錯誤</div>', answer: 0, isMCQ: false };
	}
}