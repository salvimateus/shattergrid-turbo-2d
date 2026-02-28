// ═══ SCOREBOARD ═══
const SCORE_STORAGE_KEY = 'shattergrid_scores_v1'

function loadScores() {
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) { return [] }
}

function saveScore(pts) {
  const scores = loadScores()
  scores.push({ score: pts, date: Date.now() })
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
      h += `<div class="scoreboard-entry${hl}"><span class="sb-rank">${i + 1}.</span><span class="sb-score">${e.score}</span><span class="sb-date">${fmtDate(e.date)}</span></div>`
    })
    return h
  }
  container.innerHTML = `<div class="scoreboard-container"><div class="scoreboard-col">${renderCol('Últimos 10', last10)}</div><div class="scoreboard-col">${renderCol('Top 10', top10)}</div></div>`
}

renderScoreboard('start-scoreboard')

