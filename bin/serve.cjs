#!/usr/bin/env node
'use strict'

const http = require('http')
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')

const PORT = parseInt(process.env.PORT || '4173', 10)
const DIST_DIR = path.join(__dirname, '..', 'dist')

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
}

// Check dist/ exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('\n  ✗ dist/ folder not found.')
  console.error('  Run "npm run build" first, then "npx binance-price-alert-web"\n')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]

  try {
    urlPath = decodeURIComponent(urlPath)
  } catch {
    urlPath = '/'
  }

  const filePath = path.join(DIST_DIR, urlPath)

  function serveFile(fp) {
    const ext = path.extname(fp).toLowerCase()
    const contentType = MIME[ext] || 'application/octet-stream'

    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(500)
        res.end('Internal Server Error')
        return
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
      })
      res.end(data)
    })
  }

  function serveSPA() {
    serveFile(path.join(DIST_DIR, 'index.html'))
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat) {
      serveSPA()
      return
    }
    if (stat.isDirectory()) {
      const index = path.join(filePath, 'index.html')
      fs.access(index, fs.constants.F_OK, (e) => {
        if (e) serveSPA()
        else serveFile(index)
      })
    } else {
      serveFile(filePath)
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`
  console.log(`\n  ⚡ Binance Price Alert`)
  console.log(`  → ${url}\n`)
  openBrowser(url)
})

function openBrowser(url) {
  // Use execFile (not exec) to avoid shell injection — url is fully static
  try {
    if (process.platform === 'win32') {
      // On Windows, 'start' is a cmd built-in; use cmd.exe /c
      execFile('cmd.exe', ['/c', 'start', '', url], onOpenResult)
    } else if (process.platform === 'darwin') {
      execFile('open', [url], onOpenResult)
    } else {
      execFile('xdg-open', [url], onOpenResult)
    }
  } catch {
    // ignore — browser open is best-effort
  }
}

function onOpenResult(err) {
  if (err) {
    // silent — user can navigate manually
  }
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ✗ Port ${PORT} is already in use.`)
    console.error(`  Set a different port: PORT=4174 npx binance-price-alert-web\n`)
  } else {
    console.error('Server error:', err)
  }
  process.exit(1)
})
