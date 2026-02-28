// ═══ UI ═══
let comboT = null
const comboEl = document.getElementById('combo-popup')
function showCombo(c, pts) {
  if (c < 2) return
  clearTimeout(comboT)
  let l, co
  if (c >= 15) { l = 'INSANE'; co = '#ff0000' }
  else if (c >= 10) { l = 'UNSTOPPABLE'; co = '#ff00ff' }
  else if (c >= 7) { l = 'GODLIKE'; co = '#ff8800' }
  else if (c >= 5) { l = 'AMAZING'; co = '#ffcc00' }
  else if (c >= 3) { l = 'NICE'; co = '#00ffcc' }
  else { l = 'COMBO'; co = '#00ccff' }
  comboEl.textContent = `${l} x${c}  +${pts}`
  comboEl.style.color = co
  const baseSize = innerWidth < 380 ? 18 : innerWidth < 600 ? 24 : 48
  const maxSize = innerWidth < 380 ? 30 : innerWidth < 600 ? 40 : 80
  comboEl.style.fontSize = Math.min(baseSize + c * 2, maxSize) + 'px'
  comboEl.classList.remove('show'); void comboEl.offsetWidth; comboEl.classList.add('show')
  comboT = setTimeout(() => comboEl.classList.remove('show'), 800)
}

const lifeEl = document.getElementById('life-lost-popup')
let lifeT = null
function showLifeLost(r) {
  clearTimeout(lifeT)
  lifeEl.textContent = `${r <= 1 ? 'LAST CHANCE' : r <= 2 ? 'CAREFUL...' : 'OUCH'}  ♥×${r}`
  lifeEl.classList.remove('show'); void lifeEl.offsetWidth; lifeEl.classList.add('show')
  lifeT = setTimeout(() => lifeEl.classList.remove('show'), 1200)
}

function updateHUD() {
  document.getElementById('score-value').textContent = score
  document.getElementById('combo-value').textContent = 'x' + Math.max(1, combo)
  let h = ''
  for (let i = 0; i < Math.max(lives, MAX_LIVES); i++) h += i < lives ? '♥' : '♡'
  document.getElementById('lives-value').textContent = h
  const ce = document.getElementById('combo-value')
  if (combo > 3) { ce.style.color = '#ff0'; ce.style.textShadow = '0 0 10px #ff0, 0 0 20px #ff0' }
  else { ce.style.color = '#f0f'; ce.style.textShadow = '0 0 10px #f0f, 0 0 20px #f0f' }
}

function showDropExpiry(label, color) {
  const el = document.getElementById('powerup-popup')
  el.textContent = '⏳ ' + label + ' OFF'
  el.style.color = '#' + color.toString(16).padStart(6, '0')
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show')
}

function renderEndDrops(containerId) {
  const container = document.getElementById(containerId)
  if (dropLog.length === 0) { container.innerHTML = ''; return }
  let html = '<div class="end-drops-title">Drops coletados</div>'
  for (const e of dropLog) {
    const cls = e.good ? 'good' : 'bad'
    html += `<div class="drop-entry ${cls} permanent">${e.label}</div>`
  }
  container.innerHTML = html
}

// ─── repositionHUD — 2D canvas coords (no Three.js projection) ───
function repositionHUD() {
  // Field edges in canvas pixels
  const sL = wx(-FIELD_W / 2), sR = wx(FIELD_W / 2)
  const sT = wy(FIELD_H / 2),  sB = wy(-FIELD_H / 2)
  const fieldW = sR - sL

  const hud = document.getElementById('hud')
  hud.style.left  = Math.round(sL) + 'px'
  hud.style.width = Math.round(fieldW) + 'px'

  const logEl = document.getElementById('drop-log')
  if (IS_MOBILE) {
    logEl.style.left         = Math.round(sL) + 'px'
    logEl.style.width        = Math.round(fieldW) + 'px'
    logEl.style.top          = Math.max(Math.round(sT) - 20, 55) + 'px'
    logEl.style.flexDirection = 'row'
    logEl.style.flexWrap     = 'nowrap'
    logEl.style.overflowY    = ''
    logEl.style.maxHeight    = ''
  } else {
    const margin   = 14
    const fieldH   = sB - sT
    const maxLogH  = Math.round(fieldH * 0.8)
    const centerY  = Math.round(sT + fieldH / 2)
    logEl.style.left          = Math.round(sR + margin) + 'px'
    logEl.style.width         = Math.round(innerWidth - sR - margin - 10) + 'px'
    logEl.style.top           = Math.round(centerY - maxLogH / 2) + 'px'
    logEl.style.flexDirection = 'column'
    logEl.style.flexWrap      = 'nowrap'
    logEl.style.alignItems    = 'flex-start'
    logEl.style.overflowY     = 'auto'
    logEl.style.maxHeight     = maxLogH + 'px'
  }
}

