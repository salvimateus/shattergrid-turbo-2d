// ═══ 8-BIT SOUND ENGINE ═══
let actx = null
function ensureAudio() {
  if (DISABLE_SFX) return
  if (!actx)
    actx = new (window.AudioContext || window.webkitAudioContext)()
  if (actx.state === 'suspended') actx.resume()
}

function tone(freq, dur, type = 'square', vol = 0.15, slide = 0) {
  if (DISABLE_SFX || !actx) return
  const o = actx.createOscillator(),
    g = actx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, actx.currentTime)
  if (slide)
    o.frequency.exponentialRampToValueAtTime(
      Math.max(20, freq + slide),
      actx.currentTime + dur,
    )
  g.gain.setValueAtTime(vol, actx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur)
  o.connect(g)
  g.connect(actx.destination)
  o.start()
  o.stop(actx.currentTime + dur)
}

function noise(dur, vol = 0.08) {
  if (DISABLE_SFX || !actx) return
  const n = actx.sampleRate * dur,
    buf = actx.createBuffer(1, n, actx.sampleRate),
    d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  const s = actx.createBufferSource(),
    g = actx.createGain()
  s.buffer = buf
  g.gain.setValueAtTime(vol, actx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur)
  s.connect(g)
  g.connect(actx.destination)
  s.start()
}

const SFX = {
  paddleHit() {
    tone(400, 0.08, 'square', 0.12)
    tone(600, 0.06, 'square', 0.08)
  },
  wallHit() {
    tone(220, 0.05, 'triangle', 0.08)
  },
  brickHit(c) {
    const f = 300 + Math.min(c, 15) * 40
    tone(f, 0.1, 'square', 0.12)
  },
  brickDestroy(c) {
    const f = 400 + Math.min(c, 15) * 50
    tone(f, 0.15, 'square', 0.15, 200)
    noise(0.08, 0.06)
  },
  glassBreak() {
    tone(1200, 0.08, 'sine', 0.1)
    tone(1800, 0.06, 'sine', 0.08)
    noise(0.12, 0.1)
  },
  loseLife() {
    tone(400, 0.15, 'square', 0.15, -300)
    setTimeout(() => tone(200, 0.2, 'square', 0.12, -150), 150)
  },
  gameOver() {
    ;[400, 350, 300, 200].forEach((f, i) =>
      setTimeout(() => tone(f, 0.25, 'square', 0.15), i * 200),
    )
  },
  win() {
    ;[523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => tone(f, 0.2, 'square', 0.15), i * 120),
    )
  },
  powerGood() {
    tone(600, 0.08, 'square', 0.12)
    setTimeout(() => tone(900, 0.1, 'square', 0.1), 60)
    setTimeout(() => tone(1200, 0.12, 'square', 0.1), 120)
  },
  powerBad() {
    tone(400, 0.1, 'sawtooth', 0.12)
    tone(200, 0.15, 'sawtooth', 0.1)
  },
  dropCatch() {
    tone(800, 0.06, 'sine', 0.1)
  },
  chargeUp(p) {
    tone(200 + p * 600, 0.04, 'sine', 0.06)
  },
  chargeLaunch() {
    tone(600, 0.15, 'square', 0.15, 400)
    noise(0.1, 0.08)
  },
  bombBounce() {
    tone(250, 0.08, 'square', 0.12)
    tone(350, 0.06, 'triangle', 0.08)
  },
  bombExplode() {
    noise(0.3, 0.2)
    tone(100, 0.3, 'sawtooth', 0.18, -80)
    setTimeout(() => noise(0.2, 0.12), 100)
    setTimeout(() => tone(60, 0.2, 'square', 0.1), 150)
  },
}
