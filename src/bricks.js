// ═══ BRICKS ═══
const hpColors = [0x00ccff, 0xffcc00, 0xff004d]

function createBricks() {
  bricks = []
  const tw = BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP
  const sx = -tw / 2 + BRICK_W / 2
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const isGlass = Math.random() < GLASS_CHANCE
      const hp = isGlass ? 1 : (1 + Math.floor(Math.random() * 3))
      const col = hpColors[hp - 1]
      const x = sx + c * (BRICK_W + BRICK_GAP)
      const y = BRICK_START_Y - r * (BRICK_H + BRICK_GAP)
      bricks.push({ x, y, hp, maxHp: hp, color: isGlass ? 0x88ccff : col, alive: true, hitAnim: 0, glass: isGlass, row: r })
    }
  }
  initialBrickCount = bricks.filter(b => !b.glass).length
  aliveBrickCount = initialBrickCount
}

function drawBrick(br) {
  const floatY = br.y + Math.sin(frame * 0.02 + br.x * 0.5) * 0.02
  const pw = ws(BRICK_W), ph = ws(BRICK_H)
  const bx = wx(br.x) - pw / 2, by = wy(floatY) - ph / 2
  const r = Math.min(3, pw / 5, ph / 5)
  const col = hexToStr(br.color)

  ctx.save()
  if (br.glass) {
    const glassOpa = 0.25 + Math.sin(frame * 0.04 + br.x) * 0.1
    ctx.globalAlpha = glassOpa
    ctx.fillStyle = '#aaeeff'
    ctx.shadowColor = '#88ccff'; ctx.shadowBlur = ws(0.4)
  } else {
    const hpRatio = br.hp / br.maxHp
    ctx.globalAlpha = 0.4 + hpRatio * 0.6
    ctx.fillStyle = col
    const ei = br.hitAnim > 0 ? 2.5 : (0.5 + br.row * 0.12)
    ctx.shadowColor = col; ctx.shadowBlur = ws(0.25 + ei * 0.12)
  }
  ctx.beginPath(); ctx.roundRect(bx, by, pw, ph, r); ctx.fill()

  // Edge highlight (non-glass only)
  if (!br.glass) {
    ctx.shadowBlur = 0
    ctx.globalAlpha = 0.35
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(bx, by, pw, ph, r); ctx.stroke()
  }
  ctx.restore()
}

function drawBricks() {
  for (const br of bricks) {
    if (!br.alive) continue
    drawBrick(br)
    if (br.hitAnim > 0) br.hitAnim = Math.max(0, br.hitAnim - 0.05)
  }
}

// ═══ MUSIC INTENSITY ═══
function checkMusicIntensity() {
  if (initialBrickCount <= 0) return
  const pct = aliveBrickCount / initialBrickCount
  let newIntensity = 0
  if (pct <= 0.10) newIntensity = 2
  else if (pct <= 0.50) newIntensity = 1
  if (newIntensity !== musicIntensity) {
    musicIntensity = newIntensity
    if (musicPlaying) { stopMusic(); startMusic() }
  }
}
