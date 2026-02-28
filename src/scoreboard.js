// ═══ SCOREBOARD ═══
const SCORE_STORAGE_KEY = 'shattergrid_scores_v1'

function loadScores() {
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) { return [] }
}

function fmtTime(ms) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const mil = ms % 1000
  return `${m}:${String(s).padStart(2, '0')}.${String(mil).padStart(3, '0')}`
}

function fmtTimeShort(ms) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function saveScore(pts, timeMs, win) {
  const scores = loadScores()
  const entry = { score: pts, date: Date.now(), win: !!win }
  if (timeMs !== undefined) entry.time = timeMs
  scores.push(entry)
  if (scores.length > 100) scores.splice(0, scores.length - 100)
  try { localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores)) } catch (e) {}
}

function renderScoreboard(containerId, highlightScore) {
  const container = document.getElementById(containerId)
  if (!container) return
  const scores = loadScores()
  if (scores.length === 0) { container.innerHTML = ''; return }
  const last10 = scores.slice(-10).reverse()
  const top10 = [...scores].sort((a, b) => b.score - a.score).slice(0, 10)
  function fmtDate(ts) {
    const d = new Date(ts)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  function renderCol(title, list) {
    let h = `<div class="scoreboard-title">${title}</div>`
    list.forEach((e, i) => {
      const hl = (highlightScore !== undefined && e.score === highlightScore) ? ' highlight' : ''
      const icon = e.win ? '<span class="sb-result sb-win">🏆</span>' : '<span class="sb-result sb-over">💀</span>'
      const timeStr = e.time !== undefined ? `<span class="sb-time">⏱ ${fmtTime(e.time)}</span>` : ''
      h += `<div class="scoreboard-entry${hl}">${icon}<span class="sb-rank">${i + 1}.</span><span class="sb-score">${e.score}</span>${timeStr}<span class="sb-date">${fmtDate(e.date)}</span></div>`
    })
    return h
  }
  container.innerHTML = `<div class="scoreboard-container"><div class="scoreboard-col">${renderCol('Últimos 10', last10)}</div><div class="scoreboard-col">${renderCol('Top 10', top10)}</div></div>`
}

renderScoreboard('start-scoreboard')
