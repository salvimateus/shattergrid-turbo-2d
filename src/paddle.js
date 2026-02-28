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
  const glowBlur = 14 + Math.sin(frame * 0.05) * 5
  ctx.shadowColor = '#00ffff'
  ctx.shadowBlur = glowBlur
  // Main body
  ctx.fillStyle = '#00ffff'
  ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, r); ctx.fill()

  // Inner specular highlight
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.beginPath()
  ctx.roundRect(-pw / 2 + 2, -ph / 2 + 2, pw - 4, ph / 2 - 2, [r, r, 0, 0])
  ctx.fill()
  ctx.restore()
}

function rebuildPaddle(w) {
  paddleW = Math.max(1.0, Math.min(5.0, w))
}

function spawnPaddleThruster(color, dir) {
  for (let i = 0; i < PADDLE_THRUSTER_COUNT; i++) {
    const ox = (Math.random() - 0.5) * paddleW * 0.8
    const spawnY = currentPaddleY + dir * PADDLE_H / 2
    const vx = (Math.random() - 0.5) * 0.03
    const vy = dir * (0.04 + Math.random() * 0.08)
    _spawnRawParticle(paddleX + ox, spawnY, vx, vy, color, (0.5 + Math.random() * 0.8) * PADDLE_SIZE_SCALE, 0.04 + Math.random() * 0.03)
  }
}

function spawnPaddleThrusterBurst(color, dir) {
  for (let i = 0; i < PADDLE_BURST_COUNT; i++) {
    const ox = (Math.random() - 0.5) * paddleW
    const spawnY = currentPaddleY + dir * PADDLE_H / 2
    const vx = (Math.random() - 0.5) * 0.06
    const vy = dir * (0.06 + Math.random() * 0.14)
    _spawnRawParticle(paddleX + ox, spawnY, vx, vy, color, (0.8 + Math.random() * 1.5) * PADDLE_SIZE_SCALE, 0.02 + Math.random() * 0.03)
  }
}
