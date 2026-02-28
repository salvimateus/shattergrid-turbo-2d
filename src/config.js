// ═══ CONFIG ═══
const FIELD_W = 14, FIELD_H = 20
const PADDLE_W_DEF = 2.4, PADDLE_H = 0.35
const PADDLE_Y = -FIELD_H / 2 + 3.5
const BALL_R = 0.2, BALL_SPEED_INIT = 0.14, BALL_SPEED_MAX = 0.26
const BRICK_ROWS = 7, BRICK_COLS = 10
const BRICK_W = 1.2, BRICK_H = 0.45, BRICK_GAP = 0.1
const BRICK_START_Y = FIELD_H / 2 - 3
const MAX_LIVES = 3, DROP_CHANCE = 0.65, GLASS_CHANCE = 0.12
const CHARGE_DUR = 90
const FIELD_MARGIN = 0.8

// Mobile detection & perf tuning
const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || ('ontouchstart' in window && innerWidth < 900)
const MAX_PARTICLES_CAP = IS_MOBILE ? 120 : 600
const TRAIL_INTERVAL = IS_MOBILE ? 6 : 2
const PARTICLE_SCALE = IS_MOBILE ? 0.35 : 1.0
const CHARGE_PARTICLE_INTERVAL = IS_MOBILE ? 6 : 3
const BOMB_TRAIL_INTERVAL = IS_MOBILE ? 6 : 3

