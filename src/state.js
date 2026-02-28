// ═══ STATE ═══
let gameState = 'start', score = 0, combo = 0, lives = MAX_LIVES
let mouseX = 0, shakeAmt = 0, shakeX = 0, shakeY = 0, frame = 0
let paddleW = PADDLE_W_DEF
let paddleX = 0, targetPaddleX = 0
let paddleYOffset = 0
let currentPaddleY = PADDLE_Y, targetPaddleY = PADDLE_Y
let paddleTilt = 0
let timeScale = 1, timeScaleTimer = 0, timeAccum = 0
let bwTimer = 0, crtTimer = 0, filmTimer = 0
let growTimer = 0, shrinkTimer = 0, glassTimer = 0, bombTimer = 0
let paddleUpTimer = 0, paddleDownTimer = 0
let savedPaddleW = PADDLE_W_DEF
let glassBrickIds = []
let initialBrickCount = 0, aliveBrickCount = 0
let musicIntensity = 0
let dropLog = []
let bricks = [], particles = [], trails = [], drops = [], balls = [], bombs = []
let charging = false, chTimer = 0, chParts = []
let laserSightTimer = 0
let spinTimer = 0, ghostTimer = 0
// Pressão do paddle contra as paredes laterais (0..1)
let wallNudgeLeft = 0, wallNudgeRight = 0
// Chacoalho das paredes (decai rápido após impacto)
let wallShakeLeft = 0, wallShakeRight = 0, wallShakeTop = 0
// Ângulo de inclinação das paredes laterais (radians, gera pelo eixo central)
let wallTiltLeft = 0, wallTiltRight = 0
let prevAtLeftWall = false, prevAtRightWall = false
