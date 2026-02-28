#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// Order matters: modules are concatenated in this sequence
const MODULE_ORDER = [
  'config.js',
  'state.js',
  'audio.js',
  'music.js',
  'renderer.js',
  'paddle.js',
  'ball.js',
  'bricks.js',
  'particles.js',
  'drops.js',
  'bombs.js',
  'scoreboard.js',
  'ui.js',
  'game.js',
]

const srcDir = path.join(__dirname, 'src')
const templatePath = path.join(__dirname, 'template.html')
const outputPath = path.join(__dirname, 'shattergrid_turbo_2d.html')

let gameCode = ''
for (const file of MODULE_ORDER) {
  const filePath = path.join(srcDir, file)
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Missing module: ${file}`)
    process.exit(1)
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  gameCode += `// ──── ${file} ────\n${content}\n\n`
  console.log(`  ✓ ${file} (${content.length} bytes)`)
}

let template = fs.readFileSync(templatePath, 'utf-8')
template = template.replace('/* __GAME_CODE__ */', gameCode)

fs.writeFileSync(outputPath, template, 'utf-8')
const sizeKB = (Buffer.byteLength(template, 'utf-8') / 1024).toFixed(1)
console.log(`\n✅ Build complete: ${outputPath}`)
console.log(`   Size: ${sizeKB} KB`)
console.log(`   Modules: ${MODULE_ORDER.length}`)
