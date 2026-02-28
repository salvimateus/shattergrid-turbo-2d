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
  const halfH = FIELD_H / 2

  // Offsets de chacoalho: ruído rápido que decai
  const shkL = (Math.random() - 0.5) * wallShakeLeft  * 0.28
  const shkR = (Math.random() - 0.5) * wallShakeRight * 0.28
  const shkT = (Math.random() - 0.5) * wallShakeTop   * 0.22

  // A parede inclina em torno do seu eixo central (pivot no centro da parede lateral)
  // wallTiltLeft/Right: ângulo em radianos, positivo = topo entra no campo
  const tL = wallTiltLeft, tR = wallTiltRight

  // Calcula os 4 cantos da parede esquerda inclinada (em coords de campo)
  // Centro da parede: (-FIELD_W/2, 0), altura FIELD_H + folga
  const wallCX_L = -FIELD_W / 2 - wt / 2
  const wallCX_R =  FIELD_W / 2 + wt / 2
  const hH = halfH + wt

  function drawTiltedWallFill(cx, tilt, shk, color, shadow) {
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt)
    // 4 cantos da parede no espaço do campo, rotacionados em torno do centro
    const corners = [
      [-wt / 2, -hH], [wt / 2, -hH], [wt / 2, hH], [-wt / 2, hH]
    ].map(([lx, ly]) => [
      cx + lx * cosT - ly * sinT + shk,
      ly * cosT + lx * sinT
    ])
    ctx.save()
    ctx.globalAlpha = 0.4
    ctx.shadowColor = shadow; ctx.shadowBlur = ws(0.6)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(wx(corners[0][0]), wy(corners[0][1]))
    for (let i = 1; i < 4; i++) ctx.lineTo(wx(corners[i][0]), wy(corners[i][1]))
    ctx.closePath(); ctx.fill()
    ctx.restore()
  }

  function drawTiltedWallEdge(cx, tilt, shk, color, alpha, blur) {
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt)
    // Borda interna da parede (x local = 0, de -hH a +hH)
    const x0 = cx + 0 * cosT - (-hH) * sinT + shk, y0 = (-hH) * cosT + 0 * sinT
    const x1 = cx + 0 * cosT - ( hH) * sinT + shk, y1 = ( hH) * cosT + 0 * sinT
    ctx.save()
    ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.shadowColor = color
    ctx.shadowBlur = blur; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(wx(x0), wy(y0)); ctx.lineTo(wx(x1), wy(y1)); ctx.stroke()
    ctx.restore()
  }

  const colorL = wallNudgeLeft  > 0.05 ? `hsl(${200 + wallNudgeLeft  * 40},100%,${50 + wallNudgeLeft  * 30}%)` : '#0044aa'
  const colorR = wallNudgeRight > 0.05 ? `hsl(${200 + wallNudgeRight * 40},100%,${50 + wallNudgeRight * 30}%)` : '#0044aa'
  const shadowL = wallNudgeLeft  > 0.05 ? '#00ffff' : '#0066ff'
  const shadowR = wallNudgeRight > 0.05 ? '#00ffff' : '#0066ff'

  drawTiltedWallFill(wallCX_L, tL, shkL, colorL, shadowL)
  drawTiltedWallFill(wallCX_R, -tR, shkR, colorR, shadowR)

  // Top wall com shake vertical
  ctx.save()
  ctx.globalAlpha = 0.4; ctx.shadowColor = '#0066ff'; ctx.shadowBlur = ws(0.6)
  ctx.fillStyle = wallShakeTop > 0.05 ? `hsl(${200 + wallShakeTop * 40},100%,${50 + wallShakeTop * 20}%)` : '#0044aa'
  ctx.fillRect(wx(-FIELD_W / 2 - wt), wy(FIELD_H / 2 + wt + shkT), ws(FIELD_W + wt * 2), ws(wt))
  ctx.restore()

  // Neon inner edge glow — inclinado igual ao fill
  const edgeColorL = wallNudgeLeft  > 0.05 ? `hsl(${180 + wallNudgeLeft  * 60},100%,70%)` : '#0088ff'
  const edgeColorR = wallNudgeRight > 0.05 ? `hsl(${180 + wallNudgeRight * 60},100%,70%)` : '#0088ff'
  drawTiltedWallEdge(wallCX_L, tL, shkL, edgeColorL, 0.6 + wallNudgeLeft  * 0.35, 12 + wallNudgeLeft  * 24 + wallShakeLeft  * 18)
  drawTiltedWallEdge(wallCX_R, -tR, shkR, edgeColorR, 0.6 + wallNudgeRight * 0.35, 12 + wallNudgeRight * 24 + wallShakeRight * 18)

  // Top edge
  ctx.save()
  ctx.strokeStyle = wallShakeTop > 0.05 ? `hsl(${180 + wallShakeTop * 60},100%,70%)` : '#0088ff'
  ctx.globalAlpha = 0.6 + wallShakeTop * 0.3
  ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 12 + wallShakeTop * 20
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(wx(-FIELD_W / 2), wy(FIELD_H / 2 + shkT))
  ctx.lineTo(wx( FIELD_W / 2), wy(FIELD_H / 2 + shkT))
  ctx.stroke()
  ctx.restore()
}

// ─── Neon color helper ───
function hexToStr(h) { return '#' + h.toString(16).padStart(6, '0') }

// ─── Screen → Field X ───
function screenToFieldX(screenX) { return (screenX - cxOff) / scale }
