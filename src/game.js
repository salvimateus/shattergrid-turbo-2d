// ═══ APPLY DROP ═══
function applyDrop(t) {
  const el = document.getElementById('powerup-popup')
  el.textContent = t.label
  el.style.color = '#' + t.color.toString(16).padStart(6, '0')
  el.classList.remove('show')
  void el.offsetWidth
  el.classList.add('show')
  if (t.good) SFX.powerGood()
  else SFX.powerBad()
  addDropLog(t)
  switch (t.id) {
    case 'grow':
      if (growTimer <= 0) savedPaddleW = paddleW
      rebuildPaddle(savedPaddleW + 0.6)
      growTimer = 8 * 60
      break
    case 'shrink':
      if (shrinkTimer <= 0) savedPaddleW = paddleW
      rebuildPaddle(savedPaddleW - 0.5)
      shrinkTimer = 4 * 60
      break
    case 'multiball': {
      const p = balls.find((b) => b.alive)
      if (p) {
        const spd = Math.max(p.speed, BALL_SPEED_INIT)
        const ang =
          Math.atan2(p.vy, p.vx) + Math.PI / 4 + (Math.random() - 0.5) * 0.3
        const nvx = Math.cos(ang) * spd
        let nvy = Math.sin(ang) * spd
        if (Math.abs(nvy) < 0.04) nvy = nvy >= 0 ? 0.04 : -0.04
        balls.push(mkBall(p.x, p.y, nvx, nvy, spd))
      }
      break
    }
    case 'life':
      lives = Math.min(lives + 1, 5)
      updateHUD()
      break
    case 'glass': {
      const tw = BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP
      const sx = -tw / 2 + BRICK_W / 2,
        ry = currentPaddleY + 3
      for (let c = 0; c < BRICK_COLS; c++) {
        const x = sx + c * (BRICK_W + BRICK_GAP)
        const br = {
          x,
          y: ry,
          hp: 1,
          maxHp: 1,
          color: 0x88ccff,
          alive: true,
          hitAnim: 0,
          glass: true,
          row: -1,
        }
        bricks.push(br)
        glassBrickIds.push(br)
      }
      glassTimer = 16 * 60
      break
    }
    case 'bomb':
      launchBomb(paddleX, currentPaddleY + PADDLE_H / 2 + 0.3)
      bombTimer = 16 * 60
      break
    case 'slowmo':
      if (timeScaleTimer > 0)
        deactivateDropLog(timeScale < 1 ? 'slowmo' : 'fastmo')
      timeScale = 0.7
      timeScaleTimer = 5 * 60
      timeAccum = 0
      break
    case 'fastmo':
      if (timeScaleTimer > 0)
        deactivateDropLog(timeScale < 1 ? 'slowmo' : 'fastmo')
      timeScale = 1.3
      timeScaleTimer = 3 * 60
      timeAccum = 0
      break
    case 'paddle_down': {
      if (paddleUpTimer > 0) { paddleUpTimer = 0; deactivateDropLog('paddle_up') }
      const MIN_Y = -FIELD_H / 2 + 1.5
      paddleYOffset = Math.max(-1.5, MIN_Y - PADDLE_Y)
      targetPaddleY = PADDLE_Y + paddleYOffset
      paddleDownTimer = 8 * 60
      spawnPaddleThrusterBurst(0x44ddaa, 1)
      break
    }
    case 'paddle_up': {
      if (paddleDownTimer > 0) { paddleDownTimer = 0; deactivateDropLog('paddle_down') }
      const MAX_Y = -FIELD_H / 2 + 6.0
      paddleYOffset = Math.min(1.5, MAX_Y - PADDLE_Y)
      targetPaddleY = PADDLE_Y + paddleYOffset
      paddleUpTimer = 8 * 60
      spawnPaddleThrusterBurst(0xdd4444, -1)
      break
    }
    case 'bw':
      clearAllFilters()
      bwTimer = 8 * 60
      canvas.style.filter = 'grayscale(1)'
      break
    case 'crt':
      clearAllFilters()
      crtTimer = 10 * 60
      document.getElementById('crt-overlay').style.display = 'block'
      canvas.style.filter = 'brightness(1.3) contrast(1.1) saturate(0.7) hue-rotate(-10deg)'
      break
    case 'old_film':
      clearAllFilters()
      filmTimer = 12 * 60
      document.getElementById('film-overlay').style.display = 'block'
      document.getElementById('film-noise').style.display = 'block'
      startFilmNoise()
      canvas.style.filter = 'sepia(0.7) contrast(0.7) saturate(0.3) brightness(0.7)'
      break
    case 'laser_sight':
      laserSightTimer = 16 * 60
      break
    case 'spin':
      spinTimer = 5 * 60
      break
    case 'ghost':
      ghostTimer = 5 * 60
      break
  }
}

// ═══ CHARGE ═══
function startCharge() {
  charging = true
  chTimer = 0
  chParts = []
  const p = balls[0]
  if (!p) return
  p.vx = 0
  p.vy = 0
  p.x = paddleX
  p.y = currentPaddleY + PADDLE_H / 2 + BALL_R + 0.1
}

function updateCharge() {
  if (!charging) return
  chTimer++
  const prog = chTimer / CHARGE_DUR
  const p = balls[0]
  if (!p) return
  p.x = paddleX
  p.y = currentPaddleY + PADDLE_H / 2 + BALL_R + 0.1
  if (chTimer % 12 === 0) SFX.chargeUp(prog)
  if (chTimer % CHARGE_PARTICLE_INTERVAL === 0) {
    const a = Math.random() * Math.PI * 2,
      dist = 3 + (1 - prog) * 4
    const col = prog < 0.5 ? 0x0066ff : prog < 0.8 ? 0x00ccff : 0xffffff
    _spawnRawParticle(
      p.x + Math.cos(a) * dist,
      p.y + Math.sin(a) * dist,
      ((p.x - (p.x + Math.cos(a) * dist)) * (0.04 + prog * 0.12)) / dist,
      ((p.y - (p.y + Math.sin(a) * dist)) * (0.04 + prog * 0.12)) / dist,
      col,
      0.12 + prog * 0.12,
      0.04 + Math.random() * 0.02,
    )
  }
  if (prog > 0.6) shakeAmt = Math.max(shakeAmt, (prog - 0.6) * 0.4)
  if (chTimer >= CHARGE_DUR) {
    charging = false
    chParts = []
    spawnP(p.x, p.y, 0x00ffff, 25)
    shake(0.6)
    SFX.chargeLaunch()
    const a = Math.PI / 2 + (Math.random() - 0.5) * 0.6
    p.speed = BALL_SPEED_INIT
    p.vx = Math.cos(a) * p.speed
    p.vy = Math.abs(Math.sin(a)) * p.speed
  }
}

// ═══ GAME ═══
function initGame() {
  score = 0
  lives = MAX_LIVES
  combo = 0
  paddleW = PADDLE_W_DEF
  paddleX = 0
  paddleYOffset = 0
  currentPaddleY = PADDLE_Y
  targetPaddleY = PADDLE_Y
  paddleTilt = 0
  timeScale = 1
  timeScaleTimer = 0
  timeAccum = 0
  musicIntensity = 0
  bwTimer = 0
  crtTimer = 0
  filmTimer = 0
  laserSightTimer = 0
  spinTimer = 0
  ghostTimer = 0
  wallNudgeLeft = 0
  wallNudgeRight = 0
  wallShakeLeft = 0
  wallShakeRight = 0
  wallShakeTop = 0
  wallTiltLeft = 0
  wallTiltRight = 0
  prevAtLeftWall = false
  prevAtRightWall = false
  mouseX = 0
  canvas.style.filter = ''
  document.getElementById('crt-overlay').style.display = 'none'
  stopFilmNoise()
  document.getElementById('pause-screen').style.display = 'none'
  clearDropLog()
  rebuildPaddle(paddleW)
  balls = []
  drops = []
  bombs = []
  particles = []
  trails = []
  chParts = []
  charging = false
  glassBrickIds = []
  growTimer = 0
  shrinkTimer = 0
  glassTimer = 0
  bombTimer = 0
  paddleUpTimer = 0
  paddleDownTimer = 0
  createBricks()
  balls.push(
    mkBall(
      0,
      currentPaddleY + PADDLE_H / 2 + BALL_R + 0.1,
      0,
      0,
      BALL_SPEED_INIT,
    ),
  )
  startCharge()
  updateHUD()
}

function loseLife() {
  lives--
  shake(1.5)
  SFX.loseLife()
  updateHUD()
  if (lives <= 0) {
    gameState = 'gameover'
    muffleMusic()
    SFX.gameOver()
    saveScore(score)
    document.getElementById('final-score').textContent = score
    renderEndDrops('gameover-drops')
    renderScoreboard('gameover-scoreboard', score)
    document.getElementById('game-over-screen').style.display = 'flex'
  } else {
    combo = 0
    showLifeLost(lives)
    balls = []
    balls.push(
      mkBall(
        paddleX,
        currentPaddleY + PADDLE_H / 2 + BALL_R + 0.1,
        0,
        0,
        BALL_SPEED_INIT,
      ),
    )
    startCharge()
  }
}

function checkWin() {
  checkMusicIntensity()
  if (aliveBrickCount <= 0) {
    bricks.forEach((b) => {
      b.alive = false
    })
    gameState = 'win'
    stopMusic()
    SFX.win()
    saveScore(score)
    document.getElementById('win-score').textContent = score
    renderEndDrops('win-drops')
    renderScoreboard('win-scoreboard', score)
    document.getElementById('win-screen').style.display = 'flex'
  }
}

// ═══ LASER SIGHT ═══
function drawLaserSight() {
  const b = balls.find((bl) => bl.alive)
  if (!b || (b.vx === 0 && b.vy === 0)) return
  const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
  const dx = b.vx / spd,
    dy = b.vy / spd
  let tMin = 999
  if (dx < 0) {
    const t = (-FIELD_W / 2 + BALL_R - b.x) / dx
    if (t > 0 && t < tMin) tMin = t
  }
  if (dx > 0) {
    const t = (FIELD_W / 2 - BALL_R - b.x) / dx
    if (t > 0 && t < tMin) tMin = t
  }
  if (dy > 0) {
    const t = (FIELD_H / 2 - BALL_R - b.y) / dy
    if (t > 0 && t < tMin) tMin = t
  }
  if (dy < 0) {
    const t = (currentPaddleY + PADDLE_H / 2 + BALL_R - b.y) / dy
    if (t > 0 && t < tMin) tMin = t
  }
  const hx = b.x + dx * tMin,
    hy = b.y + dy * tMin
  const eps = 0.1
  let rnx = 0,
    rny = 0
  if (Math.abs(hx - (-FIELD_W / 2 + BALL_R)) < eps) {
    rnx = 1
  } else if (Math.abs(hx - (FIELD_W / 2 - BALL_R)) < eps) {
    rnx = -1
  } else if (Math.abs(hy - (FIELD_H / 2 - BALL_R)) < eps) {
    rny = -1
  } else {
    rny = 1
  }
  const dot = dx * rnx + dy * rny
  const rdx = dx - 2 * dot * rnx,
    rdy = dy - 2 * dot * rny
  const bx2 = hx + rdx * 3,
    by2 = hy + rdy * 3
  const pulse = 0.4 + Math.sin(frame * 0.15) * 0.2
  ctx.save()
  ctx.strokeStyle = '#ff0044'
  ctx.lineWidth = 1.5
  ctx.globalAlpha = pulse
  ctx.shadowColor = '#ff0044'
  ctx.shadowBlur = 6
  ctx.setLineDash([ws(0.18), ws(0.12)])
  ctx.beginPath()
  ctx.moveTo(wx(b.x), wy(b.y))
  ctx.lineTo(wx(hx), wy(hy))
  ctx.stroke()
  ctx.globalAlpha = pulse * 0.5
  ctx.beginPath()
  ctx.moveTo(wx(hx), wy(hy))
  ctx.lineTo(wx(bx2), wy(by2))
  ctx.stroke()
  ctx.restore()
}

// ═══ COLLISION ═══
function ballBrick(ball, br) {
  const hw = BRICK_W / 2 + BALL_R,
    hh = BRICK_H / 2 + BALL_R
  const dx = ball.x - br.x,
    dy = ball.y - br.y
  if (Math.abs(dx) < hw && Math.abs(dy) < hh) {
    if (!br.glass) {
      const ox = hw - Math.abs(dx),
        oy = hh - Math.abs(dy)
      if (ox < oy) {
        ball.vx = -ball.vx
        ball.x += dx > 0 ? ox : -ox
      } else {
        ball.vy = -ball.vy
        ball.y += dy > 0 ? oy : -oy
      }
    }
    return true
  }
  return false
}

// ═══ UPDATE ═══
function update() {
  if (gameState !== 'playing') return
  frame++
  // Effect timers
  if (bwTimer > 0) {
    bwTimer--
    if (bwTimer <= 0) {
      canvas.style.filter = ''
      deactivateDropLog('bw')
    }
  }
  if (crtTimer > 0) {
    crtTimer--
    if (crtTimer <= 0) {
      document.getElementById('crt-overlay').style.display = 'none'
      if (filmTimer <= 0 && bwTimer <= 0) canvas.style.filter = ''
      deactivateDropLog('crt')
    }
  }
  if (filmTimer > 0) {
    filmTimer--
    if (filmTimer <= 0) {
      stopFilmNoise()
      if (crtTimer <= 0 && bwTimer <= 0) canvas.style.filter = ''
      deactivateDropLog('old_film')
    }
  }
  if (growTimer > 0) {
    growTimer--
    if (growTimer <= 0) {
      rebuildPaddle(savedPaddleW)
      deactivateDropLog('grow')
      showDropExpiry('⬌ EXPAND', 0x00ff88)
      spawnP(paddleX, currentPaddleY, 0x00ff88, 20)
    }
  }
  if (shrinkTimer > 0) {
    shrinkTimer--
    if (shrinkTimer <= 0) {
      rebuildPaddle(savedPaddleW)
      deactivateDropLog('shrink')
      showDropExpiry('⬌ SHRINK', 0xff4444)
      spawnP(paddleX, currentPaddleY, 0xff4444, 20)
    }
  }
  if (glassTimer > 0) {
    glassTimer--
    if (glassTimer <= 0) {
      glassBrickIds.forEach((br) => {
        if (br.alive) {
          br.alive = false
          spawnP(br.x, br.y, 0x88ccff, 8)
        }
      })
      glassBrickIds = []
      deactivateDropLog('glass')
    }
  }
  if (bombTimer > 0) {
    bombTimer--
    if (bombTimer <= 0) deactivateDropLog('bomb')
  }
  if (paddleDownTimer > 0) {
    paddleDownTimer--
    if (frame % 3 === 0) spawnPaddleThruster(0x44ddaa, 1)
    if (paddleDownTimer <= 0) {
      paddleYOffset = 0
      targetPaddleY = PADDLE_Y
      deactivateDropLog('paddle_down')
      showDropExpiry('↓ PADDLE BAIXO', 0x44ddaa)
      spawnP(paddleX, currentPaddleY, 0x44ddaa, 25)
    }
  }
  if (paddleUpTimer > 0) {
    paddleUpTimer--
    if (frame % 3 === 0) spawnPaddleThruster(0xdd4444, -1)
    if (paddleUpTimer <= 0) {
      paddleYOffset = 0
      targetPaddleY = PADDLE_Y
      deactivateDropLog('paddle_up')
      showDropExpiry('↑ PADDLE ALTO', 0xdd4444)
      spawnP(paddleX, currentPaddleY, 0xdd4444, 25)
    }
  }
  if (laserSightTimer > 0) {
    laserSightTimer--
    if (laserSightTimer <= 0) deactivateDropLog('laser_sight')
  }
  if (spinTimer > 0) {
    spinTimer--
    if (spinTimer <= 0) {
      deactivateDropLog('spin')
      showDropExpiry('🌀 GIRO LOUCO', 0xff44ff)
      spawnP(paddleX, currentPaddleY, 0xff44ff, 20)
    }
  }
  if (ghostTimer > 0) {
    ghostTimer--
    if (ghostTimer <= 0) {
      deactivateDropLog('ghost')
      showDropExpiry('👻 FANTASMA', 0x6644aa)
      spawnP(paddleX, currentPaddleY, 0x6644aa, 20)
    }
  }
  // Paddle Y smooth
  if (Math.abs(currentPaddleY - targetPaddleY) > 0.01)
    currentPaddleY += (targetPaddleY - currentPaddleY) * 0.12
  else currentPaddleY = targetPaddleY
  // Paddle X smooth
  const hw = paddleW / 2,
    minX = -FIELD_W / 2 + hw,
    maxX = FIELD_W / 2 - hw
  const ct = Math.max(minX, Math.min(maxX, mouseX))
  const prevPX = paddleX
  paddleX += (ct - paddleX) * 0.3
  const paddleVel = paddleX - prevPX
  paddleTilt = spinTimer > 0 ? paddleTilt + 0.18 : paddleVel * 0.45

  // Nudge das paredes: acumula quando paddle pressiona o limite, decai quando não
  if (mouseX < minX) wallNudgeLeft  = Math.min(1, wallNudgeLeft  + 0.12)
  else                wallNudgeLeft  = Math.max(0, wallNudgeLeft  - 0.06)
  if (mouseX > maxX) wallNudgeRight = Math.min(1, wallNudgeRight + 0.12)
  else                wallNudgeRight = Math.max(0, wallNudgeRight - 0.06)

  // Tilt das paredes: segue o nudge suavemente (eixo central → inclina a parede)
  wallTiltLeft  += (wallNudgeLeft  * 0.22 - wallTiltLeft)  * 0.1
  wallTiltRight += (wallNudgeRight * 0.22 - wallTiltRight) * 0.1

  // Chacoalho das paredes: decai rápido a cada frame
  wallShakeLeft  *= 0.76
  wallShakeRight *= 0.76
  wallShakeTop   *= 0.76



  // Detecta primeiro contato do paddle com a parede lateral → dispara recoil + shake
  const atLeftWall  = paddleX <= minX + 0.02
  const atRightWall = paddleX >= maxX - 0.02
  if (atLeftWall && !prevAtLeftWall) {
    wallShakeLeft = Math.min(1, wallShakeLeft + 0.7)
    // Partículas: saem da borda esquerda em direção ao interior
    for (let i = 0; i < 7; i++) {
      const oy = (Math.random() - 0.5) * paddleW * 0.7
      _spawnRawParticle(
        minX, currentPaddleY + oy,
        0.06 + Math.random() * 0.09, (Math.random() - 0.5) * 0.06,
        0x00ccff, 0.14 + Math.random() * 0.10, 0.022 + Math.random() * 0.018
      )
    }
  }
  if (atRightWall && !prevAtRightWall) {
    wallShakeRight = Math.min(1, wallShakeRight + 0.7)
    // Partículas: saem da borda direita em direção ao interior
    for (let i = 0; i < 7; i++) {
      const oy = (Math.random() - 0.5) * paddleW * 0.7
      _spawnRawParticle(
        maxX, currentPaddleY + oy,
        -(0.06 + Math.random() * 0.09), (Math.random() - 0.5) * 0.06,
        0x00ccff, 0.14 + Math.random() * 0.10, 0.022 + Math.random() * 0.018
      )
    }
  }
  prevAtLeftWall  = atLeftWall
  prevAtRightWall = atRightWall

  if (charging) {
    updateCharge()
    updateDrops()
    updateBombs()
    return
  }
  let anyAlive = false
  for (let bi = balls.length - 1; bi >= 0; bi--) {
    const b = balls[bi]
    if (!b.alive) continue
    const curSpd = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
    if (curSpd < BALL_SPEED_INIT * 0.5 && curSpd > 0) {
      const sc = BALL_SPEED_INIT / curSpd
      b.vx *= sc
      b.vy *= sc
    }
    if (Math.abs(b.vy) < 0.02) b.vy = b.vy >= 0 ? 0.02 : -0.02
    b.x += b.vx
    b.y += b.vy
    if (frame % TRAIL_INTERVAL === 0) spawnTrail(b.x, b.y)
    // Walls
    if (b.x - BALL_R < -FIELD_W / 2) {
      b.x = -FIELD_W / 2 + BALL_R
      // Reflexão com parede inclinada: normal = (cos(tilt), sin(tilt)) aponta pro interior
      const tL = wallTiltLeft
      const nLx = Math.cos(tL), nLy = Math.sin(tL)
      const dotL = b.vx * nLx + b.vy * nLy
      b.vx -= 2 * dotL * nLx
      b.vy -= 2 * dotL * nLy
      if (b.vx < 0) b.vx = Math.abs(b.vx) // garante afastamento da parede
      b.vy = Math.max(-b.speed * 0.95, Math.min(b.speed * 0.95, b.vy))
      wallShakeLeft = Math.min(1, wallShakeLeft + 0.9)
      shake(0.2 + wallNudgeLeft * 0.3)
      spawnP(b.x, b.y, wallNudgeLeft > 0.05 ? 0x00ffff : 0x0088ff, wallNudgeLeft > 0.05 ? 10 : 6)
      SFX.wallHit()
    }
    if (b.x + BALL_R > FIELD_W / 2) {
      b.x = FIELD_W / 2 - BALL_R
      // Reflexão com parede inclinada: normal = (-cos(tilt), sin(tilt))
      const tR = wallTiltRight
      const nRx = -Math.cos(tR), nRy = Math.sin(tR)
      const dotR = b.vx * nRx + b.vy * nRy
      b.vx -= 2 * dotR * nRx
      b.vy -= 2 * dotR * nRy
      if (b.vx > 0) b.vx = -Math.abs(b.vx) // garante afastamento da parede
      b.vy = Math.max(-b.speed * 0.95, Math.min(b.speed * 0.95, b.vy))
      wallShakeRight = Math.min(1, wallShakeRight + 0.9)
      shake(0.2 + wallNudgeRight * 0.3)
      spawnP(b.x, b.y, wallNudgeRight > 0.05 ? 0x00ffff : 0x0088ff, wallNudgeRight > 0.05 ? 10 : 6)
      SFX.wallHit()
    }
    if (b.y + BALL_R > FIELD_H / 2) {
      b.y = FIELD_H / 2 - BALL_R
      b.vy = -Math.abs(b.vy)
      wallShakeTop = Math.min(1, wallShakeTop + 0.9)
      shake(0.2)
      spawnP(b.x, b.y, 0x0088ff, 6)
      SFX.wallHit()
    }
    // Death
    if (b.y - BALL_R < -FIELD_H / 2) {
      spawnP(b.x, b.y, 0xff0044, 15)
      b.alive = false
      balls.splice(bi, 1)
      continue
    }
    // Paddle collision — OBB: transforma a bola para o espaço local do paddle
    const bx = b.x, by = b.y
    const cosT = Math.cos(paddleTilt), sinT = Math.sin(paddleTilt)
    const dx = bx - paddleX, dy = by - currentPaddleY
    // Posição da bola no referencial local do paddle (rotação inversa)
    const lx = dx * cosT + dy * sinT
    const ly = -dx * sinT + dy * cosT
    // Velocidade da bola no referencial local (só componente Y é necessária para checar direção)
    const lvy = -b.vx * sinT + b.vy * cosT
    if (
      Math.abs(lx) < hw + BALL_R &&
      Math.abs(ly) < PADDLE_H / 2 + BALL_R &&
      lvy < 0
    ) {
      const hp = Math.max(-0.95, Math.min(0.95, lx / hw))
      // Ângulo de saída no espaço local do paddle
      const ang = Math.PI / 2 + hp * (Math.PI / 3)
      b.speed = Math.min(b.speed + 0.003, BALL_SPEED_MAX)
      let nlvx = Math.cos(ang) * b.speed
      let nlvy = Math.sin(ang) * b.speed
      if (nlvy < 0.04) nlvy = 0.04
      // Converter de volta para espaço do mundo
      b.vx = nlvx * cosT - nlvy * sinT
      b.vy = nlvx * sinT + nlvy * cosT
      // Reposicionar a bola sobre a superfície do paddle (no espaço local)
      const newLy = PADDLE_H / 2 + BALL_R
      b.x = paddleX + lx * cosT - newLy * sinT
      b.y = currentPaddleY + lx * sinT + newLy * cosT
      // Garantir que a bola sobe no espaço do mundo (nunca fica presa)
      if (b.vy < 0.04) b.vy = 0.04
      shake(0.15)
      spawnP(bx, currentPaddleY + PADDLE_H / 2, 0x00ffff, 8)
      SFX.paddleHit()
      combo = 0
    }
    // Brick collision
    for (let i = 0; i < bricks.length; i++) {
      const br = bricks[i]
      if (!br.alive) continue
      if (ballBrick(b, br)) {
        br.hp--
        combo++
        const pts = (br.glass ? 5 : br.maxHp * 15) * Math.max(1, combo)
        score += pts
        showCombo(combo, pts)
        if (br.hp <= 0) {
          br.alive = false
          if (br.glass) {
            spawnP(br.x, br.y, 0xccffff, 20)
            SFX.glassBreak()
            shake(0.15)
          } else {
            aliveBrickCount--
            spawnP(br.x, br.y, br.color, 25)
            SFX.brickDestroy(combo)
            shake(0.4 + combo * 0.05)
            spawnDrop(br.x, br.y)
          }
          b.speed = Math.min(b.speed + 0.002, BALL_SPEED_MAX)
          const ca = Math.atan2(b.vy, b.vx)
          b.vx = Math.cos(ca) * b.speed
          b.vy = Math.sin(ca) * b.speed
        } else {
          br.hitAnim = 1
          spawnP(br.x, br.y, br.color, 8)
          SFX.brickHit(combo)
          shake(0.15)
        }
        updateHUD()
        checkWin()
        if (!br.glass) break
      }
    }
    anyAlive = true
  }
  if (!anyAlive && !charging) {
    loseLife()
    return
  }
  updateDrops()
  updateBombs()
}

// ═══ DRAW ═══
function draw() {
  ctx.save()
  ctx.translate(shakeX, shakeY)
  drawBackground()
  drawWalls()
  if (laserSightTimer > 0) drawLaserSight()
  drawTrails()
  drawBricks()
  drawPaddle()
  drawBalls()
  drawDrops()
  drawBombs()
  drawP()
  // Charge glow on ball
  if (charging && balls[0]) {
    const p = balls[0],
      prog = chTimer / CHARGE_DUR
    const r = ws(BALL_R * (1.5 + prog * 3))
    ctx.save()
    ctx.globalAlpha = 0.15 + prog * 0.4
    ctx.fillStyle = prog < 0.5 ? '#0066ff' : prog < 0.8 ? '#00ccff' : '#ffffff'
    ctx.shadowColor = '#00ffff'
    ctx.shadowBlur = r * 2
    ctx.beginPath()
    ctx.arc(wx(p.x), wy(p.y), r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

// ═══ ANIMATE (main loop) ═══
const TARGET_FPS = 60
const FRAME_BUDGET = 1000 / TARGET_FPS
let lastFrameTime = 0

function animate(now) {
  requestAnimationFrame(animate)
  lastFrameTime = now

  if (timeScaleTimer > 0) {
    // Decrementa proporcional aos steps para manter duração real igual entre mobile e desktop
    timeScaleTimer -= STEPS_PER_FRAME
    if (timeScaleTimer <= 0) {
      const wasId = timeScale < 1 ? 'slowmo' : 'fastmo'
      const wasColor = timeScale < 1 ? 0x8844ff : 0xff2288
      const wasLabel = timeScale < 1 ? '🐢 CÂMERA LENTA' : '⚡ CÂMERA RÁPIDA'
      deactivateDropLog(wasId)
      showDropExpiry(wasLabel, wasColor)
      spawnP(paddleX, currentPaddleY, wasColor, 20)
      timeScale = 1
      timeAccum = 0
    }
  }
  if (timeScaleTimer <= 0 && timeScale !== 1) {
    timeScale = 1
    timeAccum = 0
  }
  // Multiplica por STEPS_PER_FRAME para rodar física na mesma velocidade que 60fps
  timeAccum += timeScale * STEPS_PER_FRAME
  const steps = Math.floor(timeAccum)
  timeAccum -= steps
  for (let s = 0; s < steps; s++) update()
  updateP()
  updateTrails()
  updateShake()
  draw()
}

// ═══ INPUT ═══
document.addEventListener('mousemove', (e) => {
  if (IS_MOBILE) return
  // Desktop: movimento relativo — paddle anda o mesmo tanto que o mouse, independente da posição do cursor
  const delta = Math.max(-80, Math.min(80, e.movementX))
  mouseX += delta / scale
  mouseX = Math.max(-FIELD_W / 2, Math.min(FIELD_W / 2, mouseX))
})
document.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault()
    mouseX = screenToFieldX(e.touches[0].clientX)
  },
  { passive: false },
)

function handleTap() {
  ensureAudio()
  if (gameState === 'start') {
    gameState = 'playing'
    document.getElementById('start-screen').style.display = 'none'
    initGame()
    startMusic()
  } else if (gameState === 'gameover') {
    gameState = 'playing'
    document.getElementById('game-over-screen').style.display = 'none'
    unmuffleMusic()
    initGame()
    startMusic()
  } else if (gameState === 'win') {
    gameState = 'playing'
    document.getElementById('win-screen').style.display = 'none'
    initGame()
    startMusic()
  }
}
document.addEventListener('click', () => {
  if (gameState !== 'paused') handleTap()
})
document.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length >= 2) {
      e.preventDefault()
      if (gameState === 'playing' || gameState === 'paused') togglePause()
      return
    }
    if (gameState !== 'playing' && gameState !== 'paused') {
      e.preventDefault()
      handleTap()
    }
  },
  { passive: false },
)

// ═══ PAUSE ═══
function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused'
    document.getElementById('pause-screen').style.display = 'flex'
    muffleMusic()
  } else if (gameState === 'paused') {
    gameState = 'playing'
    document.getElementById('pause-screen').style.display = 'none'
    unmuffleMusic()
  }
}
document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'Space') {
    e.preventDefault()
    if (gameState === 'playing' || gameState === 'paused') togglePause()
  }
})

// ═══ RESIZE & START ═══
addEventListener('resize', () => {
  resize()
  repositionHUD()
})
repositionHUD()
animate()
