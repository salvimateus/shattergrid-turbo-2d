// ═══ BOMBS ═══
const BOMB_R = 0.25, BOMB_EXPLODE_R = 2.8, BOMB_SPEED = 0.16

function launchBomb(x, y) {
  const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.4
  bombs.push({ x, y, vx: Math.cos(angle) * BOMB_SPEED, vy: Math.abs(Math.sin(angle)) * BOMB_SPEED, age: 0, rot: 0 })
  SFX.bombBounce()
}

function drawBomb(b) {
  ctx.save()
  ctx.translate(wx(b.x), wy(b.y))
  ctx.rotate(b.rot)
  // Outer glow
  ctx.globalAlpha = 0.15 + Math.sin(frame * 0.3) * 0.08
  if (!IS_MOBILE) { ctx.shadowColor = '#ff6600'; ctx.shadowBlur = ws(BOMB_R * 5) }
  ctx.fillStyle = '#ff6600'
  ctx.beginPath(); ctx.arc(0, 0, ws(BOMB_R * 3), 0, Math.PI * 2); ctx.fill()
  // Core
  ctx.globalAlpha = 1
  ctx.fillStyle = '#ff6600'
  if (!IS_MOBILE) { ctx.shadowColor = '#ff4400'; ctx.shadowBlur = ws(BOMB_R * 3) }
  ctx.beginPath(); ctx.arc(0, 0, ws(BOMB_R), 0, Math.PI * 2); ctx.fill()
  // Hot center
  ctx.fillStyle = '#ffcc44'
  ctx.beginPath(); ctx.arc(0, 0, ws(BOMB_R * 0.4), 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawBombs() { for (const b of bombs) drawBomb(b) }

function explodeBomb(bomb) {
  SFX.bombExplode(); shake(1.2)
  spawnP(bomb.x, bomb.y, 0xff6600, 40)
  spawnP(bomb.x, bomb.y, 0xffcc00, 25)
  spawnP(bomb.x, bomb.y, 0xff2200, 20)
  for (const br of bricks) {
    if (!br.alive) continue
    const dx = br.x - bomb.x, dy = br.y - bomb.y
    if (Math.sqrt(dx * dx + dy * dy) < BOMB_EXPLODE_R) {
      br.alive = false
      if (!br.glass) aliveBrickCount--
      score += (br.glass ? 5 : br.maxHp * 15) * 2
      spawnP(br.x, br.y, br.color, 15)
      if (!br.glass) spawnDrop(br.x, br.y)
    }
  }
  updateHUD(); checkWin()
}

function updateBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i]; b.age++
    b.x += b.vx; b.y += b.vy; b.vy -= 0.0008; b.rot += 0.1
    if (frame % BOMB_TRAIL_INTERVAL === 0) spawnP(b.x, b.y, 0xff8800, IS_MOBILE ? 1 : 3)
    // Wall bounces
    if (b.x - BOMB_R < -FIELD_W / 2) { b.x = -FIELD_W / 2 + BOMB_R; b.vx = Math.abs(b.vx); SFX.bombBounce() }
    if (b.x + BOMB_R > FIELD_W / 2)  { b.x = FIELD_W / 2 - BOMB_R;  b.vx = -Math.abs(b.vx); SFX.bombBounce() }
    if (b.y + BOMB_R > FIELD_H / 2)  { b.y = FIELD_H / 2 - BOMB_R;  b.vy = -Math.abs(b.vy); SFX.bombBounce() }
    // Paddle bounce
    const bhw = paddleW / 2
    if (b.y - BOMB_R < currentPaddleY + PADDLE_H / 2 && b.y + BOMB_R > currentPaddleY - PADDLE_H / 2 &&
        b.x > paddleX - bhw - BOMB_R && b.x < paddleX + bhw + BOMB_R && b.vy < 0) {
      b.vy = Math.abs(b.vy); b.y = currentPaddleY + PADDLE_H / 2 + BOMB_R
      b.vx += ((b.x - paddleX) / bhw) * 0.06; SFX.bombBounce()
      spawnP(b.x, currentPaddleY + PADDLE_H / 2, 0xff6600, 6)
    }
    // Off bottom
    if (b.y - BOMB_R < -FIELD_H / 2) { bombs.splice(i, 1); continue }
    // Brick collision → explode
    if (b.age < 10) continue
    let hit = false
    for (const br of bricks) {
      if (!br.alive) continue
      if (Math.abs(b.x - br.x) < BRICK_W / 2 + BOMB_R && Math.abs(b.y - br.y) < BRICK_H / 2 + BOMB_R) { hit = true; break }
    }
    if (hit) { explodeBomb(b); bombs.splice(i, 1) }
  }
}

