window.__ModuleLoader__.load({
  id: '@local/serial-monitor',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]
    const DATA_BITS = [8, 7, 6, 5]
    const PARITY_VALUES = ['None', 'Odd', 'Even', 'Mark', 'Space']
    const STOP_VALUES = ['One', 'OnePointFive', 'Two']
    const MAX_DISPLAY_CHARS = 300000
    const POLL_DELAY_MS = 150
    const TELEMETRY_HISTORY = 240
    const MAX_CHANNELS = 64
    const PID_LIMITS = [
      { kp: [0, 50], ki: [0, 20], kd: [0, 10] },
      { kp: [0, 300], ki: [0, 20], kd: [0, 10] },
      { kp: [0, 5], ki: [0, 0.5], kd: [0, 1] },
      { kp: [0, 50], ki: [0, 20], kd: [0, 10] },
      { kp: [0, 50], ki: [0, 20], kd: [0, 10] },
    ]
    const PID_DEFAULTS = [
      { kp: 10, ki: 0, kd: 0 },
      { kp: 20, ki: 0, kd: 0 },
      { kp: 0.1, ki: 0.0004, kd: 0 },
      { kp: 2, ki: 0, kd: 0 },
      { kp: 8, ki: 2, kd: 0 },
    ]
    const TARGET_SPEED_LIMIT = 600
    const TARGET_YAW_ANGLE_LIMIT = 180
    const TARGET_YAW_RATE_LIMIT = 300
    const PID_LOOPS = ['pidLoopAngle', 'pidLoopGyro', 'pidLoopSpeed', 'pidLoopYawAngle', 'pidLoopTurn']
    const DEFAULT_CHANNEL_CODES = [
      'target_speed', 'speed', 'zero', 'angle_ref', 'pitch', 'rate_ref',
      'pitch_rate', 'bal', 'yaw_angle_ref', 'yaw_angle', 'yaw_ref', 'yaw_rate',
    ]
    const CODES_STORAGE_KEY = 'dsh.serial-monitor.codes.v1'
    const PID_STORAGE_KEY = 'dsh.serial-monitor.pid.v1'
    const NAMES_STORAGE_KEY = 'dsh.serial-monitor.names.v1'
    const CHARTS_STORAGE_KEY = 'dsh.serial-monitor.charts.v1'
    const DEFAULTS_STORAGE_KEY = 'dsh.serial-monitor.defaults.v1'
    const LIMITS_STORAGE_KEY = 'dsh.serial-monitor.limits.v1'
    const CUSTOM_STORAGE_KEY = 'dsh.serial-monitor.custom.v1'
    const MOTOR_LIMIT = 8000
    const MOTOR_AUTO_STOP_MS = 15000
    const ZERO_ARM_MS = 3000

    const EN = {
      title: 'Serial Monitor',
      port: 'Port',
      baud: 'Baud',
      openAction: 'Open',
      closeAction: 'Close',
      dataBits: 'Bits',
      parity: 'Parity',
      stopBits: 'Stop',
      encoding: 'Encoding',
      view: 'View',
      viewText: 'Text',
      viewHex: 'HEX',
      timestamps: 'Timestamps',
      autoscroll: 'Auto-scroll',
      refreshPorts: 'Refresh port list',
      clear: 'Clear',
      copy: 'Copy',
      copyFailed: 'Copy failed',
      copied: 'Copied to clipboard',
      closePanel: 'Close panel',
      statusIdle: 'Idle',
      statusConnecting: 'Opening…',
      statusConnected: 'Connected',
      statusError: 'Error',
      noPorts: 'No serial port found',
      emptyTitle: 'Read serial data',
      emptyHint: 'Pick a port and baud rate, then press Open.',
      emptyHint2: 'A port held by another program will fail to open; you can retry here after closing it.',
      unsupportedPlatform: 'Serial reading is available on Windows only.',
      bridgeDown: 'Serial service unavailable: the Host half of the plugin is not active on this page.',
      resumeNotice: 'Monitoring resumed (output from the closed period was skipped)',
      gapNotice: 'Some older output was dropped by the Host buffer',
      trimmed: '… (older output trimmed)',
      connected: 'Connected',
      closedNotice: 'Serial port closed',
      openFailed: 'Could not open the serial port',
      bytesReceived: 'received',
      parityNone: 'None',
      parityOdd: 'Odd',
      parityEven: 'Even',
      parityMark: 'Mark',
      paritySpace: 'Space',
      stopOne: '1',
      stopOneHalf: '1.5',
      stopTwo: '2',
      toggleHint: 'Open the serial monitor',
      tabData: 'Data',
      tabTune: 'Tune',
      tuneTitle: 'Online tuning',
      tuneHint: 'Any comma-separated numeric line; click a channel name to rename.',
      tuneDisconnected: 'Open the serial port to send tuning commands.',
      tuneWaiting: 'Waiting for CSV telemetry…',
      tuneChannels: 'Live telemetry',
      channelRename: 'Rename channel',
      chartPick: 'Pick channels',
      chartPitch: 'Pitch',
      chartRate: 'Rate',
      chartSpeed: 'Speed',
      chartYaw: 'Yaw rate',
      chPitch: 'Pitch',
      chRate: 'Rate',
      chRateRef: 'Rate ref',
      chBal: 'Balance',
      chAngleRef: 'Angle ref',
      chSpeed: 'Speed',
      chZero: 'Zero',
      chTargetSpeed: 'Speed tgt',
      chYawRate: 'Yaw rate',
      chYawRef: 'Yaw tgt',
      pidTitle: 'PID gains',
      pidHint: 'Values are clamped to the firmware safety range.',
      pidLoopAngle: 'Angle loop',
      pidLoopGyro: 'Gyro loop',
      pidLoopSpeed: 'Speed loop',
      pidLoopYawAngle: 'Yaw angle loop',
      pidLoopTurn: 'Yaw rate loop',
      pidSend: 'Send',
      pidSendAll: 'Send all',
      pidDefaults: 'Defaults',
      pidInvalid: 'Invalid gain value',
      pidClamped: 'clamped',
      defaultTitle: 'PID defaults',
      defaultEdit: 'Edit defaults',
      defaultHide: 'Hide defaults',
      defaultHint: 'The Defaults button uses these; align them with the firmware source or edit by hand.',
      defaultApply: 'Apply to gains',
      defaultBuiltin: 'Built-in',
      defaultAlign: 'Align with firmware',
      defaultImport: 'Import balance.c',
      defaultImported: 'Defaults imported',
      defaultParseFailed: 'No pid_init() for the five loops found',
      firmwareAligned: 'Aligned with',
      firmwareNotFound: 'Project balance.c not found — import it manually',
      limitsAligned: 'limits synced',
      alignChannels: 'Align channels',
      channelsAligned: 'Channels aligned',
      channelsUnchanged: 'Channels already aligned',
      channelsParseFailed: 'No channel list found in vofa.c',
      customTitle: 'Custom command',
      customPlaceholder: 'e.g. 5,0,0,0',
      customSend: 'Send',
      customHint: 'Sent as one line; @ is added automatically if missing (the firmware ignores commands without it).',
      customEmpty: 'Command is empty',
      customMotorBlocked: 'For motor tests use the guarded section above.',
      targetTitle: 'Speed & heading target',
      targetSpeed: 'Speed target',
      targetYawAngle: 'Target heading',
      targetYawRate: 'Target yaw rate',
      targetOuter: 'Yaw angle outer loop',
      targetSpeedUnit: 'cnt/20ms',
      targetYawAngleUnit: '°',
      targetYawRateUnit: '°/s',
      targetSend: 'Set target',
      targetZero: 'Zero target',
      targetHint: 'Speed ±600; heading ±180° with the outer loop on, otherwise yaw rate ±300 °/s.',
      targetMotion: 'Targets drive the car while balancing — keep it controlled.',
      targetAutoZero: 'targets reset when the panel closes',
      targetClamped: 'clamped to the safe range',
      motorTitle: 'Motor test (open loop)',
      motorWarn: 'Bypasses the balance loop — lift the wheels and keep it brief.',
      motorArmed: 'Wheels are off the ground',
      motorLeft: 'Left',
      motorRight: 'Right',
      motorStart: 'Start',
      motorStop: 'Stop',
      motorAutoStop: 'Auto-stops after 15 s',
      motorRange: '-8000…8000 (0…80 %)',
      motorLost: 'Connection lost while the motor test may still run. Power off, or reconnect and press Stop.',
      motorAutoStopped: 'Motor test stopped automatically',
      zeroTitle: 'Mechanical zero',
      zeroCurrent: 'Current zero',
      zeroTarget: 'New zero',
      zeroUsePitch: 'Use pitch',
      zeroSave: 'Lock & save',
      zeroUnlock: 'Unlock',
      zeroConfirm: 'Click again to confirm',
      zeroHint: 'Hold the car upright, then save the balance point. It is stored in Flash when the car is stopped.',
      zeroInvalid: 'Zero must be a number between -45 and 45',
      cmdTitle: 'Command log',
      cmdEmpty: 'No command has been sent yet.',
      notConnected: 'Serial port is not open',
      safetyStop: 'safety stop on connect',
    }

    const ZH = {
      title: '串口监视器',
      port: '串口',
      baud: '波特率',
      openAction: '打开',
      closeAction: '关闭',
      dataBits: '数据位',
      parity: '校验',
      stopBits: '停止位',
      encoding: '编码',
      view: '显示',
      viewText: '文本',
      viewHex: 'HEX',
      timestamps: '时间戳',
      autoscroll: '自动滚动',
      refreshPorts: '刷新串口列表',
      clear: '清空',
      copy: '复制',
      copyFailed: '复制失败',
      copied: '已复制到剪贴板',
      closePanel: '关闭面板',
      statusIdle: '未连接',
      statusConnecting: '正在打开…',
      statusConnected: '已连接',
      statusError: '出错',
      noPorts: '未发现串口',
      emptyTitle: '读取串口数据',
      emptyHint: '选择串口与波特率，点击「打开」开始接收数据。',
      emptyHint2: '端口被其他程序占用时会提示打开失败；关闭占用后可在本面板重试。',
      unsupportedPlatform: '当前系统不支持串口读取（仅支持 Windows）。',
      bridgeDown: '串口服务不可用：插件 Host 端未激活，或当前页面未连接。',
      resumeNotice: '已恢复监视（关闭期间的数据已跳过）',
      gapNotice: '部分较早数据已被 Host 缓冲区丢弃',
      trimmed: '…（较早数据已省略）',
      connected: '已连接',
      closedNotice: '串口已关闭',
      openFailed: '打开串口失败',
      bytesReceived: '已接收',
      parityNone: '无',
      parityOdd: '奇',
      parityEven: '偶',
      parityMark: '标记',
      paritySpace: '空格',
      stopOne: '1',
      stopOneHalf: '1.5',
      stopTwo: '2',
      toggleHint: '打开串口监视器',
      tabData: '数据',
      tabTune: '调参',
      tuneTitle: '在线调参',
      tuneHint: '任意逗号分隔的数值行；点击通道名可重命名。',
      tuneDisconnected: '先连接串口，才能下发调参命令。',
      tuneWaiting: '等待 CSV 波形数据…',
      tuneChannels: '实时信号',
      channelRename: '重命名通道',
      chartPick: '选择图表通道',
      chartPitch: '倾角',
      chartRate: '角速度',
      chartSpeed: '车速',
      chartYaw: '转向角速度',
      chPitch: '倾角',
      chRate: '角速度',
      chRateRef: '角速度目标',
      chBal: '平衡量',
      chAngleRef: '倾角修正',
      chSpeed: '车速',
      chZero: '零位',
      chTargetSpeed: '目标速度',
      chYawRate: '转向角速度',
      chYawRef: '转向目标',
      pidTitle: 'PID 参数',
      pidHint: '下发前会按固件安全范围限幅。',
      pidLoopAngle: '直立外环 · 角度',
      pidLoopGyro: '直立内环 · 角速度',
      pidLoopSpeed: '速度环',
      pidLoopYawAngle: '航向外环 · 角度',
      pidLoopTurn: '转向环 · yaw 角速度',
      pidSend: '下发',
      pidSendAll: '全部下发',
      pidDefaults: '恢复默认',
      pidInvalid: '参数值无效',
      pidClamped: '已限幅',
      defaultTitle: 'PID 默认值',
      defaultEdit: '编辑默认值',
      defaultHide: '收起默认值',
      defaultHint: '「默认」按钮使用这组值；可与工程源码对齐或手动修改。',
      defaultApply: '应用到当前参数',
      defaultBuiltin: '内置默认',
      defaultAlign: '从工程文件对齐',
      defaultImport: '导入 balance.c',
      defaultImported: '已导入默认值',
      defaultParseFailed: '没有识别到五个环的 pid_init()',
      firmwareAligned: '已与工程文件对齐：',
      firmwareNotFound: '未找到工程的 balance.c，请手动导入',
      limitsAligned: '限幅已同步',
      alignChannels: '对齐通道',
      channelsAligned: '通道已对齐',
      channelsUnchanged: '通道已经对齐',
      channelsParseFailed: '没有在 vofa.c 里识别到通道列表',
      customTitle: '自定义命令',
      customPlaceholder: '例如 5,0,0,0',
      customSend: '发送',
      customHint: '按一行原样写入串口；缺少 @ 会自动补上（固件只接受 @ 开头的命令）。',
      customEmpty: '命令不能为空',
      customMotorBlocked: '电机测试请使用上方的电机测试区。',
      targetTitle: '速度与航向目标',
      targetSpeed: '目标速度',
      targetYawAngle: '目标航向',
      targetYawRate: '目标转向角速度',
      targetOuter: '航向角外环',
      targetSpeedUnit: '计数/20ms',
      targetYawAngleUnit: '°',
      targetYawRateUnit: '°/s',
      targetSend: '下发目标',
      targetZero: '目标归零',
      targetHint: '速度 ±600；外环开时航向 ±180°，关时转向角速度 ±300°/s。',
      targetMotion: '目标会让车在平衡状态下实际运动，请确保场地可控。',
      targetAutoZero: '关闭面板时目标归零',
      targetClamped: '已限幅到安全范围',
      motorTitle: '电机测试（开环）',
      motorWarn: '会绕过平衡闭环，请架空车轮并短时使用。',
      motorArmed: '车轮已悬空',
      motorLeft: '左',
      motorRight: '右',
      motorStart: '开启',
      motorStop: '停止',
      motorAutoStop: '15 秒后自动停止',
      motorRange: '-8000…8000（0…80%）',
      motorLost: '连接已断开，电机测试可能仍在运行！请断电，或重新连接后点「停止」。',
      motorAutoStopped: '电机测试已自动停止',
      zeroTitle: '机械中值',
      zeroCurrent: '当前零位',
      zeroTarget: '目标零位',
      zeroUsePitch: '使用当前倾角',
      zeroSave: '锁定并保存',
      zeroUnlock: '解锁',
      zeroConfirm: '再点一次确认',
      zeroHint: '扶稳车身时保存平衡点；停车后写入 Flash，断电不丢。',
      zeroInvalid: '零位必须是 -45 到 45 之间的数字',
      cmdTitle: '命令记录',
      cmdEmpty: '尚未下发命令。',
      notConnected: '串口未打开',
      safetyStop: '连接后安全停止',
    }

    let translate = (key) => EN[key] || key
    let subscribeLocale = () => () => {}

    const panelStore = {
      open: false,
      listeners: new Set(),
      set(next) {
        if (this.open === next) return
        this.open = next
        for (const listener of Array.from(this.listeners)) {
          try { listener() } catch (error) { console.error('serial-monitor listener failed', error) }
        }
      },
      toggle() { this.set(!this.open) },
      subscribe(listener) {
        this.listeners.add(listener)
        return () => { this.listeners.delete(listener) }
      },
    }

    function usePanelOpen() {
      const [open, setOpen] = React.useState(panelStore.open)
      React.useEffect(() => panelStore.subscribe(() => setOpen(panelStore.open)), [])
      return open
    }

    function useTranslate() {
      const [, bump] = React.useState(0)
      React.useEffect(() => subscribeLocale(() => bump((value) => value + 1)), [])
      return translate
    }

    function base64ToBytes(base64) {
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
      return bytes
    }

    function pad(value, width) {
      return String(value).padStart(width, '0')
    }

    function formatTime(milliseconds) {
      const date = new Date(milliseconds || Date.now())
      return pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2) + ':' + pad(date.getSeconds(), 2) + '.' + pad(date.getMilliseconds(), 3)
    }

    function formatBytes(value) {
      if (!value) return '0 B'
      if (value < 1024) return value + ' B'
      if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB'
      return (value / (1024 * 1024)).toFixed(2) + ' MB'
    }

    function stripAnsi(line) {
      return line
        .replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '·')
    }

    function formatLine(line, at, withTime) {
      const clean = stripAnsi(line)
      return withTime ? formatTime(at) + '  ' + clean : clean
    }

    function hexRows(bytes, startOffset, at, withTime) {
      let out = ''
      const prefix = withTime ? formatTime(at) + '  ' : ''
      for (let offset = 0; offset < bytes.length; offset += 16) {
        const slice = bytes.subarray(offset, offset + 16)
        let hex = ''
        let ascii = ''
        for (let index = 0; index < 16; index += 1) {
          if (index < slice.length) {
            const byte = slice[index]
            hex += pad(byte.toString(16), 2).toUpperCase() + ' '
            ascii += byte >= 32 && byte < 127 ? String.fromCharCode(byte) : '.'
          } else {
            hex += '   '
            ascii += ' '
          }
        }
        out += prefix + pad((startOffset + offset).toString(16), 8).toUpperCase() + '  ' + hex + ' |' + ascii + '|\n'
      }
      return out
    }

    async function getJson(path) {
      const response = await fetch(path, { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status))
      return data
    }

    async function postJson(path, body) {
      const response = await fetch(path, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body || {}),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status))
      return data
    }

    function loadStoredPids() {
      try {
        const raw = window.localStorage.getItem(PID_STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed) || parsed.length !== PID_DEFAULTS.length) return null
        return parsed.map((entry, index) => {
          const fallback = PID_DEFAULTS[index]
          const read = (value, key) => {
            if (value === null || value === undefined || value === '') return String(fallback[key])
            const numeric = Number(value)
            return Number.isFinite(numeric) ? String(numeric) : String(fallback[key])
          }
          return {
            kp: read(entry && entry.kp, 'kp'),
            ki: read(entry && entry.ki, 'ki'),
            kd: read(entry && entry.kd, 'kd'),
          }
        })
      } catch {
        return null
      }
    }

    function defaultPidStrings() {
      return PID_DEFAULTS.map((entry) => ({ kp: String(entry.kp), ki: String(entry.ki), kd: String(entry.kd) }))
    }

    function readGainText(value) {
      if (value === null || value === undefined) return ''
      const numeric = Number(value)
      return Number.isFinite(numeric) ? String(numeric) : ''
    }

    function loadStoredDefaults() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(DEFAULTS_STORAGE_KEY) || 'null')
        if (!Array.isArray(parsed) || parsed.length !== PID_DEFAULTS.length) return null
        const result = parsed.map((entry) => {
          const kp = readGainText(entry && entry.kp)
          const ki = readGainText(entry && entry.ki)
          const kd = readGainText(entry && entry.kd)
          return kp !== '' && ki !== '' && kd !== '' ? { kp, ki, kd } : null
        })
        return result.every(Boolean) ? result : null
      } catch {
        return null
      }
    }

    function loadStoredLimits() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(LIMITS_STORAGE_KEY) || 'null')
        if (!Array.isArray(parsed) || parsed.length !== PID_LIMITS.length) return null
        const result = parsed.map((entry) => {
          if (!entry) return null
          const pair = (key) => {
            const value = entry[key]
            if (!Array.isArray(value) || value.length !== 2) return null
            if (!value.every((item) => typeof item === 'number' && Number.isFinite(item))) return null
            return [value[0], value[1]]
          }
          const kp = pair('kp')
          const ki = pair('ki')
          const kd = pair('kd')
          return kp && ki && kd ? { kp, ki, kd } : null
        })
        return result.every(Boolean) ? result : null
      } catch {
        return null
      }
    }

    function loadStoredNames() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(NAMES_STORAGE_KEY) || 'null')
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
        const result = {}
        for (const key of Object.keys(parsed)) {
          const index = Number(key)
          if (!Number.isInteger(index) || index < 0 || index >= MAX_CHANNELS) continue
          const value = typeof parsed[key] === 'string' ? parsed[key].trim().slice(0, 24) : ''
          if (value) result[index] = value
        }
        return result
      } catch {
        return {}
      }
    }

    function loadStoredCharts() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(CHARTS_STORAGE_KEY) || 'null')
        if (!Array.isArray(parsed) || parsed.length !== 4) return null
        const pick = (value) => (Number.isInteger(value) && value >= 0 && value < MAX_CHANNELS ? value : null)
        return parsed.map((entry) => ({ p: pick(entry && entry.p), c: pick(entry && entry.c) }))
      } catch {
        return null
      }
    }

    function loadStoredCustom() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(CUSTOM_STORAGE_KEY) || 'null')
        if (!Array.isArray(parsed)) return []
        return parsed
          .filter((line) => typeof line === 'string' && line.trim())
          .map((line) => line.trim().slice(0, 120))
          .slice(0, 8)
      } catch {
        return []
      }
    }

    function loadStoredCodes() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(CODES_STORAGE_KEY) || 'null')
        if (!Array.isArray(parsed) || parsed.length < 2) return null
        const codes = parsed.map((code) => String(code || '').trim()).filter(Boolean)
        return codes.length >= 2 ? codes.slice(0, MAX_CHANNELS) : null
      } catch {
        return null
      }
    }

    function seedCharts(codes, count) {
      const index = (code) => codes.indexOf(code)
      const pairs = [
        ['target_speed', 'speed'],
        ['pitch', 'angle_ref'],
        ['yaw_angle_ref', 'yaw_angle'],
        ['yaw_ref', 'yaw_rate'],
      ]
      const seeds = []
      for (const pair of pairs) {
        const primary = index(pair[0])
        const compare = index(pair[1])
        if (primary >= 0 && primary < count && compare >= 0 && compare < count) seeds.push({ p: primary, c: compare })
      }
      while (seeds.length < 4) seeds.push({ p: null, c: null })
      return seeds.slice(0, 4)
    }

    function parseBalanceDefaults(text) {
      const names = ['angle_pid', 'gyro_pid', 'speed_pid', 'yaw_angle_pid', 'turn_pid']
      const found = names.map(() => null)
      const regex = /pid_init\s*\(\s*&?\s*(\w+)\s*,\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([^,]+?)\s*,/g
      let match
      while ((match = regex.exec(String(text || '')))) {
        const index = names.indexOf(match[1])
        if (index < 0) continue
        const gains = [match[2], match[3], match[4]].map((raw) => Number(String(raw).replace(/[fFuUlL]+\s*$/, '').trim()))
        if (gains.every(Number.isFinite)) found[index] = gains
      }
      if (!found.every(Boolean)) return null
      return found.map((gains) => ({ kp: String(gains[0]), ki: String(gains[1]), kd: String(gains[2]) }))
    }

    function parseTelemetryLine(line) {
      if (!line) return null
      const parts = line.split(',')
      if (parts.length < 2 || parts.length > MAX_CHANNELS) return null
      const values = new Array(parts.length)
      for (let index = 0; index < parts.length; index += 1) {
        const piece = parts[index].trim()
        if (!piece) return null
        const value = Number(piece)
        if (!Number.isFinite(value)) return null
        values[index] = value
      }
      return values
    }

    function formatGain(value) {
      if (!Number.isFinite(value)) return '0'
      const fixed = value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
      return fixed === '' || fixed === '-' ? '0' : fixed
    }

    function clampGain(raw, min, max) {
      const text = String(raw === null || raw === undefined ? '' : raw).trim()
      if (!text) return null
      const value = Number(text)
      if (!Number.isFinite(value)) return null
      return Math.min(max, Math.max(min, value))
    }

    function sparkGeometry(samples, indices) {
      const series = indices.map(() => [])
      for (const sample of samples) {
        indices.forEach((index, position) => {
          const value = sample.values[index]
          if (Number.isFinite(value)) series[position].push(value)
        })
      }
      let min = null
      let max = null
      for (const values of series) {
        for (const value of values) {
          if (min === null || value < min) min = value
          if (max === null || value > max) max = value
        }
      }
      if (min === null) return null
      if (max - min < 1e-9) {
        min -= 1
        max += 1
      }
      const width = 100
      const height = 30
      const pad = 2
      const plots = series.map((values) => {
        if (values.length < 2) return null
        const points = values.map((value, position) => {
          const x = (position / (values.length - 1)) * width
          const y = pad + (1 - (value - min) / (max - min)) * (height - pad * 2)
          return x.toFixed(2) + ',' + y.toFixed(2)
        }).join(' ')
        return { points, current: values[values.length - 1] }
      })
      const currents = series.map((values) => (values.length ? values[values.length - 1] : null))
      return { plots, currents }
    }

    function SerialIcon(props) {
      const size = (props && props.size) || 18
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('rect', { x: 4, y: 5, width: 16, height: 9, rx: 2.5 }),
        h('path', { d: 'M7 5V2.8M12 5V2.8M17 5V2.8' }),
        h('path', { d: 'M7 18c1.6-2.2 3.2-2.2 5 0s3.4 2.2 5 0' }),
        h('path', { d: 'M4 9.5h-.8M20 9.5h.8' }),
      )
    }

    function RefreshIcon() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }),
        h('path', { d: 'M20 4v7h-7' }),
      )
    }

    function CopyIcon() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }),
        h('path', { d: 'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1' }),
      )
    }

    function CloseIcon() {
      return h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', 'aria-hidden': true },
        h('path', { d: 'M6 6l12 12M18 6L6 18' }),
      )
    }

    const CSS = `
.dsh-sm-panel{position:fixed;right:18px;bottom:18px;width:640px;height:520px;min-width:400px;min-height:300px;max-width:calc(100vw - 28px);max-height:calc(100vh - 28px);display:flex;flex-direction:column;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.32);overflow:hidden;resize:both;pointer-events:auto;z-index:40;font-size:13px;line-height:1.45}
.dsh-sm-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dsh-sm-title{font-weight:600;font-size:13px;white-space:nowrap}
.dsh-sm-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.dsh-sm-dot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);flex:none}
.dsh-sm-dot.is-open{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px rgba(34,197,94,.18)}
.dsh-sm-dot.is-error{background:var(--dsw-alias-state-error-primary)}
.dsh-sm-dot.is-connecting{background:var(--dsw-alias-state-warn-primary);animation:dsh-sm-pulse 1.1s ease-in-out infinite}
@keyframes dsh-sm-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.dsh-sm-spacer{flex:1;min-width:6px}
.dsh-sm-meta{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px}
.dsh-sm-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0}
.dsh-sm-iconbtn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-sm-iconbtn:disabled{opacity:.4;cursor:default}
.dsh-sm-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsh-sm-toolbar.options{gap:12px}
.dsh-sm-field{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.dsh-sm-select{height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:0 8px;outline:none;max-width:190px}
.dsh-sm-select:focus{border-color:var(--dsw-alias-brand-primary)}
.dsh-sm-select:disabled{opacity:.55}
.dsh-sm-btn{height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.dsh-sm-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-sm-btn.primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.dsh-sm-btn.danger{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.dsh-sm-btn.ghost{border-color:transparent;color:var(--dsw-alias-label-secondary);padding:0 8px}
.dsh-sm-btn.ghost:hover{color:var(--dsw-alias-label-primary)}
.dsh-sm-btn:disabled{opacity:.45;cursor:default}
.dsh-sm-check{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none;white-space:nowrap}
.dsh-sm-check input{accent-color:var(--dsw-alias-brand-primary);margin:0}
.dsh-sm-bar{display:flex;align-items:center;gap:8px;padding:6px 12px;font-size:12px}
.dsh-sm-bar.error{color:var(--dsw-alias-state-error-primary)}
.dsh-sm-bar.warn{color:var(--dsw-alias-state-warn-primary)}
.dsh-sm-log{flex:1;min-height:0;margin:8px 12px 0;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-base);overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;font-size:12px;line-height:1.55;white-space:pre;tab-size:4}
.dsh-sm-empty{display:flex;flex-direction:column;gap:6px;padding:14px 8px;color:var(--dsw-alias-label-secondary);white-space:normal;font-family:inherit}
.dsh-sm-empty strong{color:var(--dsw-alias-label-primary);font-weight:600;font-size:13px}
.dsh-sm-foot{display:flex;align-items:center;gap:8px;padding:7px 12px 9px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.dsh-sm-foot-btn{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer;text-align:left}
.dsh-sm-foot-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-sm-foot-btn.is-active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.dsh-sm-foot-btn.is-rail{width:32px;height:32px;padding:0;justify-content:center}
.dsh-sm-foot-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-sm-tabs{display:flex;align-items:center;gap:2px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dsh-sm-tab{height:32px;padding:0 12px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;margin-bottom:-1px}
.dsh-sm-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.dsh-sm-tab.is-active{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary);font-weight:600}
.dsh-sm-tune{flex:1;min-height:0;overflow:auto;padding:10px 12px 12px;display:flex;flex-direction:column;gap:9px}
.dsh-sm-sec{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1)}
.dsh-sm-sec-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;min-height:18px}
.dsh-sm-sec-title{font-size:12px;font-weight:600;white-space:nowrap}
.dsh-sm-sec-note{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-sm-sec-note.is-warn{color:var(--dsw-alias-state-warn-primary)}
.dsh-sm-sec-note.is-error{color:var(--dsw-alias-state-error-primary)}
.dsh-sm-tel{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.dsh-sm-tel-cell{display:flex;flex-direction:column;gap:0;padding:4px 7px;border-radius:7px;background:var(--dsw-alias-bg-layer-2);min-width:0}
.dsh-sm-tel-label{background:none;border:0;padding:0;font:inherit;font-size:10px;color:var(--dsw-alias-label-secondary);text-align:left;cursor:text;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.dsh-sm-tel-label:hover{color:var(--dsw-alias-brand-primary)}
.dsh-sm-name-input{width:100%;height:18px;border:1px solid var(--dsw-alias-brand-primary);border-radius:4px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:10px;padding:0 3px;outline:none}
.dsh-sm-tel-value{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap}
.dsh-sm-sparks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:7px}
.dsh-sm-spark-card{min-width:0}
.dsh-sm-chart-pick{display:flex;gap:4px;margin-bottom:2px}
.dsh-sm-chart-select{flex:1;min-width:0;height:20px;border:1px solid var(--dsw-alias-border-l1);border-radius:5px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:10px;padding:0 2px;outline:none}
.dsh-sm-chart-select:focus{border-color:var(--dsw-alias-brand-primary)}
.dsh-sm-spark-head{display:flex;align-items:baseline;justify-content:space-between;gap:6px;font-size:10px;color:var(--dsw-alias-label-secondary)}
.dsh-sm-spark-val{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--dsw-alias-label-primary)}
.dsh-sm-spark{display:block;width:100%;height:30px;margin-top:2px}
.dsh-sm-spark-legend{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--dsw-alias-label-secondary);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-sm-dot-mini{width:6px;height:6px;border-radius:50%;display:inline-block;flex:none}
.dsh-sm-def-grid{display:flex;flex-direction:column;gap:5px;margin-top:7px}
.dsh-sm-def-row{display:grid;grid-template-columns:104px repeat(3,minmax(0,1fr));gap:6px;align-items:center}
.dsh-sm-def-name{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-sm-file-btn{display:inline-flex;align-items:center;height:22px;padding:0 8px;font-size:11px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap}
.dsh-sm-file-btn:hover{border-color:var(--dsw-alias-border-l2)}
.dsh-sm-unit{font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.dsh-sm-pid-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.dsh-sm-pid{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 8px;background:var(--dsw-alias-bg-layer-2);min-width:0}
.dsh-sm-pid-head{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:5px}
.dsh-sm-pid-name{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-sm-pid-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
.dsh-sm-gain{display:flex;align-items:center;gap:4px;min-width:0}
.dsh-sm-gain>span{font-size:10px;color:var(--dsw-alias-label-secondary);flex:none}
.dsh-sm-num{width:100%;min-width:0;height:23px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;padding:0 4px;outline:none;font-variant-numeric:tabular-nums}
.dsh-sm-num:focus{border-color:var(--dsw-alias-brand-primary)}
.dsh-sm-num:disabled{opacity:.55}
.dsh-sm-mini{height:22px;padding:0 8px;font-size:11px;border-radius:6px}
.dsh-sm-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.dsh-sm-row+.dsh-sm-row{margin-top:6px}
.dsh-sm-cmdline{flex:1;min-width:0;height:24px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;padding:0 6px;outline:none}
.dsh-sm-cmdline:focus{border-color:var(--dsw-alias-brand-primary)}
.dsh-sm-chip{max-width:140px;height:20px;padding:0 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.dsh-sm-chip:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.dsh-sm-cmdlog{max-height:92px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:1.55;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-all}
.dsh-sm-cmdlog .is-err{color:var(--dsw-alias-state-error-primary)}
.dsh-sm-cmd-empty{font-size:11px;color:var(--dsw-alias-label-secondary)}
`

    function StyleTag() {
      return h('style', { dangerouslySetInnerHTML: { __html: CSS } })
    }

    function SerialToggle(props) {
      const t = useTranslate()
      const open = usePanelOpen()
      return h(React.Fragment, null,
        h(StyleTag),
        h('button', {
          type: 'button',
          className: 'dsh-sm-foot-btn is-rail' + (open ? ' is-active' : ''),
          title: open ? t('title') : t('toggleHint'),
          'aria-label': open ? t('title') : t('toggleHint'),
          'aria-pressed': open ? 'true' : 'false',
          onClick: () => panelStore.toggle(),
        },
          h(SerialIcon, { size: 18 }),
        ),
      )
    }

    function SerialPanel() {
      const t = useTranslate()
      const open = usePanelOpen()

      const [ports, setPorts] = React.useState([])
      const [port, setPort] = React.useState('')
      const [baud, setBaud] = React.useState(115200)
      const [dataBits, setDataBits] = React.useState(8)
      const [parity, setParity] = React.useState('None')
      const [stopBits, setStopBits] = React.useState('One')
      const [encoding, setEncoding] = React.useState('utf-8')
      const [viewMode, setViewMode] = React.useState('text')
      const [showTime, setShowTime] = React.useState(true)
      const [autoScroll, setAutoScroll] = React.useState(true)
      const [status, setStatus] = React.useState({ state: 'idle', port: '', baudRate: 0, error: '', openedAt: 0 })
      const [bridge, setBridge] = React.useState('unknown')
      const [supported, setSupported] = React.useState(true)
      const [busy, setBusy] = React.useState(false)
      const [text, setText] = React.useState('')
      const [bytes, setBytes] = React.useState(0)
      const [problem, setProblem] = React.useState('')
      const [tab, setTab] = React.useState('data')
      const [telemetry, setTelemetry] = React.useState(null)
      const [samples, setSamples] = React.useState([])
      const [channelNames, setChannelNames] = React.useState(() => loadStoredNames())
      const [channelCodes, setChannelCodes] = React.useState(() => loadStoredCodes() || DEFAULT_CHANNEL_CODES.slice())
      const [chartConfig, setChartConfig] = React.useState(() => loadStoredCharts())
      const [pidLimits, setPidLimits] = React.useState(() => loadStoredLimits() || PID_LIMITS)
      const [defaults, setDefaults] = React.useState(() => loadStoredDefaults() || defaultPidStrings())
      const [showDefaults, setShowDefaults] = React.useState(false)
      const [editingChannel, setEditingChannel] = React.useState(-1)
      const [nameDraft, setNameDraft] = React.useState('')
      const [pids, setPids] = React.useState(() => {
        const stored = loadStoredPids()
        if (stored) return stored
        const source = loadStoredDefaults() || defaultPidStrings()
        return source.map((entry) => ({ kp: entry.kp, ki: entry.ki, kd: entry.kd }))
      })
      const [sending, setSending] = React.useState(false)
      const [motorLeft, setMotorLeft] = React.useState('0')
      const [motorRight, setMotorRight] = React.useState('0')
      const [motorArmed, setMotorArmed] = React.useState(false)
      const [motorActive, setMotorActive] = React.useState(false)
      const [zeroInput, setZeroInput] = React.useState('')
      const [zeroArmed, setZeroArmed] = React.useState('')
      const [targetSpeed, setTargetSpeed] = React.useState('0')
      const [targetYaw, setTargetYaw] = React.useState('0')
      const [targetOuter, setTargetOuter] = React.useState(true)
      const [customLine, setCustomLine] = React.useState('')
      const [customHistory, setCustomHistory] = React.useState(() => loadStoredCustom())
      const [commandLog, setCommandLog] = React.useState([])

      const cursorRef = React.useRef(0)
      const decoderRef = React.useRef(null)
      const decoderTagRef = React.useRef('')
      const lineBufRef = React.useRef('')
      const hexOffRef = React.useRef(0)
      const settingsRef = React.useRef({ viewMode, encoding, showTime })
      const statusRef = React.useRef(status)
      const logRef = React.useRef(null)
      const telemetryDecoderRef = React.useRef(null)
      const telemetryBufRef = React.useRef('')
      const telemetryCountRef = React.useRef(0)
      const motorActiveRef = React.useRef(false)
      const motorTimerRef = React.useRef(null)
      const zeroArmTimerRef = React.useRef(null)
      const targetActiveRef = React.useRef(false)

      React.useEffect(() => {
        try { window.localStorage.setItem(PID_STORAGE_KEY, JSON.stringify(pids)) } catch { /* storage unavailable */ }
      }, [pids])

      React.useEffect(() => {
        try { window.localStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(channelNames)) } catch { /* storage unavailable */ }
      }, [channelNames])

      React.useEffect(() => {
        if (!chartConfig) return
        try { window.localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(chartConfig)) } catch { /* storage unavailable */ }
      }, [chartConfig])

      React.useEffect(() => {
        try { window.localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(defaults)) } catch { /* storage unavailable */ }
      }, [defaults])

      React.useEffect(() => {
        try { window.localStorage.setItem(LIMITS_STORAGE_KEY, JSON.stringify(pidLimits)) } catch { /* storage unavailable */ }
      }, [pidLimits])

      React.useEffect(() => {
        try { window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customHistory)) } catch { /* storage unavailable */ }
      }, [customHistory])

      React.useEffect(() => {
        try { window.localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(channelCodes)) } catch { /* storage unavailable */ }
      }, [channelCodes])

      React.useEffect(() => {
        if (chartConfig || !telemetry || !telemetry.count) return
        const count = telemetry.count
        const seeds = seedCharts(channelCodes, count)
        setChartConfig(seeds.some((entry) => entry.p !== null)
          ? seeds
          : [0, 1, 2, 3].map((index) => ({ p: index < count ? index : null, c: null })))
      }, [chartConfig, telemetry, channelCodes])

      React.useEffect(() => {
        settingsRef.current = { viewMode, encoding, showTime }
      }, [viewMode, encoding, showTime])

      React.useEffect(() => {
        statusRef.current = status
      }, [status])

      function trimDisplay(next) {
        if (next.length <= MAX_DISPLAY_CHARS) return next
        const cut = next.indexOf('\n', next.length - MAX_DISPLAY_CHARS)
        const prefix = t('trimmed') + '\n'
        return cut >= 0 ? prefix + next.slice(cut + 1) : prefix + next.slice(-MAX_DISPLAY_CHARS)
      }

      function appendNotice(message) {
        const stamped = (settingsRef.current.showTime ? formatTime(Date.now()) + '  ' : '') + '· ' + message
        setText((previous) => trimDisplay(previous + stamped + '\n'))
      }

      function applyStatus(next) {
        if (!next) return
        setStatus((previous) => (
          previous.state === next.state
          && previous.port === next.port
          && previous.baudRate === next.baudRate
          && previous.error === next.error
          && previous.openedAt === next.openedAt
            ? previous
            : next
        ))
      }

      function resetDecoder() {
        decoderRef.current = null
        decoderTagRef.current = ''
        lineBufRef.current = ''
        hexOffRef.current = 0
      }

      function appendChunks(list) {
        const settings = settingsRef.current
        let appended = ''
        if (settings.viewMode === 'hex') {
          for (const chunk of list) {
            const bytesIn = base64ToBytes(chunk.b64)
            const start = hexOffRef.current
            hexOffRef.current += bytesIn.length
            appended += hexRows(bytesIn, start, chunk.at, settings.showTime)
          }
        } else {
          if (!decoderRef.current || decoderTagRef.current !== settings.encoding) {
            let decoder
            try {
              decoder = new TextDecoder(settings.encoding, { fatal: false })
            } catch {
              decoder = new TextDecoder('utf-8')
            }
            decoderRef.current = decoder
            decoderTagRef.current = settings.encoding
            lineBufRef.current = ''
          }
          const decoder = decoderRef.current
          for (const chunk of list) {
            const bytesIn = base64ToBytes(chunk.b64)
            let part = ''
            try {
              part = decoder.decode(bytesIn, { stream: true })
            } catch {
              part = ''
            }
            lineBufRef.current += part
            if (lineBufRef.current.length > 16384) {
              appended += formatLine(lineBufRef.current, chunk.at, settings.showTime) + '\n'
              lineBufRef.current = ''
              continue
            }
            const lines = lineBufRef.current.split(/\r\n|\r|\n/)
            lineBufRef.current = lines.pop()
            for (const line of lines) appended += formatLine(line, chunk.at, settings.showTime) + '\n'
          }
        }
        if (appended) setText((previous) => trimDisplay(previous + appended))
      }

      function resetTelemetry() {
        telemetryDecoderRef.current = null
        telemetryBufRef.current = ''
        telemetryCountRef.current = 0
        setTelemetry(null)
        setSamples([])
      }

      function ingestTelemetry(list) {
        if (!Array.isArray(list) || !list.length) return
        if (!telemetryDecoderRef.current) {
          telemetryDecoderRef.current = new TextDecoder('utf-8', { fatal: false })
          telemetryBufRef.current = ''
        }
        const decoder = telemetryDecoderRef.current
        let incoming = ''
        for (const chunk of list) {
          try {
            incoming += decoder.decode(base64ToBytes(chunk.b64), { stream: true })
          } catch { /* ignore malformed chunk */ }
        }
        if (!incoming) return
        telemetryBufRef.current += incoming
        if (telemetryBufRef.current.length > 65536) telemetryBufRef.current = telemetryBufRef.current.slice(-8192)
        const pieces = telemetryBufRef.current.split(/\r\n|\r|\n/)
        telemetryBufRef.current = pieces.pop()
        const fresh = []
        for (const piece of pieces) {
          const values = parseTelemetryLine(piece)
          if (values) fresh.push({ values })
        }
        if (!fresh.length) return
        const latest = fresh[fresh.length - 1].values
        const previousCount = telemetryCountRef.current
        telemetryCountRef.current = latest.length
        setTelemetry({ at: Date.now(), values: latest, count: latest.length })
        setSamples((previous) => {
          const base = previousCount === latest.length ? previous : []
          const merged = base.concat(fresh)
          return merged.length > TELEMETRY_HISTORY ? merged.slice(merged.length - TELEMETRY_HISTORY) : merged
        })
      }

      function pushCommand(line, ok, message) {
        setCommandLog((previous) => [{ at: Date.now(), line, ok, message: message || '' }].concat(previous).slice(0, 12))
      }

      function encodeWire(line) {
        const text = String(line)
        return text.startsWith('@') ? text : '@' + text
      }

      async function sendCommand(line, message) {
        const wireLine = encodeWire(line)
        if (!statusRef.current || statusRef.current.state !== 'open') {
          setProblem(t('notConnected'))
          pushCommand(wireLine, false, t('notConnected'))
          return false
        }
        try {
          await postJson('/serial-monitor/write', { text: wireLine })
          setProblem('')
          pushCommand(wireLine, true, message || '')
          return true
        } catch (error) {
          const reason = String((error && error.message) || error)
          pushCommand(wireLine, false, reason)
          setProblem(reason)
          return false
        }
      }

      function clearMotorTimer() {
        if (motorTimerRef.current) {
          clearTimeout(motorTimerRef.current)
          motorTimerRef.current = null
        }
      }

      function clearZeroTimer() {
        if (zeroArmTimerRef.current) {
          clearTimeout(zeroArmTimerRef.current)
          zeroArmTimerRef.current = null
        }
      }

      function disarmZero() {
        clearZeroTimer()
        setZeroArmed('')
      }

      function buildPidLine(index) {
        const limits = pidLimits[index] || PID_LIMITS[index]
        const entry = pids[index]
        if (!limits || !entry) return null
        const kp = clampGain(entry.kp, limits.kp[0], limits.kp[1])
        const ki = clampGain(entry.ki, limits.ki[0], limits.ki[1])
        const kd = clampGain(entry.kd, limits.kd[0], limits.kd[1])
        if (kp === null || ki === null || kd === null) return null
        const clamped = Number(entry.kp) !== kp || Number(entry.ki) !== ki || Number(entry.kd) !== kd
        return { line: index + ',' + formatGain(kp) + ',' + formatGain(ki) + ',' + formatGain(kd), clamped }
      }

      async function sendPid(index) {
        if (sending) return
        const built = buildPidLine(index)
        if (!built) {
          setProblem(t('pidInvalid'))
          return
        }
        setSending(true)
        await sendCommand(built.line, built.clamped ? t('pidClamped') : '')
        setSending(false)
      }

      async function sendAllPids() {
        if (sending) return
        const built = []
        for (let index = 0; index < pidLimits.length; index += 1) {
          const entry = buildPidLine(index)
          if (!entry) {
            setProblem(t('pidInvalid'))
            return
          }
          built.push(entry)
        }
        setSending(true)
        for (const entry of built) {
          const ok = await sendCommand(entry.line, entry.clamped ? t('pidClamped') : '')
          if (!ok) break
        }
        setSending(false)
      }

      function resetPids() {
        setPids(defaults.map((entry) => ({ kp: entry.kp, ki: entry.ki, kd: entry.kd })))
      }

      function applyDefaults() {
        setPids(defaults.map((entry) => ({ kp: entry.kp, ki: entry.ki, kd: entry.kd })))
      }

      function useBuiltinDefaults() {
        const builtin = defaultPidStrings()
        setDefaults(builtin)
        setPids(builtin.map((entry) => ({ ...entry })))
        setPidLimits(PID_LIMITS)
      }

      async function alignFromFirmware() {
        setSending(true)
        try {
          const data = await getJson('/serial-monitor/firmware')
          if (!data || !data.found) {
            setProblem(t('firmwareNotFound'))
            return
          }
          if (!Array.isArray(data.defaults) || !data.defaults.length) {
            setProblem(t('defaultParseFailed'))
            return
          }
          const parsed = data.defaults.map((gains) => (Array.isArray(gains) && gains.length >= 3
            ? { kp: String(gains[0]), ki: String(gains[1]), kd: String(gains[2]) }
            : null))
          if (!parsed.every(Boolean) || parsed.length !== defaults.length) {
            setProblem(t('defaultParseFailed'))
            return
          }
          setDefaults(parsed)
          setPids(parsed.map((entry) => ({ ...entry })))
          let message = t('firmwareAligned') + ' ' + String(data.file || 'balance.c')
          if (Array.isArray(data.limits) && data.limits.length === pidLimits.length) {
            const limits = data.limits.map((row) => ({
              kp: [row[0], row[1]], ki: [row[2], row[3]], kd: [row[4], row[5]],
            }))
            const valid = limits.every((entry) => entry.kp.every(Number.isFinite) && entry.ki.every(Number.isFinite) && entry.kd.every(Number.isFinite))
            if (valid) {
              setPidLimits(limits)
              message += ' · ' + t('limitsAligned')
            }
          }
          setProblem('')
          appendNotice(message)
        } catch (error) {
          setProblem(String((error && error.message) || error) || t('firmwareNotFound'))
        } finally {
          setSending(false)
        }
      }

      async function alignChannels() {
        if (sending) return
        setSending(true)
        try {
          const data = await getJson('/serial-monitor/firmware')
          const codes = Array.isArray(data && data.channels)
            ? data.channels.map((code) => String(code)).filter(Boolean)
            : []
          if (!data || !data.found || codes.length < 2) {
            setProblem(t('channelsParseFailed'))
            return
          }
          const count = telemetry && telemetry.count ? telemetry.count : codes.length
          setChannelCodes(codes)
          setChannelNames({})
          setChartConfig(seedCharts(codes, count))
          setProblem('')
          appendNotice(t('channelsAligned') + ' ' + codes.length)
        } catch (error) {
          setProblem(String((error && error.message) || error) || t('channelsParseFailed'))
        } finally {
          setSending(false)
        }
      }

      async function handleBalanceFile(event) {
        const input = event.target
        const file = input.files && input.files[0]
        input.value = ''
        if (!file) return
        try {
          const buffer = await file.arrayBuffer()
          let source
          try { source = new TextDecoder('gbk').decode(buffer) } catch { source = new TextDecoder('utf-8').decode(buffer) }
          const parsed = parseBalanceDefaults(source)
          if (!parsed) {
            setProblem(t('defaultParseFailed'))
            return
          }
          setDefaults(parsed)
          setPids(parsed.map((entry) => ({ ...entry })))
          setProblem('')
          appendNotice(t('defaultImported') + ' ' + file.name)
        } catch {
          setProblem(t('defaultParseFailed'))
        }
      }

      function setChartChannel(slot, field, value) {
        setChartConfig((previous) => {
          const base = (Array.isArray(previous) ? previous : []).slice(0, 4).map((entry) => ({
            p: entry && Number.isInteger(entry.p) ? entry.p : null,
            c: entry && Number.isInteger(entry.c) ? entry.c : null,
          }))
          while (base.length < 4) base.push({ p: null, c: null })
          base[slot][field] = value
          if (field === 'p' && base[slot].c === value) base[slot].c = null
          if (field === 'c' && base[slot].p === value) base[slot].c = null
          return base
        })
      }

      function channelName(index) {
        return channelNames[index] || channelCodes[index] || 'CH' + (index + 1)
      }

      function beginRename(index) {
        setEditingChannel(index)
        setNameDraft(channelName(index))
      }

      function commitRename(index, value) {
        const name = String(value === null || value === undefined ? '' : value).trim().slice(0, 24)
        setChannelNames((previous) => {
          const next = { ...previous }
          if (name) next[index] = name
          else delete next[index]
          return next
        })
        setEditingChannel(-1)
        setNameDraft('')
      }

      function cancelRename() {
        setEditingChannel(-1)
        setNameDraft('')
      }

      async function startMotorTest() {
        if (sending || motorActive || !motorArmed) return
        const leftValue = clampGain(motorLeft, -MOTOR_LIMIT, MOTOR_LIMIT)
        const rightValue = clampGain(motorRight, -MOTOR_LIMIT, MOTOR_LIMIT)
        if (leftValue === null || rightValue === null) {
          setProblem(t('pidInvalid'))
          return
        }
        setSending(true)
        const ok = await sendCommand('11,' + Math.round(leftValue) + ',' + Math.round(rightValue) + ',1', t('motorStart'))
        setSending(false)
        if (!ok) return
        setMotorActive(true)
        motorActiveRef.current = true
        clearMotorTimer()
        motorTimerRef.current = setTimeout(() => { stopMotorTest(true) }, MOTOR_AUTO_STOP_MS)
      }

      async function stopMotorTest(auto) {
        clearMotorTimer()
        const ok = await sendCommand('11,0,0,0', auto ? t('motorAutoStopped') : t('motorStop'))
        setMotorActive(!ok)
        motorActiveRef.current = !ok
        if (ok && auto) appendNotice(t('motorAutoStopped'))
      }

      function useCurrentPitch() {
        const pitchIndex = channelCodes.indexOf('pitch')
        if (pitchIndex < 0 || !telemetry || !telemetry.values) return
        setZeroInput(formatGain(telemetry.values[pitchIndex]))
      }

      async function handleZeroArm(kind) {
        if (sending) return
        if (zeroArmed !== kind) {
          setZeroArmed(kind)
          clearZeroTimer()
          zeroArmTimerRef.current = setTimeout(() => {
            zeroArmTimerRef.current = null
            setZeroArmed('')
          }, ZERO_ARM_MS)
          return
        }
        disarmZero()
        if (kind === 'save') {
          const value = clampGain(zeroInput, -45, 45)
          if (value === null) {
            setProblem(t('zeroInvalid'))
            return
          }
          setSending(true)
          const ok = await sendCommand('9,' + formatGain(value) + ',0,0', t('zeroSave'))
          setSending(false)
          if (ok) setZeroInput('')
        } else {
          setSending(true)
          await sendCommand('10,0,0,0', t('zeroUnlock'))
          setSending(false)
        }
      }

      async function sendTarget(reset) {
        if (sending) return
        let speed = 0
        let yaw = 0
        const yawLimit = targetOuter ? TARGET_YAW_ANGLE_LIMIT : TARGET_YAW_RATE_LIMIT
        if (!reset) {
          const speedValue = clampGain(targetSpeed, -TARGET_SPEED_LIMIT, TARGET_SPEED_LIMIT)
          const yawValue = clampGain(targetYaw, -yawLimit, yawLimit)
          if (speedValue === null || yawValue === null) {
            setProblem(t('pidInvalid'))
            return
          }
          speed = speedValue
          yaw = yawValue
        }
        const clamped = !reset && (Number(targetSpeed) !== speed || Number(targetYaw) !== yaw)
        setSending(true)
        const ok = await sendCommand(
          '6,' + formatGain(speed) + ',' + formatGain(yaw) + ',' + (reset || !targetOuter ? 0 : 1),
          reset ? t('targetZero') : clamped ? t('targetClamped') : '',
        )
        setSending(false)
        if (!ok) return
        targetActiveRef.current = reset ? false : (speed !== 0 || yaw !== 0 || targetOuter)
        if (reset) {
          setTargetSpeed('0')
          setTargetYaw('0')
          setTargetOuter(false)
        }
      }

      async function sendCustom() {
        if (sending) return
        const line = String(customLine).trim()
        if (!line) {
          setProblem(t('customEmpty'))
          return
        }
        if (/^@?\s*11\s*(,|$)/.test(line)) {
          setProblem(t('customMotorBlocked'))
          return
        }
        setSending(true)
        const ok = await sendCommand(line, '')
        setSending(false)
        if (!ok) return
        setCustomHistory((previous) => [line].concat(previous.filter((item) => item !== line)).slice(0, 8))
      }

      React.useEffect(() => {
        if (!open) return undefined
        let cancelled = false
        setProblem('')
        ;(async () => {
          try {
            const data = await getJson('/serial-monitor/ports')
            if (cancelled) return
            setBridge('ok')
            setSupported(data.supported !== false)
            const list = Array.isArray(data.ports) ? data.ports : []
            setPorts(list)
            setPort((previous) => previous || list[0] || '')
          } catch {
            if (!cancelled) setBridge('down')
          }
        })()
        ;(async () => {
          try {
            const data = await getJson('/serial-monitor/state')
            if (cancelled) return
            setBridge('ok')
            setSupported(data.supported !== false)
            if (data.status) {
              setStatus(data.status)
              if (data.status.port) setPort(data.status.port)
              if (data.status.baudRate) setBaud(data.status.baudRate)
            }
            setBytes(data.bytes || 0)
            if (data.status && data.status.state === 'open') {
              cursorRef.current = data.cursor || 0
              resetDecoder()
              resetTelemetry()
              setText('')
              appendNotice(t('resumeNotice'))
            }
          } catch {
            if (!cancelled) setBridge('down')
          }
        })()
        return () => {
          cancelled = true
          clearMotorTimer()
          disarmZero()
          const current = statusRef.current
          if (current && (current.state === 'open' || current.state === 'connecting')) {
            const stopMotor = motorActiveRef.current
            const stopTarget = targetActiveRef.current
            if (stopMotor || stopTarget) {
              // Return the car to a benign state before the port goes away.
              ;(async () => {
                if (stopMotor) await postJson('/serial-monitor/write', { text: '@11,0,0,0' }).catch(() => {})
                if (stopTarget) await postJson('/serial-monitor/write', { text: '@6,0,0,0' }).catch(() => {})
                motorActiveRef.current = false
                targetActiveRef.current = false
                setTimeout(() => { postJson('/serial-monitor/close', {}).catch(() => {}) }, 200)
              })()
            } else {
              postJson('/serial-monitor/close', {}).catch(() => {})
            }
          }
        }
      }, [open])

      React.useEffect(() => {
        if (!open || status.state !== 'open') return undefined
        let cancelled = false
        let timer = null
        const tick = async () => {
          if (cancelled) return
          try {
            const data = await getJson('/serial-monitor/poll?cursor=' + encodeURIComponent(String(cursorRef.current)))
            if (cancelled) return
            setBridge('ok')
            if (data.status) applyStatus(data.status)
            setBytes(data.bytes || 0)
            if (data.reset) appendNotice(t('gapNotice'))
            if (Array.isArray(data.chunks) && data.chunks.length) {
              appendChunks(data.chunks)
              ingestTelemetry(data.chunks)
            }
            cursorRef.current = typeof data.cursor === 'number' ? data.cursor : cursorRef.current
            if (data.status && data.status.state !== 'open') return
            timer = setTimeout(tick, POLL_DELAY_MS)
          } catch (error) {
            if (cancelled) return
            setBridge('down')
            setProblem(String((error && error.message) || error))
          }
        }
        tick()
        return () => {
          cancelled = true
          if (timer) clearTimeout(timer)
        }
      }, [open, status.state])

      React.useEffect(() => {
        if (!autoScroll || !logRef.current) return
        logRef.current.scrollTop = logRef.current.scrollHeight
      }, [text, autoScroll])

      if (!open) return null

      async function refreshPorts() {
        try {
          const data = await getJson('/serial-monitor/ports?force=1')
          setBridge('ok')
          setSupported(data.supported !== false)
          const list = Array.isArray(data.ports) ? data.ports : []
          setPorts(list)
          setPort((previous) => previous || list[0] || '')
        } catch {
          setBridge('down')
        }
      }

      async function handleOpen() {
        if (!port) {
          setProblem(t('noPorts'))
          return
        }
        setBusy(true)
        setProblem('')
        setStatus({ state: 'connecting', port, baudRate: baud, error: '', openedAt: 0 })
        try {
          const data = await postJson('/serial-monitor/open', {
            port, baudRate: baud, dataBits, parity, stopBits,
          })
          if (data.status) setStatus(data.status)
          if (data.status && data.status.state === 'open') {
            setBridge('ok')
            cursorRef.current = typeof data.cursor === 'number' ? data.cursor : 0
            resetDecoder()
            resetTelemetry()
            setText('')
            setBytes(0)
            setMotorActive(false)
            motorActiveRef.current = false
            clearMotorTimer()
            disarmZero()
            targetActiveRef.current = false
            appendNotice(t('connected') + ' ' + data.status.port + ' @ ' + data.status.baudRate)
            try {
              await postJson('/serial-monitor/write', { text: '@11,0,0,0' })
              pushCommand('@11,0,0,0', true, t('safetyStop'))
            } catch { /* firmware without the tuning protocol ignores it */ }
          } else {
            setProblem((data.status && data.status.error) || t('openFailed'))
          }
        } catch (error) {
          setProblem(String((error && error.message) || error) || t('openFailed'))
          setStatus({ state: 'error', port, baudRate: baud, error: '', openedAt: 0 })
        } finally {
          setBusy(false)
        }
      }

      async function handleClose() {
        setBusy(true)
        try {
          if (motorActiveRef.current) {
            await postJson('/serial-monitor/write', { text: '@11,0,0,0' }).catch(() => {})
          }
          if (targetActiveRef.current) {
            await postJson('/serial-monitor/write', { text: '@6,0,0,0' }).catch(() => {})
          }
          const data = await postJson('/serial-monitor/close', {})
          if (data.status) setStatus(data.status)
          resetTelemetry()
          setMotorActive(false)
          motorActiveRef.current = false
          targetActiveRef.current = false
          clearMotorTimer()
          disarmZero()
          appendNotice(t('closedNotice'))
        } catch (error) {
          setProblem(String((error && error.message) || error))
        } finally {
          setBusy(false)
        }
      }

      function handleClear() {
        setText('')
        resetDecoder()
        setProblem('')
      }

      async function handleCopy() {
        try {
          await navigator.clipboard.writeText(text)
          appendNotice(t('copied'))
        } catch {
          appendNotice(t('copyFailed'))
        }
      }

      function handleViewChange(next) {
        if (next === viewMode) return
        setViewMode(next)
        resetDecoder()
        appendNotice(t('view') + ': ' + (next === 'hex' ? t('viewHex') : t('viewText')))
      }

      function handleEncodingChange(next) {
        if (next === encoding) return
        setEncoding(next)
        resetDecoder()
        appendNotice(t('encoding') + ': ' + next.toUpperCase())
      }

      const stateKey = status.state || 'idle'
      const statusLabel = stateKey === 'open'
        ? t('statusConnected')
        : stateKey === 'connecting'
          ? t('statusConnecting')
          : stateKey === 'error'
            ? t('statusError')
            : t('statusIdle')
      const dotClass = 'dsh-sm-dot' + (stateKey === 'open' ? ' is-open' : stateKey === 'error' ? ' is-error' : stateKey === 'connecting' ? ' is-connecting' : '')
      const connected = stateKey === 'open'
      const connecting = stateKey === 'connecting'
      const locked = connected || connecting || busy
      const baudOptions = BAUD_RATES.includes(baud) ? BAUD_RATES : BAUD_RATES.concat([baud]).sort((left, right) => left - right)
      const portOptions = ports.length
        ? (port && !ports.includes(port) ? [port].concat(ports) : ports.slice())
        : port ? [port] : []
      const parityLabels = {
        None: t('parityNone'), Odd: t('parityOdd'), Even: t('parityEven'), Mark: t('parityMark'), Space: t('paritySpace'),
      }
      const stopLabels = { One: t('stopOne'), OnePointFive: t('stopOneHalf'), Two: t('stopTwo') }
      const problemText = problem || (status.state === 'error' ? status.error : '')
      const bridgeDown = bridge === 'down'

      const telemetryValues = telemetry && Array.isArray(telemetry.values) ? telemetry.values : null
      const zeroChannel = channelCodes.indexOf('zero')
      const pitchChannel = channelCodes.indexOf('pitch')
      const zeroReading = telemetryValues && zeroChannel >= 0 && Number.isFinite(telemetryValues[zeroChannel]) ? telemetryValues[zeroChannel].toFixed(2) : ''
      const channelValue = (index) => (telemetryValues && Number.isFinite(telemetryValues[index]) ? telemetryValues[index].toFixed(2) : '—')
      const channelCount = telemetry && Number.isInteger(telemetry.count) ? telemetry.count : 0
      const channelCells = []
      for (let index = 0; index < channelCount; index += 1) {
        channelCells.push(h('div', { key: index, className: 'dsh-sm-tel-cell' },
          editingChannel === index
            ? h('input', {
                className: 'dsh-sm-name-input', autoFocus: true, value: nameDraft,
                onChange: (event) => setNameDraft(event.target.value),
                onBlur: () => commitRename(index, nameDraft),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitRename(index, nameDraft)
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    cancelRename()
                  }
                },
              })
            : h('button', {
                type: 'button', className: 'dsh-sm-tel-label', title: t('channelRename'),
                onClick: () => beginRename(index),
              }, channelName(index)),
          h('span', { className: 'dsh-sm-tel-value' }, channelValue(index)),
        ))
      }
      const channelOptions = () => {
        const list = [h('option', { key: 'none', value: '' }, '—')]
        for (let index = 0; index < channelCount; index += 1) {
          list.push(h('option', { key: index, value: String(index) }, channelName(index)))
        }
        return list
      }
      const chartCards = Array.from({ length: 4 }, (_, slot) => {
        const config = (chartConfig && chartConfig[slot]) || { p: null, c: null }
        const primary = Number.isInteger(config.p) && config.p >= 0 && config.p < channelCount ? config.p : null
        const compare = Number.isInteger(config.c) && config.c >= 0 && config.c < channelCount && config.c !== primary ? config.c : null
        const indices = []
        if (primary !== null) indices.push(primary)
        if (compare !== null) indices.push(compare)
        const geometry = indices.length ? sparkGeometry(samples, indices) : null
        const primaryValue = geometry && primary !== null ? geometry.currents[0] : null
        const compareValue = geometry && compare !== null ? geometry.currents[1] : null
        return h('div', { key: slot, className: 'dsh-sm-spark-card' },
          h('div', { className: 'dsh-sm-chart-pick' },
            h('select', {
              className: 'dsh-sm-chart-select', title: t('chartPick'),
              value: primary === null ? '' : String(primary),
              disabled: channelCount === 0,
              onChange: (event) => setChartChannel(slot, 'p', event.target.value === '' ? null : Number(event.target.value)),
            }, channelOptions()),
            h('select', {
              className: 'dsh-sm-chart-select', title: t('chartPick'),
              value: compare === null ? '' : String(compare),
              disabled: channelCount === 0,
              onChange: (event) => setChartChannel(slot, 'c', event.target.value === '' ? null : Number(event.target.value)),
            }, channelOptions()),
          ),
          h('div', { className: 'dsh-sm-spark-head' },
            h('span', null, primary === null ? t('chartPick') : channelName(primary)),
            h('span', { className: 'dsh-sm-spark-val' }, primaryValue === null || !Number.isFinite(primaryValue) ? '—' : primaryValue.toFixed(2)),
          ),
          h('svg', { className: 'dsh-sm-spark', viewBox: '0 0 100 30', preserveAspectRatio: 'none', 'aria-hidden': true },
            geometry
              ? indices.map((_, position) => (geometry.plots[position]
                  ? h('polyline', {
                      key: position,
                      points: geometry.plots[position].points,
                      fill: 'none',
                      stroke: position === 0 ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-state-warn-primary)',
                      strokeWidth: 1.2,
                      vectorEffect: 'non-scaling-stroke',
                    })
                  : null))
              : null,
          ),
          compareValue !== null && Number.isFinite(compareValue)
            ? h('div', { className: 'dsh-sm-spark-legend' },
                h('span', { className: 'dsh-sm-dot-mini', style: { background: 'var(--dsw-alias-state-warn-primary)' } }),
                channelName(compare) + ' ' + compareValue.toFixed(2),
              )
            : null,
        )
      })

      const tuningView = h('div', { className: 'dsh-sm-tune' },
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('tuneChannels')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('button', {
              type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini',
              disabled: sending, onClick: alignChannels,
            }, t('alignChannels')),
            h('span', { className: 'dsh-sm-sec-note' + (telemetryValues ? '' : ' is-warn') }, telemetryValues ? t('tuneHint') : t('tuneWaiting')),
          ),
          h('div', { className: 'dsh-sm-tel' }, channelCells),
          h('div', { className: 'dsh-sm-sparks' }, chartCards),
        ),
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('pidTitle')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('span', { className: 'dsh-sm-sec-note', title: t('pidHint') }, t('pidHint')),
          ),
          h('div', { className: 'dsh-sm-pid-grid' },
            pidLimits.map((limits, index) => h('div', { key: index, className: 'dsh-sm-pid' },
              h('div', { className: 'dsh-sm-pid-head' },
                h('span', { className: 'dsh-sm-pid-name', title: t(PID_LOOPS[index]) }, '[' + index + '] ' + t(PID_LOOPS[index])),
                h('button', {
                  type: 'button', className: 'dsh-sm-btn primary dsh-sm-mini',
                  disabled: !connected || sending,
                  onClick: () => sendPid(index),
                }, t('pidSend')),
              ),
              h('div', { className: 'dsh-sm-pid-fields' },
                ['kp', 'ki', 'kd'].map((field) => h('label', { key: field, className: 'dsh-sm-gain' },
                  h('span', null, field),
                  h('input', {
                    type: 'number', className: 'dsh-sm-num', step: 'any',
                    min: limits[field][0], max: limits[field][1],
                    value: pids[index][field],
                    disabled: !connected || sending,
                    'aria-label': t(PID_LOOPS[index]) + ' ' + field,
                    onChange: (event) => {
                      const next = event.target.value
                      setPids((previous) => previous.map((entry, position) => position === index ? { ...entry, [field]: next } : entry))
                    },
                  }),
                )),
              ),
            )),
          ),
          h('div', { className: 'dsh-sm-row', style: { marginTop: '7px' } },
            h('button', { type: 'button', className: 'dsh-sm-btn primary dsh-sm-mini', disabled: !connected || sending, onClick: sendAllPids }, t('pidSendAll')),
            h('button', { type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini', disabled: sending, onClick: resetPids }, t('pidDefaults')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('span', { className: 'dsh-sm-sec-note' }, 'kp / ki / kd'),
          ),
        ),
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('defaultTitle')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('button', {
              type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini',
              onClick: () => setShowDefaults((value) => !value),
            }, showDefaults ? t('defaultHide') : t('defaultEdit')),
          ),
          h('div', { className: 'dsh-sm-row' },
            h('button', {
              type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini',
              disabled: sending, onClick: alignFromFirmware,
            }, t('defaultAlign')),
            h('button', { type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini', onClick: applyDefaults }, t('defaultApply')),
            h('label', { className: 'dsh-sm-file-btn' },
              h('input', { type: 'file', accept: '.c,.h,.txt', style: { display: 'none' }, onChange: handleBalanceFile }),
              t('defaultImport'),
            ),
            h('button', { type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini', onClick: useBuiltinDefaults }, t('defaultBuiltin')),
          ),
          showDefaults
            ? h('div', { className: 'dsh-sm-def-grid' }, defaults.map((entry, index) => h('div', { key: index, className: 'dsh-sm-def-row' },
                h('span', { className: 'dsh-sm-def-name', title: t(PID_LOOPS[index]) }, '[' + index + '] ' + t(PID_LOOPS[index])),
                ['kp', 'ki', 'kd'].map((field) => h('label', { key: field, className: 'dsh-sm-gain' },
                  h('span', null, field),
                  h('input', {
                    type: 'number', className: 'dsh-sm-num', step: 'any', value: entry[field],
                    'aria-label': t(PID_LOOPS[index]) + ' default ' + field,
                    onChange: (event) => {
                      const next = event.target.value
                      setDefaults((previous) => previous.map((item, position) => position === index ? { ...item, [field]: next } : item))
                    },
                  }),
                )),
              )))
            : null,
          h('div', { className: 'dsh-sm-row' },
            h('span', { className: 'dsh-sm-sec-note' }, t('defaultHint')),
          ),
        ),
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('targetTitle')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('span', { className: 'dsh-sm-sec-note is-warn', title: t('targetMotion') }, t('targetMotion')),
          ),
          h('div', { className: 'dsh-sm-row' },
            h('label', { className: 'dsh-sm-gain' },
              h('span', null, t('targetSpeed')),
              h('input', {
                type: 'number', className: 'dsh-sm-num', style: { width: '84px' }, step: '1',
                min: -TARGET_SPEED_LIMIT, max: TARGET_SPEED_LIMIT, value: targetSpeed, disabled: !connected,
                onChange: (event) => setTargetSpeed(event.target.value),
              }),
              h('span', { className: 'dsh-sm-unit' }, t('targetSpeedUnit')),
            ),
            h('label', { className: 'dsh-sm-gain' },
              h('span', null, targetOuter ? t('targetYawAngle') : t('targetYawRate')),
              h('input', {
                type: 'number', className: 'dsh-sm-num', style: { width: '84px' }, step: '1',
                min: targetOuter ? -TARGET_YAW_ANGLE_LIMIT : -TARGET_YAW_RATE_LIMIT,
                max: targetOuter ? TARGET_YAW_ANGLE_LIMIT : TARGET_YAW_RATE_LIMIT,
                value: targetYaw, disabled: !connected,
                onChange: (event) => setTargetYaw(event.target.value),
              }),
              h('span', { className: 'dsh-sm-unit' }, targetOuter ? t('targetYawAngleUnit') : t('targetYawRateUnit')),
            ),
            h('button', {
              type: 'button', className: 'dsh-sm-btn primary dsh-sm-mini',
              disabled: !connected || sending, onClick: () => sendTarget(false),
            }, t('targetSend')),
            h('button', {
              type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini',
              disabled: !connected || sending, onClick: () => sendTarget(true),
            }, t('targetZero')),
          ),
          h('div', { className: 'dsh-sm-row' },
            h('label', { className: 'dsh-sm-check' },
              h('input', {
                type: 'checkbox', checked: targetOuter, disabled: !connected,
                onChange: (event) => setTargetOuter(event.target.checked),
              }),
              t('targetOuter'),
            ),
            h('span', { className: 'dsh-sm-sec-note' }, t('targetHint') + ' · ' + t('targetAutoZero')),
          ),
        ),
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('motorTitle')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('span', { className: 'dsh-sm-sec-note is-warn', title: t('motorWarn') }, t('motorWarn')),
          ),
          h('div', { className: 'dsh-sm-row' },
            h('label', { className: 'dsh-sm-check' },
              h('input', {
                type: 'checkbox', checked: motorArmed, disabled: !connected,
                onChange: (event) => setMotorArmed(event.target.checked),
              }),
              t('motorArmed'),
            ),
            h('label', { className: 'dsh-sm-gain' },
              h('span', null, t('motorLeft')),
              h('input', {
                type: 'number', className: 'dsh-sm-num', style: { width: '86px' }, step: '100',
                min: -MOTOR_LIMIT, max: MOTOR_LIMIT, value: motorLeft, disabled: !connected,
                onChange: (event) => setMotorLeft(event.target.value),
              }),
            ),
            h('label', { className: 'dsh-sm-gain' },
              h('span', null, t('motorRight')),
              h('input', {
                type: 'number', className: 'dsh-sm-num', style: { width: '86px' }, step: '100',
                min: -MOTOR_LIMIT, max: MOTOR_LIMIT, value: motorRight, disabled: !connected,
                onChange: (event) => setMotorRight(event.target.value),
              }),
            ),
            h('button', {
              type: 'button', className: 'dsh-sm-btn danger dsh-sm-mini',
              disabled: !connected || sending || motorActive || !motorArmed,
              onClick: startMotorTest,
            }, t('motorStart')),
            h('button', {
              type: 'button', className: 'dsh-sm-btn dsh-sm-mini',
              disabled: !connected || sending || !motorActive,
              onClick: () => stopMotorTest(false),
            }, t('motorStop')),
          ),
          h('div', { className: 'dsh-sm-row' },
            h('span', { className: 'dsh-sm-sec-note' }, t('motorRange') + ' · ' + t('motorAutoStop')),
          ),
          motorActive && !connected
            ? h('div', { className: 'dsh-sm-sec-note is-error', style: { whiteSpace: 'normal', marginTop: '5px', lineHeight: 1.4 } }, t('motorLost'))
            : null,
        ),
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('zeroTitle')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('span', { className: 'dsh-sm-sec-note', title: t('zeroHint') }, t('zeroHint')),
          ),
          h('div', { className: 'dsh-sm-row' },
            h('span', { className: 'dsh-sm-sec-note' }, t('zeroCurrent') + ': ' + (zeroReading ? zeroReading + '°' : '—')),
            h('label', { className: 'dsh-sm-gain' },
              h('span', null, t('zeroTarget')),
              h('input', {
                type: 'number', className: 'dsh-sm-num', style: { width: '90px' }, step: '0.01',
                min: -45, max: 45, value: zeroInput, disabled: !connected,
                placeholder: zeroReading,
                onChange: (event) => setZeroInput(event.target.value),
              }),
            ),
            h('button', {
              type: 'button', className: 'dsh-sm-btn ghost dsh-sm-mini',
              disabled: !connected || !telemetryValues || pitchChannel < 0, onClick: useCurrentPitch,
            }, t('zeroUsePitch')),
            h('button', {
              type: 'button', className: 'dsh-sm-btn primary dsh-sm-mini',
              disabled: !connected || sending,
              onClick: () => handleZeroArm('save'),
            }, zeroArmed === 'save' ? t('zeroConfirm') : t('zeroSave')),
            h('button', {
              type: 'button', className: 'dsh-sm-btn danger dsh-sm-mini',
              disabled: !connected || sending,
              onClick: () => handleZeroArm('unlock'),
            }, zeroArmed === 'unlock' ? t('zeroConfirm') : t('zeroUnlock')),
          ),
        ),
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('customTitle')),
            h('span', { className: 'dsh-sm-spacer' }),
            h('span', { className: 'dsh-sm-sec-note', title: t('customHint') }, t('customHint')),
          ),
          h('div', { className: 'dsh-sm-row' },
            h('input', {
              className: 'dsh-sm-cmdline', value: customLine, disabled: !connected,
              placeholder: t('customPlaceholder'),
              onChange: (event) => setCustomLine(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  sendCustom()
                }
              },
            }),
            h('button', {
              type: 'button', className: 'dsh-sm-btn primary dsh-sm-mini',
              disabled: !connected || sending, onClick: sendCustom,
            }, t('customSend')),
          ),
          customHistory.length
            ? h('div', { className: 'dsh-sm-row' },
                customHistory.map((line, index) => h('button', {
                  key: index, type: 'button', className: 'dsh-sm-chip', title: line,
                  onClick: () => setCustomLine(line),
                }, line)),
              )
            : null,
        ),
        h('section', { className: 'dsh-sm-sec' },
          h('div', { className: 'dsh-sm-sec-head' },
            h('span', { className: 'dsh-sm-sec-title' }, t('cmdTitle')),
          ),
          commandLog.length
            ? h('div', { className: 'dsh-sm-cmdlog' }, commandLog.map((entry, index) => h('div', {
                key: index,
                className: entry.ok ? '' : 'is-err',
              }, formatTime(entry.at) + '  > ' + entry.line + (entry.message ? '  ' + entry.message : ''))))
            : h('div', { className: 'dsh-sm-cmd-empty' }, t('cmdEmpty')),
        ),
      )

      return h(React.Fragment, null,
        h(StyleTag),
        h('div', {
          className: 'dsh-sm-panel',
          role: 'dialog',
          'aria-label': t('title'),
          onKeyDown: (event) => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              panelStore.set(false)
            }
          },
        },
          h('div', { className: 'dsh-sm-head' },
            h(SerialIcon, { size: 16 }),
            h('span', { className: 'dsh-sm-title' }, t('title')),
            h('span', { className: 'dsh-sm-status' },
              h('span', { className: dotClass }),
              statusLabel,
            ),
            h('span', { className: 'dsh-sm-spacer' }),
            connected || connecting
              ? h('span', { className: 'dsh-sm-meta', title: (status.port || '') + ' @ ' + (status.baudRate || '') }, (status.port || '') + ' @ ' + (status.baudRate || ''))
              : null,
            h('button', {
              type: 'button', className: 'dsh-sm-iconbtn', title: t('copy'), 'aria-label': t('copy'),
              disabled: !text, onClick: handleCopy,
            }, h(CopyIcon)),
            h('button', {
              type: 'button', className: 'dsh-sm-iconbtn', title: t('closePanel'), 'aria-label': t('closePanel'),
              onClick: () => panelStore.set(false),
            }, h(CloseIcon)),
          ),
          h('div', { className: 'dsh-sm-toolbar' },
            h('label', { className: 'dsh-sm-field' },
              h('span', null, t('port')),
              h('select', {
                className: 'dsh-sm-select',
                value: port,
                disabled: locked,
                'aria-label': t('port'),
                onChange: (event) => setPort(event.target.value),
              },
                portOptions.length
                  ? portOptions.map((name) => h('option', { key: name, value: name }, name))
                  : h('option', { value: '' }, t('noPorts')),
              ),
            ),
            h('button', {
              type: 'button', className: 'dsh-sm-btn ghost', title: t('refreshPorts'), 'aria-label': t('refreshPorts'),
              disabled: locked, onClick: refreshPorts,
            }, h(RefreshIcon)),
            h('label', { className: 'dsh-sm-field' },
              h('span', null, t('baud')),
              h('select', {
                className: 'dsh-sm-select',
                value: baud,
                disabled: locked,
                'aria-label': t('baud'),
                onChange: (event) => setBaud(Number(event.target.value)),
              }, baudOptions.map((rate) => h('option', { key: rate, value: rate }, String(rate)))),
            ),
            h('button', {
              type: 'button',
              className: 'dsh-sm-btn ' + (connected ? 'danger' : 'primary'),
              disabled: busy || !supported || (!connected && bridgeDown),
              onClick: connected ? handleClose : handleOpen,
            }, connected ? t('closeAction') : connecting ? t('statusConnecting') : t('openAction')),
          ),
          h('div', { className: 'dsh-sm-tabs' },
            h('button', {
              type: 'button',
              className: 'dsh-sm-tab' + (tab === 'data' ? ' is-active' : ''),
              onClick: () => setTab('data'),
            }, t('tabData')),
            h('button', {
              type: 'button',
              className: 'dsh-sm-tab' + (tab === 'tune' ? ' is-active' : ''),
              onClick: () => setTab('tune'),
            }, t('tabTune')),
            h('span', { className: 'dsh-sm-spacer' }),
            tab === 'tune'
              ? h('span', { className: 'dsh-sm-sec-note', title: t('tuneHint') }, t('tuneHint'))
              : null,
          ),
          tab === 'tune' ? null : h('div', { className: 'dsh-sm-toolbar options' },
            h('label', { className: 'dsh-sm-field' },
              h('span', null, t('dataBits')),
              h('select', {
                className: 'dsh-sm-select', value: dataBits, disabled: locked, 'aria-label': t('dataBits'),
                onChange: (event) => setDataBits(Number(event.target.value)),
              }, DATA_BITS.map((value) => h('option', { key: value, value }, String(value)))),
            ),
            h('label', { className: 'dsh-sm-field' },
              h('span', null, t('parity')),
              h('select', {
                className: 'dsh-sm-select', value: parity, disabled: locked, 'aria-label': t('parity'),
                onChange: (event) => setParity(event.target.value),
              }, PARITY_VALUES.map((value) => h('option', { key: value, value }, parityLabels[value]))),
            ),
            h('label', { className: 'dsh-sm-field' },
              h('span', null, t('stopBits')),
              h('select', {
                className: 'dsh-sm-select', value: stopBits, disabled: locked, 'aria-label': t('stopBits'),
                onChange: (event) => setStopBits(event.target.value),
              }, STOP_VALUES.map((value) => h('option', { key: value, value }, stopLabels[value]))),
            ),
            h('label', { className: 'dsh-sm-field' },
              h('span', null, t('encoding')),
              h('select', {
                className: 'dsh-sm-select', value: encoding, 'aria-label': t('encoding'),
                onChange: (event) => handleEncodingChange(event.target.value),
              }, h('option', { value: 'utf-8' }, 'UTF-8'), h('option', { value: 'gbk' }, 'GBK')),
            ),
            h('label', { className: 'dsh-sm-field' },
              h('span', null, t('view')),
              h('select', {
                className: 'dsh-sm-select', value: viewMode, 'aria-label': t('view'),
                onChange: (event) => handleViewChange(event.target.value),
              }, h('option', { value: 'text' }, t('viewText')), h('option', { value: 'hex' }, t('viewHex'))),
            ),
            h('label', { className: 'dsh-sm-check' },
              h('input', { type: 'checkbox', checked: showTime, onChange: (event) => setShowTime(event.target.checked) }),
              t('timestamps'),
            ),
            h('label', { className: 'dsh-sm-check' },
              h('input', { type: 'checkbox', checked: autoScroll, onChange: (event) => setAutoScroll(event.target.checked) }),
              t('autoscroll'),
            ),
          ),
          problemText ? h('div', { className: 'dsh-sm-bar error' }, problemText) : null,
          bridgeDown ? h('div', { className: 'dsh-sm-bar error' }, t('bridgeDown')) : null,
          supported ? null : h('div', { className: 'dsh-sm-bar warn' }, t('unsupportedPlatform')),
          tab === 'tune' && !connected ? h('div', { className: 'dsh-sm-bar warn' }, t('tuneDisconnected')) : null,
          motorActive && !connected ? h('div', { className: 'dsh-sm-bar error' }, t('motorLost')) : null,
          tab === 'tune' ? tuningView : h('div', {
            className: 'dsh-sm-log',
            ref: logRef,
            onScroll: (event) => {
              const node = event.currentTarget
              if (!node) return
              const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 24
              if (atBottom !== autoScroll && !atBottom) setAutoScroll(false)
            },
          }, text || h('div', { className: 'dsh-sm-empty' },
            h('strong', null, t('emptyTitle')),
            h('span', null, t('emptyHint')),
            h('span', null, t('emptyHint2')),
          )),
          tab === 'tune' ? null : h('div', { className: 'dsh-sm-foot' },
            h('span', null, t('bytesReceived') + ' ' + formatBytes(bytes)),
            h('span', { className: 'dsh-sm-spacer' }),
            h('button', {
              type: 'button', className: 'dsh-sm-btn ghost', disabled: !text, onClick: handleClear,
            }, t('clear')),
          ),
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const locale = ctx.get('locale')
        if (locale && typeof locale.register === 'function' && typeof locale.bind === 'function') {
          try {
            const disposers = []
            disposers.push(locale.register('serial-monitor', 'en', EN))
            disposers.push(locale.register('serial-monitor', 'zh', ZH))
            disposers.push(locale.register('serial-monitor', 'zh-CN', ZH))
            ctx.effect(() => () => {
              for (const dispose of disposers) {
                try { dispose() } catch { /* already removed */ }
              }
            }, 'serial-monitor locale')
            translate = locale.bind('serial-monitor')
            subscribeLocale = (listener) => locale.subscribe(listener)
          } catch (error) {
            console.error('serial-monitor locale registration failed', error)
          }
        }

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'serial-monitor-panel',
          order: 60,
          label: () => translate('title'),
        }, SerialPanel))

        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'serial-monitor-toggle',
          order: 20,
          label: () => translate('title'),
        }, SerialToggle))
      },
    }
  },
})