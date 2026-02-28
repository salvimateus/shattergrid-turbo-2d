// ═══ PADDLE ═══
function drawPaddle() {
  const px = paddleX, py = currentPaddleY
  const pw = ws(paddleW), ph = ws(PADDLE_H)
  const r = Math.min(5, pw / 4, ph / 4)

  ctx.save()
  ctx.translate(wx(px), wy(py))
  ctx.rotate(-paddleTilt)
  if (ghostTimer > 0) ctx.globalAlpha = 0.22

  // Outer glow halo
  if (!IS_MOBILE) {
    const glowBlur = 14 + Math.sin(frame * 0.05) * 5
    ctx.shadowColor = '#00ffff'
    ctx.shadowBlur = glowBlur
  }
  // Main body
  ctx.fillStyle = '#00ffff'
  ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, r); ctx.fill()

  // Inner specular highlight
  if (!IS_MOBILE) {
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.beginPath()
    ctx.roundRect(-pw / 2 + 2, -ph / 2 + 2, pw - 4, ph / 2 - 2, [r, r, 0, 0])
    ctx.fill()
  }
  ctx.restore()
}

function rebuildPaddle(w) {
  paddleW = Math.max(1.0, Math.min(5.0, w))
}

function spawnPaddleThruster(color, dir) {
  if (IS_MOBILE) return
  for (let i = 0; i < 2; i++) {
    const ox = (Math.random() - 0.5) * paddleW * 0.8
    spawnP(paddleX + ox, currentPaddleY, color, 1)
  }
}

function spawnPaddleThrusterBurst(color, dir) {
  if (IS_MOBILE) return
  for (let i = 0; i < 15; i++) {
    const ox = (Math.random() - 0.5) * paddleW
    const px = paddleX + ox, py = currentPaddleY
    const vx = (Math.random() - 0.5) * 0.06
    const vy = -dir * (0.06 + Math.random() * 0.14)
    _spawnRawParticle(px, py, vx, vy, color, 0.8 + Math.random() * 1.5, 0.02 + Math.random() * 0.03)
  }
}

