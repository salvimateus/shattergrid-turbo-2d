// ═══ CANVAS 2D RENDERER ═══
const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')
let scale = 1, cxOff = 0, cyOff = 0

function resize() {
  canvas.width = innerWidth
  canvas.height = innerHeight
  const sx = canvas.width / (FIELD_W + FIELD_MARGIN * 2)
  const sy = canvas.height / (FIELD_H + FIELD_MARGIN * 2)
  scale = Math.min(sx, sy)
  cxOff = canvas.width / 2
  cyOff = canvas.height / 2
}
resize()

// World → Canvas coordinate helpers
function wx(x) { return cxOff + x * scale }
function wy(y) { return cyOff - y * scale }
function ws(s) { return s * scale }

// ─── Draw Helpers ───
function drawGlowRect(x, y, w, h, fill, glow, blur, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  if (blur > 0) { ctx.shadowColor = glow; ctx.shadowBlur = blur }
  ctx.fillStyle = fill
  const px = wx(x) - ws(w) / 2, py = wy(y) - ws(h) / 2
  const pw = ws(w), ph = ws(h), r = Math.min(4, pw / 4, ph / 4)
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, r); ctx.fill()
  ctx.restore()
}

function drawGlowCircle(x, y, r, fill, glow, blur, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  if (blur > 0) { ctx.shadowColor = glow; ctx.shadowBlur = blur }
  ctx.fillStyle = fill
  ctx.beginPath(); ctx.arc(wx(x), wy(y), ws(r), 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

// ─── Background ───
function drawBackground() {
  ctx.fillStyle = '#000011'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Grid (subtle wireframe like original)
  ctx.save()
  ctx.strokeStyle = IS_MOBILE ? '#1155cc' : '#1a1a4e'
  ctx.globalAlpha = 0.18
  ctx.lineWidth = 0.5
  ctx.translate(cxOff, cyOff)
  ctx.rotate(Math.sin(frame * 0.001) * 0.02)
  ctx.translate(-cxOff, -cyOff)
  const gridStep = 1.0, gridRange = 25
  for (let gx = -gridRange; gx <= gridRange; gx += gridStep) {
    ctx.beginPath(); ctx.moveTo(wx(gx), wy(-gridRange)); ctx.lineTo(wx(gx), wy(gridRange)); ctx.stroke()
  }
  for (let gy = -gridRange; gy <= gridRange; gy += gridStep) {
    ctx.beginPath(); ctx.moveTo(wx(-gridRange), wy(gy)); ctx.lineTo(wx(gridRange), wy(gy)); ctx.stroke()
  }
  ctx.restore()
}

// ─── Walls ───
function drawWalls() {
  const wt = 0.15
  // Deslocamento visual das paredes quando paddle as pressiona (max 0.18 unidades)
  const nudgeOffL = wallNudgeLeft  * 0.18
  const nudgeOffR = wallNudgeRight * 0.18

  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.shadowBlur = ws(0.6)

  // Left wall — desloca para a esquerda quando pressionada
  ctx.fillStyle = wallNudgeLeft  > 0.05 ? `hsl(${200 + wallNudgeLeft  * 40},100%,${50 + wallNudgeLeft  * 30}%)` : '#0044aa'
  ctx.shadowColor = wallNudgeLeft  > 0.05 ? '#00ffff' : '#0066ff'
  ctx.fillRect(wx(-FIELD_W / 2 - wt - nudgeOffL), wy(FIELD_H / 2 + wt), ws(wt), ws(FIELD_H + wt * 2 + 1))

  // Right wall — desloca para a direita quando pressionada
  ctx.fillStyle = wallNudgeRight > 0.05 ? `hsl(${200 + wallNudgeRight * 40},100%,${50 + wallNudgeRight * 30}%)` : '#0044aa'
  ctx.shadowColor = wallNudgeRight > 0.05 ? '#00ffff' : '#0066ff'
  ctx.fillRect(wx(FIELD_W / 2 + nudgeOffR), wy(FIELD_H / 2 + wt), ws(wt), ws(FIELD_H + wt * 2 + 1))

  // Top wall
  ctx.fillStyle = '#0044aa'; ctx.shadowColor = '#0066ff'
  ctx.fillRect(wx(-FIELD_W / 2 - wt), wy(FIELD_H / 2 + wt), ws(FIELD_W + wt * 2), ws(wt))
  ctx.restore()

  // Neon inner edge glow
  ctx.save()
  ctx.lineWidth = 1.5
  // Left edge
  ctx.strokeStyle = wallNudgeLeft  > 0.05 ? `hsl(${180 + wallNudgeLeft  * 60},100%,70%)` : '#0088ff'
  ctx.globalAlpha = 0.6 + wallNudgeLeft  * 0.35
  ctx.shadowColor = ctx.strokeStyle
  ctx.shadowBlur = 12 + wallNudgeLeft  * 24
  ctx.beginPath()
  ctx.moveTo(wx(-FIELD_W / 2 - nudgeOffL), wy(-FIELD_H / 2))
  ctx.lineTo(wx(-FIELD_W / 2 - nudgeOffL), wy(FIELD_H / 2))
  ctx.stroke()
  // Right edge
  ctx.strokeStyle = wallNudgeRight > 0.05 ? `hsl(${180 + wallNudgeRight * 60},100%,70%)` : '#0088ff'
  ctx.globalAlpha = 0.6 + wallNudgeRight * 0.35
  ctx.shadowColor = ctx.strokeStyle
  ctx.shadowBlur = 12 + wallNudgeRight * 24
  ctx.beginPath()
  ctx.moveTo(wx(FIELD_W / 2 + nudgeOffR), wy(-FIELD_H / 2))
  ctx.lineTo(wx(FIELD_W / 2 + nudgeOffR), wy(FIELD_H / 2))
  ctx.stroke()
  // Top edge
  ctx.strokeStyle = '#0088ff'; ctx.globalAlpha = 0.6; ctx.shadowColor = '#0088ff'; ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(wx(-FIELD_W / 2), wy(FIELD_H / 2))
  ctx.lineTo(wx(FIELD_W / 2), wy(FIELD_H / 2))
  ctx.stroke()
  ctx.restore()
}

// ─── Neon color helper ───
function hexToStr(h) { return '#' + h.toString(16).padStart(6, '0') }

// ─── Screen → Field X ───
function screenToFieldX(screenX) { return (screenX - cxOff) / scale }
