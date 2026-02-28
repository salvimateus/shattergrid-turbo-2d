// ═══ DROPS ═══
const DROP_TYPES_ALL = [
  { id: 'grow',        label: '⬌ EXPAND',         color: 0x00ff88, good: true  },
  { id: 'shrink',      label: '⬌ SHRINK',          color: 0xff4444, good: false },
  { id: 'multiball',   label: '◉ MULTI-BALL',      color: 0xffcc00, good: true  },
  { id: 'life',        label: '♥ EXTRA LIFE',       color: 0xff66cc, good: true  },
  { id: 'glass',       label: '◇ GLASS ROW',        color: 0x88ccff, good: true  },
  { id: 'bomb',        label: '💣 BOMB',            color: 0xff6600, good: true  },
  { id: 'slowmo',      label: '🐢 CÂMERA LENTA',   color: 0x8844ff, good: true  },
  { id: 'fastmo',      label: '⚡ CÂMERA RÁPIDA',  color: 0xff2288, good: false },
  { id: 'paddle_down', label: '↓ PADDLE BAIXO',    color: 0x44ddaa, good: true  },
  { id: 'paddle_up',   label: '↑ PADDLE ALTO',     color: 0xdd4444, good: false },
  { id: 'bw',          label: '◐ PRETO & BRANCO',  color: 0xcccccc, good: false },
  { id: 'crt',         label: '📺 TV CRT',         color: 0x88aa44, good: false },
  { id: 'old_film',    label: '🎬 FILME ANTIGO',   color: 0x998866, good: false },
  { id: 'laser_sight', label: '🎯 MIRA LASER',     color: 0xff0044, good: true  },
  { id: 'spin',        label: '🌀 GIRO LOUCO',     color: 0xff44ff, good: false },
  { id: 'ghost',       label: '👻 FANTASMA',       color: 0x6644aa, good: false },
]
const DROP_VISUAL_COLORS = [0xff00ff, 0x00ffff, 0xffff00, 0xff4444, 0x44ff44, 0x4488ff, 0xff8800, 0xaa44ff, 0xff66cc, 0x66ffcc]
const MAX_DROPS = 3

function spawnDrop(x, y) {
  if (drops.length >= MAX_DROPS) return
  if (Math.random() > DROP_CHANCE) return
  const t = DROP_TYPES_ALL[Math.floor(Math.random() * DROP_TYPES_ALL.length)]
  const vc = DROP_VISUAL_COLORS[Math.floor(Math.random() * DROP_VISUAL_COLORS.length)]
  drops.push({ x, y, type: t, visualColor: vc, vy: -0.06, angle: 0 })
}

function drawDrop(d) {
  const ps = ws(0.55)
  ctx.save()
  ctx.translate(wx(d.x), wy(d.y))
  d.angle += 0.05; ctx.rotate(d.angle)
  const col = hexToStr(d.visualColor)
  ctx.globalAlpha = 0.9
  ctx.shadowColor = col; ctx.shadowBlur = ws(0.5)
  ctx.fillStyle = col
  ctx.fillRect(-ps / 2, -ps / 2, ps, ps)
  ctx.restore()
}

function drawDrops() { for (const d of drops) drawDrop(d) }

function updateDrops() {
  const hw = paddleW / 2
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i]; d.y += d.vy
    const dx = d.x - paddleX, dy = d.y - currentPaddleY
    if (Math.abs(dx) < hw + 0.3 && Math.abs(dy) < 0.6) {
      SFX.dropCatch(); applyDrop(d.type); spawnP(d.x, d.y, d.type.color, 15)
      drops.splice(i, 1); continue
    }
    if (d.y < -FIELD_H / 2 - 1) drops.splice(i, 1)
  }
}

// ─── Film Noise (desktop) ───
let filmNoiseRAF = null
function startFilmNoise() {
  const c = document.getElementById('film-noise')
  c.width = Math.floor(innerWidth / 4); c.height = Math.floor(innerHeight / 4)
  const fctx = c.getContext('2d')
  function drawNoise() {
    const img = fctx.createImageData(c.width, c.height), d = img.data
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i+1] = d[i+2] = v; d[i+3] = 30 + Math.random() * 25 }
    for (let s = 0; s < 3; s++) { const sx = Math.floor(Math.random() * c.width); for (let y = 0; y < c.height; y++) { const idx = (y * c.width + sx) * 4; d[idx] = d[idx+1] = d[idx+2] = 200; d[idx+3] = 45 } }
    fctx.putImageData(img, 0, 0); filmNoiseRAF = requestAnimationFrame(drawNoise)
  }
  drawNoise()
}
function stopFilmNoise() {
  if (filmNoiseRAF) { cancelAnimationFrame(filmNoiseRAF); filmNoiseRAF = null }
  document.getElementById('film-noise').style.display = 'none'
  document.getElementById('film-overlay').style.display = 'none'
}

// ─── Drop Log ───
const TIMED_DROPS = new Set(['slowmo','fastmo','bw','crt','old_film','grow','shrink','glass','bomb','paddle_down','paddle_up','laser_sight','spin','ghost'])
function addDropLog(t) {
  const isTimed = TIMED_DROPS.has(t.id)
  for (let i = dropLog.length - 1; i >= 0; i--) { if (dropLog[i].id === t.id && dropLog[i].active) dropLog[i].active = false }
  const entry = { label: t.label, colorHex: '#' + t.color.toString(16).padStart(6, '0'), good: t.good, active: isTimed, id: t.id, permanent: !isTimed }
  dropLog.push(entry); renderDropLog(); return entry
}
function deactivateDropLog(id) {
  for (let i = dropLog.length - 1; i >= 0; i--) { if (dropLog[i].id === id && dropLog[i].active) { dropLog[i].active = false; break } }
  renderDropLog()
}
function renderDropLog() {
  const container = document.getElementById('drop-log')
  let html = '<div id="drop-log-title">Drops</div>'
  const start = Math.max(0, dropLog.length - 5)
  for (let i = dropLog.length - 1; i >= start; i--) {
    const e = dropLog[i], cls = e.good ? 'good' : 'bad', state = e.active ? 'active' : (e.permanent ? 'permanent' : 'expired')
    html += `<div class="drop-entry ${cls} ${state}" style="color:${e.active ? e.colorHex : ''}">${e.label}</div>`
  }
  container.innerHTML = html
}
function clearDropLog() { dropLog = []; renderDropLog() }
function clearAllFilters() {
  if (bwTimer > 0) { bwTimer = 0; deactivateDropLog('bw') }
  if (crtTimer > 0) { crtTimer = 0; document.getElementById('crt-overlay').style.display = 'none'; deactivateDropLog('crt') }
  if (filmTimer > 0) { filmTimer = 0; stopFilmNoise(); deactivateDropLog('old_film') }
  canvas.style.filter = ''
}
