// ============================================================================
// 심볼 & 배당 데이터
// ============================================================================
const SYMBOLS = [
  { id: 'pistol', emoji: '🔫', name: '권총', weight: 35, color: '#94a3b8', glow: 'rgba(148,163,184,0.6)', imgUrl: 'assets/symbol4.png' },
  { id: 'grenade', emoji: '💣', name: '수류탄', weight: 28, color: '#f59e0b', glow: 'rgba(245,158,11,0.6)', imgUrl: 'assets/symbol2.png' },
  { id: 'knife', emoji: '🔪', name: '나이프', weight: 18, color: '#ef4444', glow: 'rgba(239,68,68,0.6)', imgUrl: 'assets/symbol5.png' },
  { id: 'helmet', emoji: '🪖', name: '헬멧', weight: 10, color: '#22c55e', glow: 'rgba(34,197,94,0.6)', imgUrl: 'assets/symbol6.png' },
  { id: 'smile', emoji: '😊', name: '스마일', weight: 5, color: '#fbbf24', glow: 'rgba(251,191,36,0.8)', imgUrl: 'assets/symbol7.png' },
  { id: 'skull', emoji: '💀', name: '해골', weight: 3, color: '#f87171', glow: 'rgba(248,113,113,0.9)', imgUrl: 'assets/symbol3.png' },
  { id: 'crown', emoji: '👑', name: '크라운', weight: 1, color: '#ffd700', glow: 'rgba(255,215,0,1)', imgUrl: 'assets/symbol1.png' },
];

const THREE_OF_A_KIND = {
  pistol: { multi: 5, label: '× 5', tier: 'small' },
  grenade: { multi: 8, label: '× 8', tier: 'small' },
  knife: { multi: 15, label: '× 15', tier: 'medium' },
  helmet: { multi: 25, label: '× 25', tier: 'medium' },
  smile: { multi: 50, label: '× 50', tier: 'big' },
  skull: { multi: 100, label: '💀 × 100 JACKPOT!', tier: 'jackpot' },
  crown: { multi: 1000, label: '👑 × 1000 MEGA JACKPOT!!', tier: 'mega' },
};

const TWO_OF_A_KIND = { smile: 2, skull: 5, crown: 10 };

const SPECIAL_COMBOS = [
  { ids: ['crown', 'skull', 'crown'], multi: 200, tier: 'jackpot' },
  { ids: ['skull', 'smile', 'skull'], multi: 50, tier: 'big' },
];



const MIN_BET = 10;
const MAX_BET = 1000;
const BET_OPTIONS = [10, 50, 100, 300, 500, 1000];
const INITIAL_BALANCE = 60000;

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
function getWeightedRandom() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const s of SYMBOLS) { r -= s.weight; if (r <= 0) return s; }
  return SYMBOLS[0];
}

function makeStrip() {
  return Array.from({ length: STRIP_SIZE }, () =>
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
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
  if (reels[0].id === reels[1].id && TWO_OF_A_KIND[reels[0].id]) {
    const m = TWO_OF_A_KIND[reels[0].id];
    return { winAmount: m * bet, multiplier: m, tier: 'small' };
  }
  return null;
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
  playReelStop(idx) {
    try {
      const ctx = getAudioCtx();
      const freq = [330, 290, 255][idx] || 290;
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'square'; osc.connect(g); g.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq * 1.6, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.09);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
  },
  playWin(tier) {
    try {
      const ctx = getAudioCtx();
      const seqs = {
        small: [{ f: 440, d: .3 }, { f: 550, d: .3 }, { f: 660, d: .5 }],
        medium: [{ f: 440, d: .22 }, { f: 550, d: .22 }, { f: 660, d: .22 }, { f: 880, d: .55 }],
        big: [{ f: 523, d: .18 }, { f: 659, d: .18 }, { f: 784, d: .18 }, { f: 1047, d: .6 }],
        jackpot: [{ f: 523, d: .15 }, { f: 659, d: .15 }, { f: 784, d: .15 }, { f: 1047, d: .15 }, { f: 1318, d: .7 }],
        mega: [{ f: 659, d: .15 }, { f: 880, d: .15 }, { f: 1047, d: .15 }, { f: 1318, d: .15 }, { f: 1760, d: 1 }],
      };
      const notes = seqs[tier] || seqs.small;
      let t = ctx.currentTime;
      notes.forEach(({ f, d }) => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = (tier === 'jackpot' || tier === 'mega') ? 'square' : 'triangle';
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d - 0.02);
        osc.start(t); osc.stop(t + d); t += d;
      });
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
    const makeReel = () => ({
      strip: makeStrip(),
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

      balance:      INITIAL_BALANCE,
      selectedChar: 'teddy',
      betIndex:     2,
      betAmount:    100,
      betInput:     '100',
      spinning: false,
      finalReels: null,
      winResult: null,
      showWin: false,
      displayWin: 0,
      lastWinAmt: 0,

      sessionBudget: 0,
      budgetInput: 1000,
      autoActive: false,

      history: [],
      showHistory: false,
      showPayTable: false,

      // 릴 상태 (translateY가 Vue reactive로 관리됨)
      reels: [makeReel(), makeReel(), makeReel()],

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
    this._countupRaf = null;
    this._toastHideTimer = null;
    this._toastNextTimer = null;
  },

  computed: {
    bet() { return this.betAmount; },
    currentWinner() { return WINNERS[this.toastIndex]; },
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
    clearTimeout(this._toastHideTimer);
    clearTimeout(this._toastNextTimer);
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
      if (isNaN(amt) || amt <= 0) return;
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
      }
    },

    // ── 스핀 버튼 클릭 ──
    handleSpinClick() {
      if (this.spinning || this._spinLock) return;
      this.doSpin();
      sound.playClick();
    },

    // ── 핵심 스핀 로직 ──
    doSpin() {
      if (this._spinLock) return;
      if (this.sessionBudget < this.bet) {
        this.autoActive = false; // 예산 부족 시 오토스핀 종료
        this.alertMessage = "Insufficient Session Budget! Please deposit funds first.";
        this.showAlert = true;
        return;
      }
      this._spinLock = true;
      clearTimeout(this._winHideTimeout);

      this.sessionBudget -= this.bet;
      this.spinning = true;
      this.winResult = null;
      this.showWin = false;
      this.displayWin = 0;

      // 최종 심볼 결정
      const fr = [getWeightedRandom(), getWeightedRandom(), getWeightedRandom()];
      this.finalReels = fr;

      const stopDelays = [1000, 1500, 2000];
      let stoppedCount = 0;

      this.reels.forEach((reel, i) => {
        // 릴 초기화
        this.$set(reel, 'strip', makeStrip());
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
        this.showWin = true;
        this.startCountup(result.winAmount);
        this.triggerConfetti(result.tier);
        sound.playWin(result.tier);
        const dur = result.tier === 'mega' ? 7000 : result.tier === 'jackpot' ? 5500 : 3500;
        this._winHideTimeout = setTimeout(() => { this.showWin = false; }, dur);
      }

      if (this.autoActive) {
        if (this.sessionBudget >= this.bet) {
          setTimeout(() => this.doSpin(), 1200);
        } else {
          this.autoActive = false;
        }
      }
      this._spinLock = false;
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
  },
});
