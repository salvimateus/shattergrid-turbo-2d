// ═══ BALL ═══
function mkBall(x, y, vx, vy, spd) {
  return { x, y, vx, vy, speed: spd || BALL_SPEED_INIT, alive: true }
}

function drawBall(b) {
  const bx = b.x, by = b.y

  const opa = 0.08 + Math.sin(frame * 0.1) * 0.04
  ctx.save()
  ctx.globalAlpha = opa
  ctx.fillStyle = '#00ffff'
  ctx.shadowColor = '#00ffff'
  ctx.shadowBlur = ws(BALL_R * 6)
  ctx.beginPath(); ctx.arc(wx(bx), wy(by), ws(BALL_R * 2.5), 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  // Ball core
  ctx.save()
  ctx.shadowColor = '#00ffff'; ctx.shadowBlur = ws(BALL_R * 4)
  // White base + cyan overlay = bright cyan-white
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(wx(bx), wy(by), ws(BALL_R), 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 0.75
  ctx.fillStyle = '#00ffff'
  ctx.beginPath(); ctx.arc(wx(bx), wy(by), ws(BALL_R), 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawBalls() {
  for (const b of balls) {
    if (b.alive) drawBall(b)
  }
}
