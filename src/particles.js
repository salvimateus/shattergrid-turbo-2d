// ═══ PARTICLES ═══
const pPool = []
const MAX_P = MAX_PARTICLES_CAP

// Raw spawn (used internally with custom velocity)
function _spawnRawParticle(x, y, vx, vy, color, size, decay) {
  let p
  if (pPool.length > 0) {
    p = pPool.pop()
    p.x = x; p.y = y; p.vx = vx; p.vy = vy
    p.color = color; p.size = size; p.life = 1; p.decay = decay
  } else if (particles.length < MAX_P) {
    p = { x, y, vx, vy, color, size, life: 1, decay }
  } else return
  particles.push(p)
}

function spawnP(x, y, color, n = 20) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const sp = 0.05 + Math.random() * 0.18
    const size = (0.5 + Math.random() * 1.5) * 0.09
    _spawnRawParticle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, color, size, 0.01 + Math.random() * 0.025)
  }
}

function updateP() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy
    p.vy -= 0.002
    p.life -= p.decay
    if (p.life <= 0) { pPool.push(p); particles.splice(i, 1) }
  }
}

function drawP() {
  for (const p of particles) {
    const s = Math.max(1, ws(p.size * p.life * 1.2))
    ctx.save()
    ctx.globalAlpha = p.life * 0.9
    ctx.fillStyle = hexToStr(p.color)
    ctx.fillRect(wx(p.x) - s / 2, wy(p.y) - s / 2, s, s)
    ctx.restore()
  }
}

// ═══ TRAILS ═══
const trailPool = []
const MAX_TRAILS = 80

function spawnTrail(x, y) {
  let t
  if (trailPool.length > 0) {
    t = trailPool.pop(); t.x = x; t.y = y; t.life = 1; t.decay = 0.06
  } else if (trails.length < MAX_TRAILS) {
    t = { x, y, life: 1, decay: 0.06 }
  } else return
  trails.push(t)
}

function updateTrails() {
  for (let i = trails.length - 1; i >= 0; i--) {
    const t = trails[i]; t.life -= t.decay
    if (t.life <= 0) { trailPool.push(t); trails.splice(i, 1) }
  }
}

function drawTrails() {
  for (const t of trails) {
    const r = Math.max(0.5, ws(BALL_R * 0.6 * t.life * 0.8))
    ctx.save()
    ctx.globalAlpha = t.life * 0.3
    ctx.fillStyle = '#00ffff'
    ctx.beginPath(); ctx.arc(wx(t.x), wy(t.y), r, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

// ═══ SCREEN SHAKE ═══
function shake(a) { shakeAmt = Math.max(shakeAmt, a) }

function updateShake() {
  if (shakeAmt > 0.01) {
    shakeX = (Math.random() - 0.5) * shakeAmt * scale * 0.5
    shakeY = (Math.random() - 0.5) * shakeAmt * scale * 0.5
    shakeAmt *= 0.88
  } else { shakeAmt = 0; shakeX = 0; shakeY = 0 }
}
