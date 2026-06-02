// ============================================================================
// 심볼 & 배당 데이터
// ============================================================================
const SYMBOLS = [
  { id: 'pistol',  emoji: '🔫', name: 'Pistol',  weight: 35, color: '#94a3b8', glow: 'rgba(148,163,184,0.6)', imgUrl: 'assets/symbol4.png' },
  { id: 'grenade', emoji: '💣', name: 'Grenade', weight: 28, color: '#f59e0b', glow: 'rgba(245,158,11,0.6)',  imgUrl: 'assets/symbol2.png' },
  { id: 'knife',   emoji: '🔪', name: 'Knife',   weight: 18, color: '#ef4444', glow: 'rgba(239,68,68,0.6)',   imgUrl: 'assets/symbol5.png' },
  { id: 'helmet',  emoji: '🪖', name: 'Helmet',  weight: 10, color: '#22c55e', glow: 'rgba(34,197,94,0.6)',   imgUrl: 'assets/symbol6.png' },
  { id: 'smile',   emoji: '😊', name: 'Smile',   weight: 5,  color: '#fbbf24', glow: 'rgba(251,191,36,0.8)',  imgUrl: 'assets/symbol7.png' },
  { id: 'skull',   emoji: '💀', name: 'Skull',   weight: 3,  color: '#f87171', glow: 'rgba(248,113,113,0.9)', imgUrl: 'assets/symbol3.png' },
  { id: 'crown',   emoji: '👑', name: 'Crown',   weight: 1,  color: '#ffd700', glow: 'rgba(255,215,0,1)',     imgUrl: 'assets/symbol1.png' },
  { id: 'mystery', emoji: '❓', name: 'Respin',  weight: 6,  color: '#a855f7', glow: 'rgba(168,85,247,0.7)', imgUrl: '' },
];

const THREE_OF_A_KIND = {
  pistol:  { multi: 5,    label: '× 5',                    tier: 'small'   },
  grenade: { multi: 8,    label: '× 8',                    tier: 'small'   },
  knife:   { multi: 15,   label: '× 15',                   tier: 'medium'  },
  helmet:  { multi: 25,   label: '× 25',                   tier: 'medium'  },
  smile:   { multi: 50,   label: '× 50',                   tier: 'big'     },
  skull:   { multi: 100,  label: '💀 × 100 JACKPOT!',      tier: 'jackpot' },
  crown:   { multi: 1000, label: '👑 × 1000 MEGA JACKPOT!!', tier: 'mega'  },
};

// 2매치 당첨: Crown ×10, Skull ×5, Smile ×2 (테이블 기준)
const TWO_OF_A_KIND = { smile: 2, skull: 5, crown: 10 };

// 2매치 본전(×1): Helmet / Knife / Grenade / Pistol
const BREAK_TWO_SET = new Set(['helmet', 'knife', 'grenade', 'pistol']);

const SPECIAL_COMBOS = [
  { ids: ['crown', 'skull', 'crown'], multi: 200, tier: 'jackpot' },
  { ids: ['skull', 'smile', 'skull'], multi: 50,  tier: 'big'     },
];

// ============================================================================
// 결과 가중치 테이블 (결과가중치테이블.md 기준 · 총 100,000)
// ============================================================================
const OUTCOME_TABLE = [
  // 3매치
  { type: '3match', id: 'crown',   weight: 9   },  // ×1000 MEGA
  { type: '3match', id: 'skull',   weight: 18  },  // ×100  JACKPOT
  { type: '3match', id: 'smile',   weight: 71  },  // ×50   BIG
  { type: '3match', id: 'helmet',  weight: 107 },  // ×25   MED
  { type: '3match', id: 'knife',   weight: 240 },  // ×15   MED
  { type: '3match', id: 'grenade', weight: 428 },  // ×8    SMALL
  { type: '3match', id: 'pistol',  weight: 892 },  // ×5    SMALL
  // 2매치 당첨
  { type: '2match', id: 'crown',   weight: 563 },  // ×10
  { type: '2match', id: 'skull',   weight: 928 },  // ×5
  { type: '2match', id: 'smile',   weight: 2144 }, // ×2
  // 2매치 본전
  { type: 'break',  id: 'helmet',  weight: 9025 }, // ×1 (36100/4)
  { type: 'break',  id: 'knife',   weight: 9025 }, // ×1
  { type: 'break',  id: 'grenade', weight: 9025 }, // ×1
  { type: 'break',  id: 'pistol',  weight: 9025 }, // ×1
  // 프리스핀
  { type: 'respin', id: 'mystery', weight: 5000 }, // Free Spin 5%
  // 꽝
  { type: 'miss',   id: null,      weight: 53500 }, // Miss 53.5%
];
const OUTCOME_TOTAL = OUTCOME_TABLE.reduce((a, o) => a + o.weight, 0);

// ============================================================================
// 테스트 모드 결과 가중치 테이블 (고배율 결과 대폭 상향)
// ============================================================================
const TEST_OUTCOME_TABLE = [
  // 3매치 고배율 (mega/jackpot/big 비율 무는 상향)
  { type: '3match', id: 'crown',   weight: 2000 },  // MEGA    ×1000
  { type: '3match', id: 'skull',   weight: 3000 },  // JACKPOT ×100
  { type: '3match', id: 'smile',   weight: 5000 },  // BIG     ×50
  { type: '3match', id: 'helmet',  weight: 5000 },  // MED     ×25
  { type: '3match', id: 'knife',   weight: 5000 },  // MED     ×15
  { type: '3match', id: 'grenade', weight: 5000 },  // SMALL   ×8
  { type: '3match', id: 'pistol',  weight: 5000 },  // SMALL   ×5
  // 2매치 당첨
  { type: '2match', id: 'crown',   weight: 3000 },  // ×10
  { type: '2match', id: 'skull',   weight: 3000 },  // ×5
  { type: '2match', id: 'smile',   weight: 3000 },  // ×2
  // BREAK EVEN 축소화
  { type: 'break',  id: 'helmet',  weight: 1000 },
  { type: 'break',  id: 'knife',   weight: 1000 },
  { type: 'break',  id: 'grenade', weight: 1000 },
  { type: 'break',  id: 'pistol',  weight: 1000 },
  // 프리스핀 상향
  { type: 'respin', id: 'mystery', weight: 3000 },
  // 꽝 축소화
  { type: 'miss',   id: null,      weight: 3000 },
];
const TEST_OUTCOME_TOTAL = TEST_OUTCOME_TABLE.reduce((a, o) => a + o.weight, 0);




const MIN_BET = 10;
const MAX_BET = 1000;
const BET_OPTIONS = [10, 50, 100, 300, 500, 1000];
const INITIAL_BALANCE = 60000;
const LOSE_AUTO_DELAY = 1200;
const BREAK_AUTO_DELAY = 1200;
const RESPIN_DELAY = 1500;

const CHARACTERS = [
  { id: 'teddy',   name: 'Teddy'   },
  { id: 'ghost',   name: 'Ghost'   },
  { id: 'ranger',  name: 'Ranger'  },
  { id: 'sniper',  name: 'Sniper'  },
  { id: 'assault', name: 'Assault' },
];

const TOTAL_WEIGHT = SYMBOLS.reduce((a, s) => a + s.weight, 0);
const STRIP_SIZE = 60;
const REEL_SPEED = 1600; // px/sec

// ============================================================================
// 유틸리티
// ============================================================================
function getWeightedRandom(excludeMystery = false) {
  const list = excludeMystery ? SYMBOLS.filter(s => s.id !== 'mystery') : SYMBOLS;
  const totalWeight = list.reduce((a, s) => a + s.weight, 0);
  let r = Math.random() * totalWeight;
  for (const s of list) { r -= s.weight; if (r <= 0) return s; }
  return list[0];
}

function makeStrip(isLast = false) {
  const list = isLast ? SYMBOLS : SYMBOLS.filter(s => s.id !== 'mystery');
  return Array.from({ length: STRIP_SIZE }, () =>
    list[Math.floor(Math.random() * list.length)]
  );
}

function pad(n) { return String(n).padStart(2, '0'); }
function formatDate(d) {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function calculateWin(reels, bet) {
  for (const c of SPECIAL_COMBOS) {
    if (reels[0].id === c.ids[0] && reels[1].id === c.ids[1] && reels[2].id === c.ids[2]) {
      return { winAmount: c.multi * bet, multiplier: c.multi, tier: c.tier };
    }
  }
  if (reels[0].id === reels[1].id && reels[1].id === reels[2].id) {
    const t = THREE_OF_A_KIND[reels[0].id];
    if (t) return { winAmount: t.multi * bet, multiplier: t.multi, tier: t.tier };
  }
  if (reels[0].id === reels[1].id) {
    // 2매치 당첨: Crown, Skull, Smile
    if (TWO_OF_A_KIND[reels[0].id]) {
      const m = TWO_OF_A_KIND[reels[0].id];
      return { winAmount: m * bet, multiplier: m, tier: 'small' };
    }
    // 2매치 본전: Helmet, Knife, Grenade, Pistol → ×1 (bet 그대로 반환)
    if (BREAK_TWO_SET.has(reels[0].id)) {
      return { winAmount: bet, multiplier: 1, tier: 'break' };
    }
  }
  return null;
}

// 결과 테이블에서 가중치 기반 결과 하나 선택 (mode: 'normal' | 'test')
function pickOutcome(mode) {
  const table = mode === 'test' ? TEST_OUTCOME_TABLE : OUTCOME_TABLE;
  const total = mode === 'test' ? TEST_OUTCOME_TOTAL : OUTCOME_TOTAL;
  let r = Math.random() * total;
  for (const o of table) { r -= o.weight; if (r <= 0) return o; }
  return table[table.length - 1];
}

// 결과 타입에 맞게 릴 3개 심볼 구성
function buildReelsFromOutcome(outcome) {
  const symOf = id => SYMBOLS.find(s => s.id === id);
  const nonMystery = SYMBOLS.filter(s => s.id !== 'mystery');
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];

  if (outcome.type === '3match') {
    const s = symOf(outcome.id);
    return [s, s, s];
  }
  if (outcome.type === '2match') {
    const s = symOf(outcome.id);
    // 3번째 릴은 다른 심볼 (mystery 제외, 같은 심볼 제외)
    const others = nonMystery.filter(x => x.id !== outcome.id);
    return [s, s, rand(others)];
  }
  if (outcome.type === 'break') {
    // 처음 2개는 같은 BREAK 심볼, 3번째는 다른 심볼
    const s = symOf(outcome.id);
    const others = nonMystery.filter(x => x.id !== outcome.id);
    return [s, s, rand(others)];
  }
  if (outcome.type === 'respin') {
    // ❓ 는 세 번째 릴에만 등장
    const mystery = symOf('mystery');
    const s0 = rand(nonMystery);
    const s1 = rand(nonMystery);
    return [s0, s1, mystery];
  }
  // miss: 랜덤이지만 3매치/2매치/break 가 안 되도록 조합
  let attempts = 0;
  while (attempts++ < 30) {
    const r0 = rand(nonMystery);
    const r1 = rand(nonMystery);
    const r2 = rand(nonMystery);
    if (r0.id === r1.id) continue; // 2매치 방지
    if (r1.id === r2.id) continue;
    return [r0, r1, r2];
  }
  // fallback
  return [nonMystery[0], nonMystery[1], nonMystery[2]];
}

// ============================================================================
// 사운드 엔진
// ============================================================================
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
const sound = {
  // 캐싱된 HTML5 Audio 객체들
  _reelStops: [
    new Audio('assets/sounds/reel_stop1.mp3'),
    new Audio('assets/sounds/reel_stop2.mp3'),
    new Audio('assets/sounds/reel_stop3.mp3')
  ],
  _spinLoop: (() => {
    const a = new Audio('assets/sounds/spin_loop.mp3');
    a.loop = true;
    return a;
  })(),
  _winSmall: new Audio('assets/sounds/win_small.mp3'),
  _winBig: new Audio('assets/sounds/win_big.mp3'),
  _jackpot: new Audio('assets/sounds/jackpot.mp3'),
  _siren: new Audio('assets/sounds/siren.mp3'),

  playSiren() {
    try {
      this._siren.currentTime = 0;
      this._siren.loop = true;
      this._siren.volume = 0.6;
      this._siren.play().catch(e => {});
    } catch (e) {}
  },
  stopSiren() {
    try {
      this._siren.pause();
    } catch (e) {}
  },

  playClick() {
    try {
      const ctx = getAudioCtx(), osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine'; osc.connect(g); g.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } catch (e) { }
  },
  playSpinLoop() {
    try {
      this._spinLoop.currentTime = 0;
      this._spinLoop.play().catch(e => {});
    } catch (e) {}
  },
  stopSpinLoop() {
    try {
      this._spinLoop.pause();
    } catch (e) {}
  },
  playReelStop(idx) {
    try {
      // 각 릴에 대응되는 stop 오디오 선택 (idx가 0, 1, 2 임)
      const audioObj = this._reelStops[idx] || this._reelStops[0];
      const s = audioObj.cloneNode(true);
      s.volume = 0.5;
      s.play().catch(e => {});
    } catch (e) { }
  },
  playWin(tier) {
    try {
      let a = this._winSmall;
      if (tier === 'mega' || tier === 'jackpot') {
        a = this._jackpot;
      } else if (tier === 'big' || tier === 'medium') {
        a = this._winBig;
      }
      a.currentTime = 0;
      a.play().catch(e => {});
    } catch (e) { }
  },
};

// ============================================================================
// 당첨자 토스트 데이터
// ============================================================================
const WINNERS = [
  { nick: 'Te***', date: 'May.07', prize: 'MEGA JACKPOT', multi: '× 1000', icon: '👑' },
  { nick: 'Bl***', date: 'May.07', prize: 'JACKPOT', multi: '× 100', icon: '💀' },
  { nick: 'Sn***', date: 'May.06', prize: 'MEGA JACKPOT', multi: '× 1000', icon: '👑' },
  { nick: 'Gh***', date: 'May.06', prize: 'JACKPOT', multi: '× 500', icon: '💀' },
  { nick: 'Ra***', date: 'May.05', prize: 'MEGA JACKPOT', multi: '× 1000', icon: '👑' },
  { nick: 'Xv***', date: 'May.05', prize: 'JACKPOT', multi: '× 300', icon: '💀' },
  { nick: 'Mg***', date: 'May.04', prize: 'MEGA JACKPOT', multi: '× 1000', icon: '👑' },
  { nick: 'Dr***', date: 'May.04', prize: 'JACKPOT', multi: '× 100', icon: '💀' },
];

// ============================================================================
// Vue 인스턴스
// ============================================================================
new Vue({
  el: '#app',

  data() {
    // 릴 3개 각각의 독립 상태
    const makeReel = (isLast = false) => ({
      strip: makeStrip(isLast),
      translateY: 0,
      transitioning: false,
      blurred: false,
      stopped: true,
    });

    return {
      showAlert: false,
      alertMessage: '',
      // ── 공개 데이터 (템플릿에서 참조) ──
      SYMBOLS,
      THREE_OF_A_KIND,
      BET_OPTIONS,
      CHARACTERS,

      isLoggedIn:   false,
      balance:      INITIAL_BALANCE,
      selectedChar: '',
      betIndex:     2,
      betAmount:    100,
      betInput:     '100',
      spinning: false,
      handleReturning: false,
      finalReels: null,
      winResult: null,
      showWin: false,
      showLose: false,
      showBreakEven: false,
      gameMode: 'normal', // 'normal' | 'test'
      displayWin: 0,
      lastWinAmt: 0,
      currentCharacter: 'assets/character.png',
      showCoinRain: false,
      coins: [],
      showRespinOverlay: false,
      hasPendingRespin: false,

      sessionBudget: 0,
      budgetInput: '',
      autoActive: false,

      history: [],
      showHistory: false,
      showPayTable: false,

      // 릴 상태 (translateY가 Vue reactive로 관리됨)
      reels: [makeReel(false), makeReel(false), makeReel(true)],

      // 릴 뷰포트 높이 기반 셀 높이
      cellH: 100,

      // 카운트다운 타이머
      timerD: 22, timerH: 14, timerM: 14, timerS: 4,

      // 당첨자 토스트
      toastVisible: true,
      toastIndex: 0,
    };
  },

  // ── 비반응형 내부 상태 (프레임/타이머 ref) ──
  // Vue의 reactivity를 거치지 않아 성능에 안전함
  created() {
    this._spinLock = false;
    this._reelYRefs = [0, 0, 0];   // 각 릴의 live Y 좌표
    this._reelRafs = [null, null, null]; // RAF id
    this._timerInterval = null;
    this._winHideTimeout = null;
    this._loseHideTimeout = null;
    this._countupRaf = null;
    this._toastHideTimer = null;
    this._toastNextTimer = null;
  },

  computed: {
    bet() { return this.betAmount; },
    currentWinner() { return WINNERS[this.toastIndex]; },
  },

  watch: {
    showWin(newVal) {
      if (newVal) {
        this.currentCharacter = 'assets/character2.png';
      } else {
        this.currentCharacter = 'assets/character.png';
        if (this._winHideTimeout) {
          clearTimeout(this._winHideTimeout);
          this._winHideTimeout = null;
        }
      }
    },
    showRespinOverlay(newVal) {
      if (newVal) {
        sound.playSiren();
      } else {
        sound.stopSiren();
      }
    }
  },

  mounted() {
    this.updateCellHeight();
    window.addEventListener('resize', this.updateCellHeight);
    this._timerInterval = setInterval(this.tickTimer, 1000);
    this.scheduleToast();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateCellHeight);
    clearInterval(this._timerInterval);
    clearTimeout(this._winHideTimeout);
    clearTimeout(this._loseHideTimeout);
    clearTimeout(this._autoSpinTimeout);
    clearTimeout(this._respinTimeout);
    clearTimeout(this._toastHideTimer);
    clearTimeout(this._toastNextTimer);
    sound.stopSiren();
    if (this._countupRaf) cancelAnimationFrame(this._countupRaf);
    this._reelRafs.forEach(r => r && cancelAnimationFrame(r));
  },

  methods: {
    // ── 레이아웃 ──
    updateCellHeight() {
      const vp = this.$refs.reelViewport;
      if (!vp) return;
      const h = vp.clientHeight / 3;
      if (h > 0) this.cellH = h;
    },

    // ── 타이머 ──
    tickTimer() {
      if (this.timerS > 0) { this.timerS--; return; }
      this.timerS = 59;
      if (this.timerM > 0) { this.timerM--; return; }
      this.timerM = 59;
      if (this.timerH > 0) { this.timerH--; return; }
      this.timerH = 23;
      if (this.timerD > 0) { this.timerD--; return; }
      clearInterval(this._timerInterval);
    },
    fmtTime(v) { return String(v).padStart(2, '0'); },

    // ── 당첨자 토스트 ──
    scheduleToast() {
      this.toastVisible = true;
      this._toastHideTimer = setTimeout(() => {
        this.toastVisible = false;
        this._toastNextTimer = setTimeout(() => {
          this.toastIndex = (this.toastIndex + 1) % WINNERS.length;
          this.scheduleToast();
        }, 600);
      }, 3200);
    },

    // ── 베팅 ──
    setBetFromInput() {
      if (this.spinning) return;
      let v = parseInt(this.betInput, 10);
      if (isNaN(v) || v < MIN_BET) v = MIN_BET;
      if (v > MAX_BET) v = MAX_BET;
      this.betAmount = v;
      this.betInput  = String(v);
      sound.playClick();
    },
    changeBet(delta) {
      // kept for compatibility
      if (this.spinning) return;
      let v = this.betAmount + delta * 10;
      if (v < MIN_BET) v = MIN_BET;
      if (v > MAX_BET) v = MAX_BET;
      this.betAmount = v;
      this.betInput  = String(v);
      sound.playClick();
    },
    handleMaxBet() {
      if (this.spinning) return;
      this.betAmount = MAX_BET;
      this.betInput  = String(MAX_BET);
      sound.playClick();
    },
    handleMinBet() {
      if (this.spinning) return;
      this.betAmount = MIN_BET;
      this.betInput  = String(MIN_BET);
      sound.playClick();
    },
    // ── 세션 예산 관리 ──
    depositBudget() {
      if (this.spinning) return;
      let amt = parseInt(this.budgetInput, 10);
      if (isNaN(amt) || amt <= 0) {
        this.alertMessage = "Please enter a valid deposit amount.";
        this.showAlert = true;
        return;
      }
      if (this.balance >= amt) {
        this.balance -= amt;
        this.sessionBudget += amt;
        this.budgetInput = ''; // 예치 성공 시 입력칸 비움
        sound.playClick();
      } else {
        this.alertMessage = "Not enough BC! Please check your balance.";
        this.showAlert = true;
      }
    },
    cashoutBudget() {
      if (this.spinning || this.sessionBudget <= 0) return;
      this.balance += this.sessionBudget;
      this.sessionBudget = 0;
      sound.playClick();
    },

    // ── 오토 스핀 토글 ──
    toggleAuto() {
      if (this.spinning && !this.autoActive) return; // 이미 돌고 있는데 켤 수는 없음 (선택적 제한)
      this.autoActive = !this.autoActive;
      sound.playClick();
      if (this.autoActive && !this.spinning) {
        this.doSpin();
      } else if (!this.autoActive) {
        clearTimeout(this._autoSpinTimeout);
        clearTimeout(this._loseHideTimeout);
      }
    },

    // ── 스핀 버튼 클릭 ──
    handleSpinClick() {
      if (this.spinning || this._spinLock) return;
      this.doSpin();
      sound.playClick();
    },
    handleHandleClick() {
      if (this.spinning || this._spinLock) return;
      if (!this.isLoggedIn) {
        this.alertMessage = "PLEASE SIGN IN FIRST TO SPIN";
        this.showAlert = true;
        return;
      }
      this.handleSpinClick();
    },

    // ── 핵심 스핀 로직 ──
    doSpin(isFree = false) {
      if (this._spinLock) return;
      if (!isFree) {
        if (this.sessionBudget < this.bet) {
          this.autoActive = false; // 예산 부족 시 오토스핀 종료
          this.alertMessage = "Not enough budget. Please deposit to continue.";
          this.showAlert = true;
          return;
        }
        this.sessionBudget -= this.bet;
      }
      this._spinLock = true;
      clearTimeout(this._winHideTimeout);
      clearTimeout(this._loseHideTimeout);
      clearTimeout(this._autoSpinTimeout);
      clearTimeout(this._respinTimeout);

      this.spinning = true;
      this.handleReturning = false;

      this.winResult = null;
      this.showWin = false;
      this.showLose = false;
      this.displayWin = 0;
      this.showRespinOverlay = false;

      sound.playSpinLoop();

      // 결과 가중치 테이블 기반 Outcome-First 결정 (gameMode 반영)
      const outcome = pickOutcome(this.gameMode);
      const fr = buildReelsFromOutcome(outcome);
      this.finalReels = fr;

      const stopDelays = [1000, 1500, 2000];
      let stoppedCount = 0;

      this.reels.forEach((reel, i) => {
        // 릴 초기화
        this.$set(reel, 'strip', makeStrip(i === 2));
        this.$set(reel, 'translateY', 0);
        this.$set(reel, 'transitioning', false);
        this.$set(reel, 'blurred', true);
        this.$set(reel, 'stopped', false);
        this._reelYRefs[i] = 0;

        // ─── RAF 고속 스크롤 시작 ───
        let lastTime = null;
        const animate = (time) => {
          if (lastTime === null) lastTime = time;
          const dt = Math.min((time - lastTime) / 1000, 0.05);
          lastTime = time;
          this._reelYRefs[i] -= REEL_SPEED * dt;
          // Vue reactive update (translateY만 업데이트)
          this.$set(reel, 'translateY', this._reelYRefs[i]);
          this._reelRafs[i] = requestAnimationFrame(animate);
        };
        this._reelRafs[i] = requestAnimationFrame(animate);

        // ─── 지연 후 감속 정지 ───
        setTimeout(() => {
          // RAF 중단
          if (this._reelRafs[i]) {
            cancelAnimationFrame(this._reelRafs[i]);
            this._reelRafs[i] = null;
          }

          const CELL_H = this.cellH;
          const extraScroll = 390 + Math.floor(Math.random() * 260);
          const rawTarget = this._reelYRefs[i] - extraScroll;
          const snapped = Math.round(rawTarget / CELL_H) * CELL_H;
          const midIdx = Math.round(-snapped / CELL_H) + 1;
          const clamped = Math.max(2, Math.min(STRIP_SIZE - 3, midIdx));
          const finalY = -(clamped - 1) * CELL_H;

          // 최종 심볼을 strip 중앙에 삽입
          const newStrip = [...reel.strip];
          newStrip[clamped] = fr[i];
          this.$set(reel, 'strip', newStrip);
          this.$set(reel, 'blurred', false);
          this.$set(reel, 'transitioning', true);
          this.$set(reel, 'translateY', finalY);
          this._reelYRefs[i] = finalY;

          sound.playReelStop(i);

          // 트랜지션 완료 (0.9s) 후 settled
          setTimeout(() => {
            this.$set(reel, 'transitioning', false);
            this.$set(reel, 'stopped', true);
            stoppedCount++;
            if (stoppedCount === 3) this._onAllStopped(fr);
          }, 900);

        }, stopDelays[i]);
      });
    },

    // ── 전체 릴 정지 후 처리 ──
    _onAllStopped(fr) {
      this.spinning = false;
      this.handleReturning = true;
      setTimeout(() => {
        this.handleReturning = false;
      }, 500);
      sound.stopSpinLoop();
      const result = calculateWin(fr, this.bet);
      this.winResult = result;

      const record = {
        id: Date.now().toString(),
        date: formatDate(new Date()),
        bet: this.bet,
        reels: [fr[0].emoji, fr[1].emoji, fr[2].emoji],
        winAmount: result ? result.winAmount : 0,
      };
      this.history.unshift(record);
      if (this.history.length > 100) this.history.pop();

      if (result) {
        this.sessionBudget += result.winAmount;
        this.lastWinAmt = result.winAmount;
        // break(본전) → BREAK EVEN 팝업 표시, 오토스핀 시 1.2초 후 자동 닫힘
        if (result.tier === 'break') {
          this.showBreakEven = true;
          if (this.autoActive) {
            this._loseHideTimeout = setTimeout(() => {
              this.confirmBreakEven();
            }, BREAK_AUTO_DELAY);
          }
          this._spinLock = false;
          return;
        }
        this.showWin = true;
        this.startCountup(result.winAmount);
        this.triggerConfetti(result.tier);
        sound.playWin(result.tier);
        if (result.tier === 'mega') {
          this.triggerCoinRain(); // MEGA: 코인 비 + 폭죽
        }
        // JACKPOT: 폭죽만 (triggerConfetti에서 처리됨)
        if (fr[2].id === 'mystery') {
          this.hasPendingRespin = true;
        }
      } else if (fr[2].id === 'mystery') {
        this.showRespinOverlay = true;
        this._respinTimeout = setTimeout(() => {
          this.showRespinOverlay = false;
          this.doSpin(true);
        }, RESPIN_DELAY);
      } else {
        this.showLose = true;
        if (this.autoActive) {
          this._loseHideTimeout = setTimeout(() => {
            this.confirmLose();
          }, LOSE_AUTO_DELAY); // LOSE_AUTO_DELAY 후 자동으로 닫히고 다음 스핀 진행
        }
      }
      this._spinLock = false;
    },

    getWinMsgText(tier) {
      if (tier === 'mega') return "You're a Legend. The Crown is yours!";
      if (tier === 'jackpot') return "Fortune favors the fearless!";
      if (tier === 'big') return "Big smiles, bigger rewards!";
      return "Nice shot! Keep it going!";
    },

    confirmWin() {
      this.showWin = false;
      this.showCoinRain = false;
      this.coins = [];
      if (this.hasPendingRespin) {
        this.hasPendingRespin = false;
        this.triggerFreeRespinNow();
      } else if (this.autoActive) {
        if (this.sessionBudget >= this.bet) {
          this._autoSpinTimeout = setTimeout(() => this.doSpin(), 600);
        } else {
          this.autoActive = false;
        }
      }
    },

    confirmLose() {
      this.showLose = false;
      if (this._loseHideTimeout) {
        clearTimeout(this._loseHideTimeout);
        this._loseHideTimeout = null;
      }
      if (this.autoActive) {
        if (this.sessionBudget >= this.bet) {
          this._autoSpinTimeout = setTimeout(() => this.doSpin(), 600);
        } else {
          this.autoActive = false;
        }
      }
    },

    confirmBreakEven() {
      this.showBreakEven = false;
      if (this._loseHideTimeout) {
        clearTimeout(this._loseHideTimeout);
        this._loseHideTimeout = null;
      }
      if (this.autoActive) {
        if (this.sessionBudget >= this.bet) {
          this._autoSpinTimeout = setTimeout(() => this.doSpin(), 600);
        } else {
          this.autoActive = false;
        }
      }
    },

    triggerFreeRespinNow() {
      this.showRespinOverlay = true;
      this._respinTimeout = setTimeout(() => {
        this.showRespinOverlay = false;
        this.doSpin(true);
      }, RESPIN_DELAY);
    },

    triggerCoinRain() {
      this.showCoinRain = true;
      const arr = [];
      const count = 75;
      for (let i = 0; i < count; i++) {
        const id = Math.random().toString(36).substring(2, 9);
        const scale = 0.4 + Math.random() * 0.7;
        const left = Math.random() * 100;
        const delay = Math.random() * 3.5;
        const duration = 1.6 + Math.random() * 1.6;
        const rotateStart = Math.random() * 360;
        const rotateEnd = rotateStart + 360 + Math.random() * 540;
        
        arr.push({
          id,
          style: {
            left: left + '%',
            animationDelay: delay + 's',
            animationDuration: duration + 's',
            transform: `scale(${scale})`,
            '--fall-rotate-start': rotateStart + 'deg',
            '--fall-rotate-end': rotateEnd + 'deg',
          }
        });
      }
      this.coins = arr;
    },

    // ── 당첨금 카운트업 ──
    startCountup(target) {
      if (this._countupRaf) cancelAnimationFrame(this._countupRaf);
      const start = performance.now();
      const dur = Math.min(2800, Math.max(800, target / 400));
      const self = this;
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        self.displayWin = Math.round(e * target);
        if (t < 1) self._countupRaf = requestAnimationFrame(step);
      }
      this._countupRaf = requestAnimationFrame(step);
    },

    // ── 컨페티 ──
    triggerConfetti(tier) {
      if (!window.confetti) return;
      if (tier === 'mega') {
        const end = Date.now() + 5000;
        const iv = setInterval(() => {
          if (Date.now() > end) { clearInterval(iv); return; }
          confetti({
            particleCount: 90, startVelocity: 35, spread: 360,
            origin: { x: Math.random(), y: Math.random() * 0.6 },
            colors: ['#ffd700', '#ff6b6b', '#4ade80', '#60a5fa', '#f0abfc']
          });
        }, 280);
      } else if (tier === 'jackpot') {
        confetti({ particleCount: 220, spread: 130, origin: { y: 0.55 }, colors: ['#ef4444', '#ffd700', '#fff'] });
      } else if (tier === 'big') {
        confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 }, colors: ['#f59e0b', '#fbbf24', '#fcd34d'] });
      } else {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
      }
    },

    // ── 헬퍼 ──
    symObj(id) { return SYMBOLS.find(s => s.id === id) || SYMBOLS[0]; },

    // 해당 rowIdx가 화면 중간 행인지 판별
    _isMiddle(reel, rowIdx) {
      if (!reel.stopped) return false;
      const midIdx = Math.round(-reel.translateY / this.cellH) + 1;
      return rowIdx === midIdx;
    },

    symStyle(sym, colIdx, rowIdx, reel) {
      const isMiddle = this._isMiddle(reel, rowIdx);
      const won = !!(this.winResult && reel.stopped && isMiddle);
      return {
        fontSize: this.cellH * 0.6 + 'px',
        filter: won ? `drop-shadow(0 0 18px ${sym.glow}) drop-shadow(0 0 30px ${sym.glow})` : 'drop-shadow(0 4px 6px rgba(0,0,0,0.9))',
        transform: won ? 'scale(1.1)' : 'scale(1)',
        transition: 'filter 0.3s, transform 0.3s',
      };
    },

    imgStyle(sym, colIdx, rowIdx, reel) {
      const isMiddle = this._isMiddle(reel, rowIdx);
      const won = !!(this.winResult && reel.stopped && isMiddle);
      const sz = Math.max(36, Math.min(this.cellH * 0.68, 84)) + 'px';
      return {
        width: sz,
        height: sz,
        objectFit: 'contain',
        transform: won ? 'scale(1.6)' : 'scale(1.5)',
        transition: 'filter 0.3s, transform 0.3s',
        filter: won ? `drop-shadow(0 0 14px ${sym.glow})` : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
      };
    },

    autoOptStyle(val) {
      const sel = this.autoSpinCount === val;
      return {
        background: sel ? 'linear-gradient(146deg,#b45309,#f59e0b)' : 'transparent',
        border: sel ? '1px solid rgba(252,211,77,0.5)' : '1px solid transparent',
        color: sel ? '#fff' : 'rgba(220,180,180,0.5)',
      };
    },
    autoOffStyle() {
      const sel = this.autoSpinCount === null;
      return {
        background: sel ? 'linear-gradient(146deg,#7f1d1d,#b91c1c)' : 'transparent',
        border: sel ? '1px solid rgba(212,175,55,0.5)' : '1px solid transparent',
        color: sel ? '#fff' : 'rgba(220,180,180,0.5)',
      };
    },
    quickBetStyle(i) {
      const sel = this.betIndex === i;
      return {
        background: sel ? 'linear-gradient(135deg,#92400e,#d97706)' : 'rgba(0,0,0,0.4)',
        border: sel ? '1px solid rgba(252,211,77,0.5)' : '1px solid rgba(100,80,40,0.3)',
        color: sel ? '#fff' : 'rgba(180,160,100,0.7)',
      };
    },
     fmtBet(b) { return b >= 1000 ? (b / 1000) + 'K' : b; },
    fmtNum(n) { return n.toLocaleString(); },
    paytableRows() {
      return [
        { id: 'crown', label: 'Crown ×3', multi: '×1000', color: '#ffd700' },
        { id: 'skull', label: 'Skull ×3', multi: '×100', color: '#f87171' },
        { id: 'smile', label: 'Smile ×3', multi: '×50', color: '#fbbf24' },
        { id: 'helmet', label: 'Helmet ×3', multi: '×25', color: '#22c55e' },
        { id: 'knife', label: 'Knife ×3', multi: '×15', color: '#ef4444' },
      ];
    },
    toggleLogin() {
      if (this.isLoggedIn) {
        // Sign Out
        this.isLoggedIn = false;
        this.selectedChar = '';
        this.currentCharacter = 'assets/character.png';
        this.autoActive = false; // Turn off auto spin if active
      } else {
        // Sign In
        this.isLoggedIn = true;
        this.selectedChar = 'teddy';
        this.currentCharacter = 'assets/character.png';
      }
      sound.playClick();
    },
  },
});
