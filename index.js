/**
 * Host half of the serial monitor.
 *
 * Enumerates Windows COM ports and streams bytes from one selected port, and
 * writes command lines back through the same open handle (the PowerShell child
 * reads base64 lines from stdin and writes them to the port).
 * Reading is delegated to Windows PowerShell's System.IO.Ports.SerialPort so
 * the plugin needs no native Node addon; the browser half polls the JSON
 * routes registered on the Harness web server.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const inject = ['webServer']

const ROUTE_PREFIX = '/serial-monitor'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const PID_DEFAULT_NAMES = ['angle_pid', 'gyro_pid', 'speed_pid', 'yaw_angle_pid', 'turn_pid']
const MAX_BUFFER_BYTES = 2 * 1024 * 1024
const MAX_CHUNKS = 8192
const POLL_CHUNK_LIMIT = 400
const POLL_BYTE_LIMIT = 512 * 1024
const OPEN_TIMEOUT_MS = 8000
const PORTS_TTL_MS = 3000
const PARITIES = ['None', 'Odd', 'Even', 'Mark', 'Space']
const STOP_BITS = ['One', 'OnePointFive', 'Two']
const WRITE_SETTLE_MS = 80
const CLOSE_GRACE_MS = 400

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let cachedShell

function shellExecutable() {
  if (cachedShell) return cachedShell
  const root = process.env.SystemRoot || 'C:\\Windows'
  const candidate = join(root, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  cachedShell = existsSync(candidate) ? candidate : 'powershell.exe'
  return cachedShell
}

function encodeCommand(script) {
  return Buffer.from(script, 'utf16le').toString('base64')
}

function decodeSource(buffer) {
  try {
    return new TextDecoder('gb18030').decode(buffer)
  } catch {
    return new TextDecoder('utf-8').decode(buffer)
  }
}

function parsePidDefaults(text) {
  const found = PID_DEFAULT_NAMES.map(() => null)
  const regex = /pid_init\s*\(\s*&?\s*(\w+)\s*,\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([^,]+?)\s*,/g
  let match
  while ((match = regex.exec(text))) {
    const index = PID_DEFAULT_NAMES.indexOf(match[1])
    if (index < 0) continue
    const gains = [match[2], match[3], match[4]].map((raw) => Number(String(raw).replace(/[fFuUlL]+\s*$/, '').trim()))
    if (gains.every(Number.isFinite)) found[index] = gains
  }
  return found.every(Boolean) ? found : null
}

function parsePidLimits(text) {
  const marker = text.indexOf('pid_limit[')
  if (marker < 0) return null
  const open = text.indexOf('{', marker)
  const close = text.indexOf('};', open)
  if (open < 0 || close < 0) return null
  const block = text.slice(open + 1, close)
  const rows = []
  const rowRegex = /\{([^{}]*)\}/g
  let match
  while ((match = rowRegex.exec(block))) {
    const parts = match[1].split(',').map((part) => part.trim())
    if (parts.length !== 6) continue
    const values = parts.map((part) => Number(part.replace(/[fF]\s*$/, '')))
    if (values.every(Number.isFinite)) rows.push(values)
  }
  return rows.length ? rows : null
}

function parseChannels(text) {
  const match = String(text || '').match(/sprintf\s*\(\s*line\s*,\s*"[^"]*"\s*,([\s\S]*?)\)\s*;/)
  if (!match) return null
  const channels = match[1]
    .split(',')
    .map((part) => part.replace(/\/\/[^\n]*/g, '').replace(/\s+/g, ''))
    .filter(Boolean)
  if (channels.length < 2 || channels.length > 64) return null
  return channels.every((name) => /^[A-Za-z_]\w*$/.test(name)) ? channels : null
}

function firmwareCandidates() {
  const project = join('Seekfree_TC264_Opensource_Library', 'code', 'balance.c')
  return [
    resolve(PLUGIN_DIR, '..', '..', project),
    resolve(process.cwd(), project),
    resolve(PLUGIN_DIR, '..', '..', 'code', 'balance.c'),
  ]
}

async function readFirmware() {
  for (const file of firmwareCandidates()) {
    try {
      if (!existsSync(file)) continue
      const source = decodeSource(await readFile(file))
      const defaults = parsePidDefaults(source)
      if (!defaults) continue
      let limits = null
      let channels = null
      const vofaFile = join(dirname(file), 'vofa.c')
      if (existsSync(vofaFile)) {
        const vofaSource = decodeSource(await readFile(vofaFile))
        limits = parsePidLimits(vofaSource)
        channels = parseChannels(vofaSource)
      }
      return { found: true, file, defaults, limits, channels }
    } catch { /* try the next candidate */ }
  }
  return { found: false, error: '未找到工程里的 balance.c' }
}

function runShell(script, timeoutMs) {
  return new Promise((resolve) => {
    let proc
    try {
      proc = spawn(
        shellExecutable(),
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodeCommand(script)],
        { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
      )
    } catch (error) {
      resolve({ code: null, stdout: '', stderr: String((error && error.message) || error) })
      return
    }
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }
    const timer = setTimeout(() => {
      try { proc.kill() } catch { /* already gone */ }
      finish({ code: null, stdout, stderr: stderr + ' (timeout)' })
    }, timeoutMs)
    proc.stdout.setEncoding('utf8')
    proc.stdout.on('data', (data) => { stdout += data })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', (data) => { stderr += data })
    proc.on('error', (error) => finish({ code: null, stdout, stderr: String((error && error.message) || error) }))
    proc.on('close', (code) => finish({ code, stdout, stderr }))
  })
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const parts = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 64 * 1024) {
        reject(new Error('请求体过大'))
        req.destroy()
        return
      }
      parts.push(chunk)
    })
    req.on('end', () => {
      if (!parts.length) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(parts).toString('utf8')))
      } catch {
        reject(new Error('请求体不是有效 JSON'))
      }
    })
    req.on('error', reject)
  })
}

function positiveInt(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.floor(n) : fallback
}

function normalizePort(value) {
  if (typeof value !== 'string') return ''
  const port = value.trim().toUpperCase()
  return /^COM\d{1,3}$/.test(port) ? port : ''
}

function memberOf(list, value, fallback) {
  return list.includes(value) ? value : fallback
}

function buildSerialScript(options) {
  const lines = [
    "$ErrorActionPreference = 'Stop'",
    '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)',
    'try {',
    '  $sp = New-Object System.IO.Ports.SerialPort',
    `  $sp.PortName = '${options.port}'`,
    `  $sp.BaudRate = ${options.baudRate}`,
    `  $sp.DataBits = ${options.dataBits}`,
    `  $sp.Parity = [System.IO.Ports.Parity]::${options.parity}`,
    `  $sp.StopBits = [System.IO.Ports.StopBits]::${options.stopBits}`,
    '  $sp.Handshake = [System.IO.Ports.Handshake]::None',
    '  $sp.ReadTimeout = 60',
    '  $sp.Open()',
    "  [Console]::Out.WriteLine('@open')",
    '  [Console]::Out.Flush()',
    '  $buf = New-Object byte[] 8192',
    '  $stdin = [Console]::OpenStandardInput()',
    '  $inBuf = New-Object byte[] 1024',
    '  $inTask = $stdin.ReadAsync($inBuf, 0, $inBuf.Length)',
    "  $inText = ''",
    '  while ($true) {',
    '    try {',
    '      $n = $sp.Read($buf, 0, $buf.Length)',
    '      if ($n -gt 0) {',
    "        [Console]::Out.WriteLine('@data ' + [Convert]::ToBase64String($buf, 0, $n))",
    '        [Console]::Out.Flush()',
    '      }',
    '    } catch [System.TimeoutException] { }',
    '    if ($inTask.IsCompleted) {',
    '      $count = $inTask.Result',
    '      if ($count -le 0) { break }',
    '      $inText += [System.Text.Encoding]::ASCII.GetString($inBuf, 0, $count)',
    '      while (($pos = $inText.IndexOf([char]10)) -ge 0) {',
    '        $line = $inText.Substring(0, $pos).Trim()',
    '        $inText = $inText.Substring($pos + 1)',
    '        if ($line.Length -gt 0) {',
    '          try {',
    '            $bytes = [Convert]::FromBase64String($line)',
    '            $sp.Write($bytes, 0, $bytes.Length)',
    '          } catch { }',
    '        }',
    '      }',
    '      $inTask = $stdin.ReadAsync($inBuf, 0, $inBuf.Length)',
    '    }',
    '  }',
    '} catch {',
    '  $msg = $_.Exception.Message',
    '  $msg = $msg.Replace([string][char]13, " ").Replace([string][char]10, " ")',
    "  [Console]::Out.WriteLine('@error ' + $msg)",
    '  [Console]::Out.Flush()',
    '  exit 1',
    '} finally {',
    '  if ($null -ne $sp) { try { $sp.Close() } catch { } }',
    '}',
  ]
  return lines.join('\n')
}

function buildPortsScript() {
  return [
    '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)',
    '$names = @([System.IO.Ports.SerialPort]::GetPortNames())',
    '[Console]::Out.Write((ConvertTo-Json -InputObject $names -Compress))',
  ].join('\n')
}

export function apply(ctx) {
  const isWindows = process.platform === 'win32'

  let child = null
  let generation = 0
  let state = { state: 'idle', port: '', baudRate: 0, error: '', openedAt: 0 }
  let chunks = []
  let nextSeq = 1
  let bufferedBytes = 0
  let totalBytes = 0
  let stderrTail = ''
  let stdoutCarry = ''
  let openSettle = null
  let openTimer = null
  let portsCache = { at: 0, ports: [] }

  function snapshot() {
    return {
      supported: isWindows,
      platform: process.platform,
      status: {
        state: state.state,
        port: state.port,
        baudRate: state.baudRate,
        error: state.error,
        openedAt: state.openedAt,
      },
      bytes: totalBytes,
      cursor: nextSeq - 1,
    }
  }

  function resetBuffers() {
    chunks = []
    nextSeq = 1
    bufferedBytes = 0
    totalBytes = 0
  }

  function finishOpen() {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = null
    }
    const settle = openSettle
    openSettle = null
    if (settle) settle(snapshot())
  }

  async function stopChildGracefully() {
    generation += 1
    const proc = child
    child = null
    stdoutCarry = ''
    if (proc) {
      // Close stdin first: the child drains queued command lines, closes the
      // port and exits on its own. Kill only when that takes too long.
      try {
        if (proc.stdin && !proc.stdin.destroyed) proc.stdin.end()
      } catch { /* stdin already gone */ }
      if (proc.exitCode === null && proc.signalCode === null) {
        await Promise.race([
          new Promise((resolve) => { proc.once('exit', resolve) }),
          delay(CLOSE_GRACE_MS),
        ])
      }
      if (proc.exitCode === null && proc.signalCode === null) {
        try { proc.kill() } catch { /* already gone */ }
      }
    }
    finishOpen()
  }

  function pushData(base64) {
    const pad = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
    const size = Math.floor((base64.length / 4) * 3) - pad
    chunks.push({ seq: nextSeq++, at: Date.now(), b64: base64, size })
    bufferedBytes += size
    totalBytes += size
    while (chunks.length > MAX_CHUNKS || (bufferedBytes > MAX_BUFFER_BYTES && chunks.length > 1)) {
      const dropped = chunks.shift()
      bufferedBytes -= dropped.size
    }
  }

  function onLine(line) {
    if (line.startsWith('@open')) {
      state = { state: 'open', port: state.port, baudRate: state.baudRate, error: '', openedAt: Date.now() }
      finishOpen()
      return
    }
    if (line.startsWith('@data ')) {
      pushData(line.slice(6).trim())
      return
    }
    if (line.startsWith('@error ')) {
      state = { ...state, state: 'error', error: line.slice(7).trim() || '串口读取失败' }
      finishOpen()
      return
    }
    if (line.trim()) stderrTail = (stderrTail + line + '\n').slice(-4000)
  }

  function consumeStdout(myGeneration, text) {
    if (myGeneration !== generation) return
    stdoutCarry += text
    let index = stdoutCarry.indexOf('\n')
    while (index >= 0) {
      let line = stdoutCarry.slice(0, index)
      stdoutCarry = stdoutCarry.slice(index + 1)
      if (line.endsWith('\r')) line = line.slice(0, -1)
      if (line) onLine(line)
      index = stdoutCarry.indexOf('\n')
    }
    if (stdoutCarry.length > 512 * 1024) stdoutCarry = ''
  }

  async function openSerial(input) {
    if (!isWindows) {
      return { ...snapshot(), error: '当前系统不支持串口读取（仅支持 Windows）' }
    }
    if (state.state === 'connecting' || state.state === 'open') {
      return snapshot()
    }
    const port = normalizePort(input.port)
    if (!port) return { ...snapshot(), error: '无效的串口名称' }
    let baudRate = positiveInt(input.baudRate, 115200)
    if (baudRate < 50 || baudRate > 4000000) baudRate = 115200
    const dataBits = [5, 6, 7, 8].includes(positiveInt(input.dataBits, 8)) ? positiveInt(input.dataBits, 8) : 8
    const parity = memberOf(PARITIES, input.parity, 'None')
    const stopBits = memberOf(STOP_BITS, input.stopBits, 'One')

    // Mark connecting before the graceful stop: a second open request that
    // arrives during the stop must see us and back off, not spawn a child.
    state = { state: 'connecting', port, baudRate, error: '', openedAt: 0 }
    await stopChildGracefully()
    generation += 1
    const myGeneration = generation
    resetBuffers()
    stdoutCarry = ''
    stderrTail = ''

    const script = buildSerialScript({ port, baudRate, dataBits, parity, stopBits })
    let proc
    try {
      proc = spawn(
        shellExecutable(),
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodeCommand(script)],
        { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] },
      )
    } catch (error) {
      state = { ...state, state: 'error', error: '无法启动串口进程：' + String((error && error.message) || error) }
      return snapshot()
    }
    child = proc
    if (proc.stdin) proc.stdin.on('error', () => { /* child exited; exit handler reports it */ })
    proc.stdout.setEncoding('utf8')
    proc.stdout.on('data', (data) => consumeStdout(myGeneration, data))
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', (data) => {
      if (myGeneration !== generation) return
      stderrTail = (stderrTail + data).slice(-4000)
    })
    proc.on('error', (error) => {
      if (myGeneration !== generation) return
      state = { ...state, state: 'error', error: '无法启动 PowerShell：' + String((error && error.message) || error) }
      finishOpen()
    })
    proc.on('exit', () => {
      if (myGeneration !== generation) return
      child = null
      if (state.state === 'open' || state.state === 'connecting') {
        const detail = stderrTail.trim()
        state = {
          ...state,
          state: 'error',
          error: (state.state === 'open' ? '串口连接已断开' : '无法打开串口') + (detail ? '：' + detail : ''),
        }
      }
      finishOpen()
    })

    return await new Promise((resolve) => {
      openSettle = resolve
      openTimer = setTimeout(() => {
        openTimer = null
        if (state.state === 'connecting') {
          state = { ...state, state: 'error', error: '打开串口超时（设备未响应）' }
          stopChildGracefully().catch(() => {})
        } else {
          finishOpen()
        }
      }, OPEN_TIMEOUT_MS)
    })
  }

  function poll(cursorValue) {
    const base = snapshot()
    if (cursorValue === null) {
      return { ...base, chunks: [], cursor: base.cursor, reset: false }
    }
    let cursor = Number(cursorValue)
    if (!Number.isFinite(cursor) || cursor < 0) cursor = 0
    if (cursor > base.cursor) cursor = base.cursor

    const firstSeq = chunks.length ? chunks[0].seq : nextSeq
    let reset = false
    if (chunks.length && cursor < firstSeq - 1) {
      reset = true
      cursor = firstSeq - 1
    }

    const out = []
    let outBytes = 0
    for (const chunk of chunks) {
      if (chunk.seq <= cursor) continue
      if (out.length >= POLL_CHUNK_LIMIT || outBytes + chunk.size > POLL_BYTE_LIMIT) break
      out.push({ seq: chunk.seq, at: chunk.at, b64: chunk.b64 })
      outBytes += chunk.size
      cursor = chunk.seq
    }
    return { ...base, chunks: out, cursor, reset }
  }

  async function listPorts(force) {
    if (!isWindows) return []
    const now = Date.now()
    if (!force && now - portsCache.at < PORTS_TTL_MS) return portsCache.ports
    const result = await runShell(buildPortsScript(), 6000)
    let ports = []
    const raw = result.stdout.trim()
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) ports = parsed.filter((item) => typeof item === 'string')
        else if (typeof parsed === 'string') ports = [parsed]
      } catch {
        ports = portsCache.ports
      }
    }
    ports = ports.filter((name) => /^COM\d+$/i.test(name)).map((name) => name.toUpperCase())
    portsCache = { at: Date.now(), ports }
    return ports
  }

  async function handle(req, res) {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    if (url.pathname !== ROUTE_PREFIX && !url.pathname.startsWith(ROUTE_PREFIX + '/')) {
      sendJson(res, 404, { error: 'not found' })
      return
    }
    const name = url.pathname.slice(ROUTE_PREFIX.length).replace(/^\/+/, '')
    try {
      if (req.method === 'GET' && name === 'ports') {
        sendJson(res, 200, { supported: isWindows, ports: await listPorts(url.searchParams.get('force') === '1') })
        return
      }
      if (req.method === 'GET' && name === 'firmware') {
        sendJson(res, 200, await readFirmware())
        return
      }
      if (req.method === 'GET' && name === 'state') {
        sendJson(res, 200, snapshot())
        return
      }
      if (req.method === 'GET' && name === 'poll') {
        const cursor = url.searchParams.has('cursor') ? Number(url.searchParams.get('cursor')) : null
        sendJson(res, 200, poll(cursor))
        return
      }
      if (req.method === 'POST' && name === 'open') {
        const body = await readBody(req)
        sendJson(res, 200, await openSerial(body || {}))
        return
      }
      if (req.method === 'POST' && name === 'close') {
        await stopChildGracefully()
        state = { state: 'idle', port: state.port, baudRate: state.baudRate, error: '', openedAt: 0 }
        sendJson(res, 200, snapshot())
        return
      }
      if (req.method === 'POST' && name === 'write') {
        const body = await readBody(req)
        const text = typeof body.text === 'string' ? body.text.trim() : ''
        if (!text) {
          sendJson(res, 400, { error: '命令不能为空' })
          return
        }
        if (text.length > 120 || !/^[\x20-\x7e]+$/.test(text)) {
          sendJson(res, 400, { error: '命令只允许可打印 ASCII 字符，且不超过 120 个字符' })
          return
        }
        if (state.state !== 'open' || !child || !child.stdin || child.stdin.destroyed) {
          sendJson(res, 409, { error: '串口未打开，无法发送命令' })
          return
        }
        const line = text + '\r\n'
        try {
          child.stdin.write(Buffer.from(line, 'ascii').toString('base64') + '\n')
        } catch (error) {
          sendJson(res, 500, { error: '写入串口失败：' + String((error && error.message) || error) })
          return
        }
        // The child polls stdin between serial reads; give it time to hand the
        // line to the port before the caller may close the connection.
        await delay(WRITE_SETTLE_MS)
        sendJson(res, 200, { ok: true, bytes: line.length })
        return
      }
      sendJson(res, 404, { error: 'not found' })
    } catch (error) {
      sendJson(res, 400, { error: String((error && error.message) || error) })
    }
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: ROUTE_PREFIX, handler: handle }), 'serial-monitor routes')
  ctx.effect(() => () => {
    stopChildGracefully().catch(() => { /* already torn down */ })
  }, 'serial-monitor cleanup')
}