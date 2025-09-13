class Checker {
  constructor() {
    this.tokens = []
    this.validTokens = []
    this.init()
  }

  init() {
    this.tokensInput = document.getElementById("tokens")
    this.checkBtn = document.getElementById("checkBtn")
    this.copyBtn = document.getElementById("copyBtn")
    this.resultsBox = document.getElementById("results")

    this.checkBtn.addEventListener("click", () => this.check())
    this.copyBtn.addEventListener("click", () => this.copyValid())
  }

  async check() {
    const tokens = this.tokensInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t)

    if (tokens.length === 0) {
      this.showError("Please provide tokens")
      return
    }

    this.checkBtn.disabled = true
    this.checkBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Checking...'
    this.resultsBox.innerHTML = ""
    this.validTokens = []

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      try {
        const response = await fetch("https://discord.com/api/v9/users/@me", {
          headers: {
            Authorization: token,
          },
        })

        if (response.ok) {
          const user = await response.json()
          this.validTokens.push(token)
          this.addResult(user, token, true)
        } else {
          this.addResult(null, token, false)
        }
      } catch (error) {
        this.addResult(null, token, false)
      }
    }

    this.checkBtn.disabled = false
    this.checkBtn.innerHTML = '<span class="material-icons">check_circle</span>Check'
    this.copyBtn.disabled = this.validTokens.length === 0
  }

  addResult(user, token, isValid) {
    const card = document.createElement("div")
    card.className = "account-card"

    if (isValid && user) {
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`

      card.innerHTML = `
                <div class="account-header">
                    <img src="${avatarUrl}" alt="Avatar" class="account-avatar">
                    <div class="account-basic">
                        <div class="account-name">${user.global_name || user.username}</div>
                    </div>
                </div>
                <div class="account-details">
                    <div class="account-detail">
                        <span class="account-detail-label">ID</span>
                        <span class="account-detail-value">${user.id}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Global Name</span>
                        <span class="account-detail-value">${user.global_name || "None"}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Username</span>
                        <span class="account-detail-value">${user.username}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Email</span>
                        <span class="account-detail-value">${user.email || "None"}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Phone</span>
                        <span class="account-detail-value">${user.phone || "None"}</span>
                    </div>
                </div>
                <div class="account-token" onclick="this.select()">${token}</div>
            `
    } else {
      card.innerHTML = `
                <div class="account-header">
                    <div class="account-avatar" style="background: rgba(255, 71, 87, 0.3); display: flex; align-items: center; justify-content: center;">
                        <span class="material-icons" style="color: #ff4757;">error</span>
                    </div>
                    <div class="account-basic">
                        <div class="account-name">Invalid</div>
                    </div>
                </div>
                <div class="account-token" onclick="this.select()">${token}</div>
            `
    }

    this.resultsBox.appendChild(card)
  }

  copyValid() {
    if (this.validTokens.length === 0) return

    navigator.clipboard.writeText(this.validTokens.join("\n")).then(() => {
      const originalText = this.copyBtn.innerHTML
      this.copyBtn.innerHTML = '<span class="material-icons">check</span>Copied!'
      setTimeout(() => {
        this.copyBtn.innerHTML = originalText
      }, 2000)
    })
  }

  showError(message) {
    this.resultsBox.innerHTML = `<div style="color: #ffffff; text-align: left; padding: 0.5rem;">${message}</div>`
  }
}

class Config {
  constructor() {
    this.messages = []
    this.members = new Set()
    this.ws = null
    this.memberTimeout = null
    this.currentToken = null
    this.currentTokenIdx = 0
    this.currentChannelIdx = 0
    this.serverId = null
    this.channelIds = []
    this.init()
  }

  init() {
    this.tokensInput = document.getElementById("configTokens")
    this.validateBtn = document.getElementById("validateBtn")
    this.serverIdInput = document.getElementById("serverId")
    this.channelsInput = document.getElementById("channelIds")
    this.getChannelsBtn = document.getElementById("getChannelsBtn")
    this.membersInput = document.getElementById("memberIds")
    this.getMembersBtn = document.getElementById("getMembersBtn")
    this.messagesBox = document.getElementById("messages")
    this.urlModeToggle = document.getElementById("urlMode")
    this.individualInputs = document.getElementById("individualInputs")
    this.urlInput = document.getElementById("urlInput")
    this.msgServerIdInput = document.getElementById("msgServerId")
    this.msgChannelIdInput = document.getElementById("msgChannelId")
    this.msgMessageIdInput = document.getElementById("msgMessageId")
    this.msgUrlInput = document.getElementById("msgUrl")
    this.addMsgBtn = document.getElementById("addMsgBtn")
    this.logs = document.getElementById("configLogs")

    this.validateBtn.addEventListener("click", () => this.validateTokens())
    this.getChannelsBtn.addEventListener("click", () => this.getChannels())
    this.getMembersBtn.addEventListener("click", () => this.getMembers())
    this.addMsgBtn.addEventListener("click", () => this.addMessage())
    this.urlModeToggle.addEventListener("change", () => this.toggleUrlMode())
  }

  toggleUrlMode() {
    if (this.urlModeToggle.checked) {
      this.urlInput.style.display = "none"
      this.individualInputs.style.display = "block"
    } else {
      this.urlInput.style.display = "block"
      this.individualInputs.style.display = "none"
    }
  }

  async validateTokens() {
    const tokens = this.tokensInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t)

    if (tokens.length === 0) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    this.validateBtn.disabled = true
    this.validateBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Validating...'

    const validTokens = []

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      try {
        const response = await fetch("https://discord.com/api/v9/users/@me", {
          headers: {
            Authorization: token,
          },
        })

        if (response.ok) {
          validTokens.push(token)
        }
      } catch (error) {
        continue
      }
    }

    this.tokensInput.value = validTokens.join("\n")

    this.validateBtn.disabled = false
    this.validateBtn.innerHTML = '<span class="material-icons">verified</span>Validate Tokens'
    this.log(`${validTokens.length} valid tokens found and updated`, "success", "check_circle")
  }

  async getChannels() {
    const serverId = this.serverIdInput.value.trim()
    const tokens = this.tokensInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t)

    if (!serverId) {
      this.log("Please provide server ID", "error", "error")
      return
    }

    if (tokens.length === 0) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    this.getChannelsBtn.disabled = true
    this.getChannelsBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Getting...'

    try {
      const token = tokens[0]
      const response = await fetch(`https://discord.com/api/v9/guilds/${serverId}/channels`, {
        headers: {
          Authorization: token,
        },
      })

      if (response.ok) {
        const channels = await response.json()
        const textChannels = channels.filter((ch) => ch.type === 0)
        const channelIds = textChannels.map((ch) => ch.id)

        this.channelsInput.value = channelIds.join("\n")
        this.log(`Got ${channelIds.length} channels`, "success", "check_circle")
      } else {
        this.log("Failed to get channels", "error", "error")
      }
    } catch (error) {
      this.log("Failed to get channels", "error", "error", error.message)
    }

    this.getChannelsBtn.disabled = false
    this.getChannelsBtn.innerHTML = '<span class="material-icons">numbers</span>Get Channels'
  }

  async getMembers() {
    const serverId = this.serverIdInput.value.trim()
    const channelIds = this.channelsInput.value
      .split("\n")
      .map((id) => id.trim())
      .filter((id) => id)
    const tokens = this.tokensInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t)

    if (!serverId) {
      this.log("Please enter a server ID", "error", "error")
      return
    }

    if (channelIds.length === 0) {
      this.log("Please provide channel IDs", "error", "error")
      return
    }

    if (tokens.length === 0) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    this.getMembersBtn.disabled = true
    this.getMembersBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Getting...'

    this.members.clear()
    this.serverId = serverId
    this.channelIds = channelIds
    this.currentTokenIdx = 0
    this.currentChannelIdx = 0

    await this.connectWebSocket()
  }

  async connectWebSocket() {
    const tokens = this.tokensInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t)

    if (this.currentTokenIdx >= tokens.length) {
      this.finalizeMembers()
      return
    }

    this.currentToken = tokens[this.currentTokenIdx]

    try {
      const response = await fetch("https://discord.com/api/v9/gateway", {
        headers: {
          Authorization: this.currentToken,
        },
      })

      if (!response.ok) {
        this.currentTokenIdx++
        await this.connectWebSocket()
        return
      }

      const data = await response.json()
      this.ws = new WebSocket(`${data.url}/?v=9&encoding=json`)

      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({
            op: 2,
            d: {
              token: this.currentToken,
              properties: {
                $os: "windows",
                $browser: "chrome",
                $device: "desktop",
              },
            },
          }),
        )
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.op === 10) {
          setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ op: 1, d: null }))
            }
          }, data.d.heartbeat_interval)
        }

        if (data.op === 0 && data.t === "READY") {
          this.requestMembers()
        }

        if (data.op === 0 && data.t === "GUILD_MEMBER_LIST_UPDATE") {
          if (data.d.ops) {
            data.d.ops.forEach((op) => {
              if (op.op === "SYNC" && op.items) {
                op.items.forEach((item) => {
                  if (item.member && item.member.user) {
                    this.members.add(item.member.user.id)
                  }
                })
              }
            })
          }
        }

        if (data.op === 0 && data.t === "GUILD_MEMBERS_CHUNK") {
          data.d.members.forEach((member) => {
            this.members.add(member.user.id)
          })
        }
      }

      this.ws.onclose = () => {
        this.currentChannelIdx++
        if (this.currentChannelIdx >= this.channelIds.length) {
          this.currentTokenIdx++
          this.currentChannelIdx = 0
        }
        setTimeout(() => this.connectWebSocket(), 1000)
      }

      this.memberTimeout = setTimeout(() => {
        if (this.ws) {
          this.ws.close()
        }
      }, 5000)
    } catch (error) {
      this.currentTokenIdx++
      setTimeout(() => this.connectWebSocket(), 1000)
    }
  }

  requestMembers() {
    if (this.currentChannelIdx < this.channelIds.length) {
      const channelId = this.channelIds[this.currentChannelIdx]

      this.ws.send(
        JSON.stringify({
          op: 14,
          d: {
            guild_id: this.serverId,
            channels: {
              [channelId]: [[0, 99]],
            },
          },
        }),
      )

      this.ws.send(
        JSON.stringify({
          op: 8,
          d: {
            guild_id: this.serverId,
            query: "",
            limit: 0,
          },
        }),
      )
    }
  }

  finalizeMembers() {
    const memberIds = Array.from(this.members)
    this.membersInput.value = memberIds.join("\n")

    this.getMembersBtn.disabled = false
    this.getMembersBtn.innerHTML = '<span class="material-icons">group</span>Get Members'

    this.log(`Got ${memberIds.length} member IDs`, "success", "check_circle")
  }

  addMessage() {
    let serverId, channelId, messageId

    if (this.urlModeToggle.checked) {
      serverId = this.msgServerIdInput.value.trim()
      channelId = this.msgChannelIdInput.value.trim()
      messageId = this.msgMessageIdInput.value.trim()

      if (!serverId) {
        this.log("Please provide server ID", "error", "error")
        return
      }

      if (!channelId) {
        this.log("Please provide channel ID", "error", "error")
        return
      }

      if (!messageId) {
        this.log("Please provide message ID", "error", "error")
        return
      }
    } else {
      const url = this.msgUrlInput.value.trim()
      if (!url) {
        this.log("Please provide message URL", "error", "error")
        return
      }

      const match = url.match(/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/)
      if (!match) {
        this.log("Invalid message URL format", "error", "error")
        return
      }

      serverId = match[1]
      channelId = match[2]
      messageId = match[3]
    }

    this.messages.push({
      serverId,
      channelId,
      messageId,
    })

    this.msgServerIdInput.value = ""
    this.msgChannelIdInput.value = ""
    this.msgMessageIdInput.value = ""
    this.msgUrlInput.value = ""
    this.renderMessages()
  }

  renderMessages() {
    this.messagesBox.innerHTML = ""

    this.messages.forEach((msg, idx) => {
      const el = document.createElement("div")
      el.className = "msg-card"

      el.innerHTML = `
                <div class="msg-header">
                    <div class="msg-number">
                        <span class="material-icons">message</span>
                        <span>${idx + 1}</span>
                    </div>
                    <div class="msg-controls">
                        <button class="msg-control-btn" onclick="window.config.moveMessage(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>
                            <span class="material-icons">keyboard_arrow_up</span>
                        </button>
                        <button class="msg-control-btn" onclick="window.config.moveMessage(${idx}, 1)" ${idx === this.messages.length - 1 ? "disabled" : ""}>
                            <span class="material-icons">keyboard_arrow_down</span>
                        </button>
                        <button class="msg-control-btn delete" onclick="window.config.deleteMessage(${idx})">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
                <div class="account-details">
                    <div class="account-detail">
                        <span class="account-detail-label">Server ID</span>
                        <span class="account-detail-value">${msg.serverId}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Channel ID</span>
                        <span class="account-detail-value">${msg.channelId}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Message ID</span>
                        <span class="account-detail-value">${msg.messageId}</span>
                    </div>
                </div>
                <div class="account-token" onclick="this.select()">https://discord.com/channels/${msg.serverId}/${msg.channelId}/${msg.messageId}</div>
            `

      this.messagesBox.appendChild(el)
    })
  }

  moveMessage(idx, dir) {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= this.messages.length) return

    const temp = this.messages[idx]
    this.messages[idx] = this.messages[newIdx]
    this.messages[newIdx] = temp

    this.renderMessages()
  }

  deleteMessage(idx) {
    this.messages.splice(idx, 1)
    this.renderMessages()
  }

  log(msg, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const icons = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
    }

    entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="material-icons log-icon">${icons[icon] || icon}</span>
            <span class="log-msg">${msg}</span>
        `

    if (details) {
      entry.addEventListener("click", () => {
        const isExpanded = entry.classList.contains("expanded")
        if (isExpanded) {
          entry.classList.remove("expanded")
          entry.querySelector(".log-msg").textContent = msg
        } else {
          entry.classList.add("expanded")
          entry.querySelector(".log-msg").textContent = `${msg}\n${details}`
        }
      })
    }

    this.logs.appendChild(entry)
    this.logs.scrollTop = this.logs.scrollHeight
  }
}

class Select {
  constructor(element) {
    this.element = element
    this.display = element.querySelector(".select-display")
    this.options = element.querySelector(".select-options")
    this.optionElements = element.querySelectorAll(".select-option")
    this.value = this.optionElements[0]?.dataset.value || ""
    this.init()
  }

  init() {
    this.display.addEventListener("click", () => this.toggle())

    this.optionElements.forEach((option) => {
      option.addEventListener("click", () => {
        this.setValue(option.dataset.value)
        this.close()
      })
    })

    document.addEventListener("click", (e) => {
      if (!this.element.contains(e.target)) {
        this.close()
      }
    })
  }

  toggle() {
    this.display.classList.toggle("active")
    this.options.classList.toggle("active")
  }

  close() {
    this.display.classList.remove("active")
    this.options.classList.remove("active")
  }

  setValue(value) {
    this.value = value
    const option = Array.from(this.optionElements).find((opt) => opt.dataset.value === value)
    if (option) {
      this.display.querySelector(".select-value").textContent = option.textContent
    }
  }

  getValue() {
    return this.value
  }
}

class Sender {
  constructor() {
    this.patterns = []
    this.running = false
    this.intervals = []
    this.currentIdx = 0
    this.sendMode = null
    this.tokenCounters = new Map()
    this.init()
  }

  init() {
    this.msgInput = document.getElementById("msgInput")
    this.fileInput = document.getElementById("fileInput")
    this.fileSelectBtn = document.getElementById("fileSelectBtn")
    this.fileDisplay = document.getElementById("fileDisplay")
    this.fileName = document.getElementById("fileName")
    this.clearFileBtn = document.getElementById("clearFileBtn")
    this.addBtn = document.getElementById("addSendMsgBtn")
    this.patternsBox = document.getElementById("msgPatterns")
    this.sendMode = new Select(document.getElementById("sendModeSelect"))
    this.infiniteToggle = document.getElementById("infiniteMode")
    this.countInput = document.getElementById("msgCount")
    this.intervalInput = document.getElementById("msgInterval")
    this.startBtn = document.getElementById("startSendBtn")
    this.stopBtn = document.getElementById("stopSendBtn")
    this.logs = document.getElementById("senderLogs")
    this.countGroup = document.getElementById("countGroup")

    this.fileSelectBtn.addEventListener("click", () => this.fileInput.click())
    this.fileInput.addEventListener("change", () => this.handleFileSelect())
    this.clearFileBtn.addEventListener("click", () => this.clearFile())

    this.addBtn.addEventListener("click", () => this.addPattern())
    this.infiniteToggle.addEventListener("change", () => this.toggleInfinite())
    this.startBtn.addEventListener("click", () => this.start())
    this.stopBtn.addEventListener("click", () => this.stop())
  }

  handleFileSelect() {
    const file = this.fileInput.files[0]
    if (file) {
      this.fileName.textContent = file.name
      this.fileDisplay.style.display = "flex"
    }
  }

  clearFile() {
    this.fileInput.value = ""
    this.fileDisplay.style.display = "none"
    this.fileName.textContent = ""
  }

  toggleInfinite() {
    this.countGroup.style.display = this.infiniteToggle.checked ? "none" : "flex"
  }

  log(msg, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const icons = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      send: "send",
      message: "message",
    }

    entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="material-icons log-icon">${icons[icon] || icon}</span>
            <span class="log-msg">${msg}</span>
        `

    if (details) {
      entry.addEventListener("click", () => {
        const msgSpan = entry.querySelector(".log-msg")
        if (entry.classList.contains("expanded")) {
          msgSpan.textContent = msg
          entry.classList.remove("expanded")
        } else {
          msgSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.logs.appendChild(entry)
    this.logs.scrollTop = this.logs.scrollHeight
  }

  parseInput(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async processMsg(msg) {
    let processed = msg

    const raMatches = msg.match(/\/ra(\d*)\//g)
    if (raMatches) {
      for (const match of raMatches) {
        const lengthMatch = match.match(/\/ra(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2-api.vercel.app/api/random/alphanumeric?length=${length}`
          : "https://1tasu1ha2-api.vercel.app/api/random/alphanumeric"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.data.string || "")
        } catch (error) {
          this.log("Failed to get random alphanumeric", "error", "error", error.message)
        }
      }
    }

    const reMatches = msg.match(/\/re(\d*)\//g)
    if (reMatches) {
      for (const match of reMatches) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2-api.vercel.app/api/random/emoji?length=${length}`
          : "https://1tasu1ha2-api.vercel.app/api/random/emoji"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.data.string || "")
        } catch (error) {
          this.log("Failed to get random emoji", "error", "error", error.message)
        }
      }
    }

    const rmMatches = msg.match(/\/rm(\d*)\//g)
    if (rmMatches) {
      const memberIds = this.parseInput(document.getElementById("memberIds").value)

      if (!memberIds.length) {
        this.log("Please provide member IDs", "error", "error")
        return processed
      }

      for (const match of rmMatches) {
        const lengthMatch = match.match(/\/rm(\d+)\//)
        const count = lengthMatch ? Number.parseInt(lengthMatch[1]) : 1

        const mentions = []
        for (let i = 0; i < count && i < memberIds.length; i++) {
          const randomIdx = Math.floor(Math.random() * memberIds.length)
          mentions.push(`<@${memberIds[randomIdx]}>`)
        }

        processed = processed.replace(match, mentions.join(" "))
      }
    }

    return processed
  }

  addPattern() {
    const msg = this.msgInput.value.trim()

    if (!msg) {
      this.log("Please provide message", "error", "error")
      return
    }

    this.patterns.push(msg)
    this.msgInput.value = ""
    this.renderPatterns()
  }

  renderPatterns() {
    this.patternsBox.innerHTML = ""

    this.patterns.forEach((pattern, idx) => {
      const el = document.createElement("div")
      el.className = "msg-card"

      el.innerHTML = `
                <div class="msg-header">
                    <div class="msg-number">
                        <span class="material-icons">message</span>
                        <span>${idx + 1}</span>
                    </div>
                    <div class="msg-controls">
                        <button class="msg-control-btn" onclick="window.sender.movePattern(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>
                            <span class="material-icons">keyboard_arrow_up</span>
                        </button>
                        <button class="msg-control-btn" onclick="window.sender.movePattern(${idx}, 1)" ${idx === this.patterns.length - 1 ? "disabled" : ""}>
                            <span class="material-icons">keyboard_arrow_down</span>
                        </button>
                        <button class="msg-control-btn delete" onclick="window.sender.deletePattern(${idx})">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
                <div class="msg-content">${pattern}</div>
            `

      this.patternsBox.appendChild(el)
    })
  }

  movePattern(idx, direction) {
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= this.patterns.length) return

    const temp = this.patterns[idx]
    this.patterns[idx] = this.patterns[newIdx]
    this.patterns[newIdx] = temp

    this.renderPatterns()
  }

  deletePattern(idx) {
    this.patterns.splice(idx, 1)
    this.renderPatterns()
  }

  getNext() {
    if (!this.patterns.length) return null

    if (this.sendMode.getValue() === "random") {
      const randomIdx = Math.floor(Math.random() * this.patterns.length)
      return this.patterns[randomIdx]
    } else {
      const msg = this.patterns[this.currentIdx]
      this.currentIdx = (this.currentIdx + 1) % this.patterns.length
      return msg
    }
  }

  async send(token, channelId, msg, tokenNum, isInfinite, maxCount) {
    try {
      const tokenKey = `${tokenNum}`
      const currentCount = this.tokenCounters.get(tokenKey) || 0

      if (!isInfinite && currentCount >= maxCount) {
        return { success: false, count: currentCount, limitReached: true }
      }

      const processed = await this.processMsg(msg)

      const formData = new FormData()
      const payload = { content: processed }

      if (this.fileInput.files.length > 0) {
        const file = this.fileInput.files[0]
        formData.append("files[0]", file)
        formData.append("payload_json", JSON.stringify(payload))

        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        })

        if (response.ok) {
          this.tokenCounters.set(tokenKey, currentCount + 1)
          this.log("Sent message", "success", "message", processed)
          return { success: true, count: currentCount + 1 }
        } else {
          this.log("Failed to send", "error", "error")
          return { success: false, count: currentCount }
        }
      } else {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          this.tokenCounters.set(tokenKey, currentCount + 1)
          this.log("Sent message", "success", "message", processed)
          return { success: true, count: currentCount + 1 }
        } else {
          this.log(`Failed to send`, "error", "error")
          return { success: false, count: currentCount }
        }
      }
    } catch (error) {
      this.log(`Failed to send`, "error", "error", error.message)
      return { success: false, count: 0 }
    }
  }

  checkAllCompleted() {
    const tokens = this.parseInput(document.getElementById("configTokens").value)
    const count = Number.parseInt(this.countInput.value)

    for (let tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
      const tokenKey = `${tokenIdx + 1}`
      const currentCount = this.tokenCounters.get(tokenKey) || 0
      if (currentCount < count) {
        return false
      }
    }
    return true
  }

  async start() {
    if (this.running) return

    const tokens = this.parseInput(document.getElementById("configTokens").value)
    const channelIds = this.parseInput(document.getElementById("channelIds").value)
    const isInfinite = this.infiniteToggle.checked
    const count = isInfinite ? Number.POSITIVE_INFINITY : Number.parseInt(this.countInput.value)
    const interval = Number.parseInt(this.intervalInput.value)

    if (!tokens.length) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    if (!channelIds.length) {
      this.log("Please provide channel IDs", "error", "error")
      return
    }

    if (!this.patterns.length) {
      this.log("Please provide message patterns", "error", "error")
      return
    }

    if (count < 1) {
      this.log("Please provide count", "error", "error")
      return
    }

    if (interval < 0) {
      this.log("Please provide interval", "error", "error")
      return
    }

    this.running = true
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    this.currentIdx = 0
    this.tokenCounters.clear()

    const tokenDelay = Math.floor(interval / tokens.length)

    this.log(`Starting sender...`, "info", "play_circle")

    tokens.forEach((token, tokenIdx) => {
      setTimeout(() => {
        if (!this.running) return

        const sendInterval = setInterval(async () => {
          if (!this.running) {
            clearInterval(sendInterval)
            return
          }

          const tokenKey = `${tokenIdx + 1}`
          const currentCount = this.tokenCounters.get(tokenKey) || 0

          if (!isInfinite && currentCount >= count) {
            clearInterval(sendInterval)

            if (this.checkAllCompleted()) {
              setTimeout(() => this.stop(), 100)
            }
            return
          }

          const channelId = channelIds[Math.floor(Math.random() * channelIds.length)]
          const msg = this.getNext()

          if (msg) {
            const result = await this.send(token, channelId, msg, tokenIdx + 1, isInfinite, count)

            if (result.limitReached) {
              clearInterval(sendInterval)

              if (!isInfinite && this.checkAllCompleted()) {
                setTimeout(() => this.stop(), 100)
              }
            }
          }
        }, interval)

        this.intervals.push(sendInterval)
      }, tokenIdx * tokenDelay)
    })
  }

  stop() {
    if (!this.running) return

    this.running = false
    this.startBtn.disabled = false
    this.stopBtn.disabled = true

    this.log("Stopping sender...", "info", "stop_circle")

    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []

    this.log("Stopped sender", "success", "stop_circle")
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

class Replyer {
  constructor() {
    this.patterns = []
    this.running = false
    this.intervals = []
    this.currentIdx = 0
    this.currentReplyIdx = 0
    this.sendMode = null
    this.replyMode = null
    this.tokenCounters = new Map()
    this.init()
  }

  init() {
    this.msgInput = document.getElementById("replyMsgInput")
    this.fileInput = document.getElementById("replyFileInput")
    this.fileSelectBtn = document.getElementById("replyFileSelectBtn")
    this.fileDisplay = document.getElementById("replyFileDisplay")
    this.fileName = document.getElementById("replyFileName")
    this.clearFileBtn = document.getElementById("clearReplyFileBtn")
    this.addBtn = document.getElementById("addReplyMsgBtn")
    this.patternsBox = document.getElementById("replyMsgPatterns")
    this.sendMode = new Select(document.getElementById("replySendModeSelect"))
    this.replyMode = new Select(document.getElementById("replyModeSelect"))
    this.infiniteToggle = document.getElementById("replyInfiniteMode")
    this.countInput = document.getElementById("replyMsgCount")
    this.intervalInput = document.getElementById("replyMsgInterval")
    this.startBtn = document.getElementById("startReplyBtn")
    this.stopBtn = document.getElementById("stopReplyBtn")
    this.logs = document.getElementById("replyLogs")
    this.countGroup = document.getElementById("replyCountGroup")

    this.fileSelectBtn.addEventListener("click", () => this.fileInput.click())
    this.fileInput.addEventListener("change", () => this.handleFileSelect())
    this.clearFileBtn.addEventListener("click", () => this.clearFile())

    this.addBtn.addEventListener("click", () => this.addPattern())
    this.infiniteToggle = document.getElementById("replyInfiniteMode")
    this.infiniteToggle.addEventListener("change", () => this.toggleInfinite())
    this.startBtn.addEventListener("click", () => this.start())
    this.stopBtn.addEventListener("click", () => this.stop())
  }

  handleFileSelect() {
    const file = this.fileInput.files[0]
    if (file) {
      this.fileName.textContent = file.name
      this.fileDisplay = document.getElementById("replyFileDisplay")
      this.fileDisplay.style.display = "flex"
    }
  }

  clearFile() {
    this.fileInput.value = ""
    this.fileDisplay = document.getElementById("replyFileDisplay")
    this.fileDisplay.style.display = "none"
    this.fileName.textContent = ""
  }

  toggleInfinite() {
    this.countGroup.style.display = this.infiniteToggle.checked ? "none" : "flex"
  }

  log(msg, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const icons = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      send: "send",
      message: "message",
      reply: "reply",
    }

    entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="material-icons log-icon">${icons[icon] || icon}</span>
            <span class="log-msg">${msg}</span>
        `

    if (details) {
      entry.addEventListener("click", () => {
        const msgSpan = entry.querySelector(".log-msg")
        if (entry.classList.contains("expanded")) {
          msgSpan.textContent = msg
          entry.classList.remove("expanded")
        } else {
          msgSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.logs.appendChild(entry)
    this.logs.scrollTop = this.logs.scrollHeight
  }

  parseInput(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async processMsg(msg) {
    let processed = msg

    const raMatches = msg.match(/\/ra(\d*)\//g)
    if (raMatches) {
      for (const match of raMatches) {
        const lengthMatch = match.match(/\/ra(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2-api.vercel.app/api/random/alphanumeric?length=${length}`
          : "https://1tasu1ha2-api.vercel.app/api/random/alphanumeric"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.data.string || "")
        } catch (error) {
          this.log("Failed to get random alphanumeric", "error", "error", error.message)
        }
      }
    }

    const reMatches = msg.match(/\/re(\d*)\//g)
    if (reMatches) {
      for (const match of reMatches) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2-api.vercel.app/api/random/emoji?length=${length}`
          : "https://1tasu1ha2-api.vercel.app/api/random/emoji"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.data.string || "")
        } catch (error) {
          this.log("Failed to get random emoji", "error", "error", error.message)
        }
      }
    }

    const rmMatches = msg.match(/\/rm(\d*)\//g)
    if (rmMatches) {
      const memberIds = this.parseInput(document.getElementById("memberIds").value)

      if (!memberIds.length) {
        this.log("Please provide member IDs", "error", "error")
        return processed
      }

      for (const match of rmMatches) {
        const lengthMatch = match.match(/\/rm(\d+)\//)
        const count = lengthMatch ? Number.parseInt(lengthMatch[1]) : 1

        const mentions = []
        for (let i = 0; i < count && i < memberIds.length; i++) {
          const randomIdx = Math.floor(Math.random() * memberIds.length)
          mentions.push(`<@${memberIds[randomIdx]}>`)
        }

        processed = processed.replace(match, mentions.join(" "))
      }
    }

    return processed
  }

  addPattern() {
    const msg = this.msgInput.value.trim()

    if (!msg) {
      this.log("Please provide message", "error", "error")
      return
    }

    this.patterns.push(msg)
    this.msgInput.value = ""
    this.renderPatterns()
  }

  renderPatterns() {
    this.patternsBox = document.getElementById("replyMsgPatterns")
    this.patternsBox.innerHTML = ""

    this.patterns.forEach((pattern, idx) => {
      const el = document.createElement("div")
      el.className = "msg-card"

      el.innerHTML = `
                <div class="msg-header">
                    <div class="msg-number">
                        <span class="material-icons">message</span>
                        <span>${idx + 1}</span>
                    </div>
                    <div class="msg-controls">
                        <button class="msg-control-btn" onclick="window.replyer.movePattern(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>
                            <span class="material-icons">keyboard_arrow_up</span>
                        </button>
                        <button class="msg-control-btn" onclick="window.replyer.movePattern(${idx}, 1)" ${idx === this.patterns.length - 1 ? "disabled" : ""}>
                            <span class="material-icons">keyboard_arrow_down</span>
                        </button>
                        <button class="msg-control-btn delete" onclick="window.replyer.deletePattern(${idx})">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
                <div class="msg-content">${pattern}</div>
            `

      this.patternsBox.appendChild(el)
    })
  }

  movePattern(idx, direction) {
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= this.patterns.length) return

    const temp = this.patterns[idx]
    this.patterns[idx] = this.patterns[newIdx]
    this.patterns[newIdx] = temp

    this.renderPatterns()
  }

  deletePattern(idx) {
    this.patterns.splice(idx, 1)
    this.renderPatterns()
  }

  getNext() {
    if (!this.patterns.length) return null

    if (this.sendMode.getValue() === "random") {
      const randomIdx = Math.floor(Math.random() * this.patterns.length)
      return this.patterns[randomIdx]
    } else {
      const msg = this.patterns[this.currentIdx]
      this.currentIdx = (this.currentIdx + 1) % this.patterns.length
      return msg
    }
  }

  getNextReplyMessage() {
    const messages = window.config.messages
    if (!messages.length) return null

    if (this.replyMode.getValue() === "random") {
      const randomIdx = Math.floor(Math.random() * messages.length)
      return messages[randomIdx]
    } else {
      const message = messages[this.currentReplyIdx]
      this.currentReplyIdx = (this.currentReplyIdx + 1) % messages.length
      return message
    }
  }

  async sendReply(token, msg, tokenNum, isInfinite, maxCount) {
    try {
      const replyMessage = this.getNextReplyMessage()
      if (!replyMessage) {
        this.log("Messages not found", "error", "error")
        return { success: false, count: 0 }
      }

      const tokenKey = `${tokenNum}`
      const currentCount = this.tokenCounters.get(tokenKey) || 0

      if (!isInfinite && currentCount >= maxCount) {
        return { success: false, count: currentCount, limitReached: true }
      }

      const processed = await this.processMsg(msg)

      const formData = new FormData()
      const payload = {
        content: processed,
        message_reference: {
          guild_id: replyMessage.serverId,
          channel_id: replyMessage.channelId,
          message_id: replyMessage.messageId,
        },
      }

      if (this.fileInput.files.length > 0) {
        const file = this.fileInput.files[0]
        formData.append("files[0]", file)
        formData.append("payload_json", JSON.stringify(payload))

        const response = await fetch(`https://discord.com/api/v10/channels/${replyMessage.channelId}/messages`, {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        })

        if (response.ok) {
          this.tokenCounters.set(tokenKey, currentCount + 1)
          this.log("Sent message", "success", "message", processed)
          return { success: true, count: currentCount + 1 }
        } else {
          this.log("Failed to send", "error", "error")
          return { success: false, count: currentCount }
        }
      } else {
        const response = await fetch(`https://discord.com/api/v10/channels/${replyMessage.channelId}/messages`, {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          this.tokenCounters.set(tokenKey, currentCount + 1)
          this.log("Sent message", "success", "message", processed)
          return { success: true, count: currentCount + 1 }
        } else {
          this.log("Failed to send", "error", "error")
          return { success: false, count: currentCount }
        }
      }
    } catch (error) {
      this.log("Failed to send", "error", "error", error.message)
      return { success: false, count: 0 }
    }
  }

  checkAllCompleted() {
    const tokens = this.parseInput(document.getElementById("configTokens").value)
    const count = Number.parseInt(this.countInput.value)

    for (let tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
      const tokenKey = `${tokenIdx + 1}`
      const currentCount = this.tokenCounters.get(tokenKey) || 0
      if (currentCount < count) {
        return false
      }
    }
    return true
  }

  async start() {
    if (this.running) return

    const tokens = this.parseInput(document.getElementById("configTokens").value)
    const messages = window.config.messages
    const isInfinite = this.infiniteToggle.checked
    const count = isInfinite ? Number.POSITIVE_INFINITY : Number.parseInt(this.countInput.value)
    const interval = Number.parseInt(this.intervalInput.value)

    if (!tokens.length) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    if (!messages.length) {
      this.log("Please add messages", "error", "error")
      return
    }

    if (!this.patterns.length) {
      this.log("Please provide message patterns", "error", "error")
      return
    }

    if (count < 1) {
      this.log("Please provide count", "error", "error")
      return
    }

    if (interval < 0) {
      this.log("Please provide interval", "error", "error")
      return
    }

    this.running = true
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    this.currentIdx = 0
    this.currentReplyIdx = 0
    this.tokenCounters.clear()

    const tokenDelay = Math.floor(interval / tokens.length)

    this.log(`Starting replyer...`, "info", "play_circle")

    tokens.forEach((token, tokenIdx) => {
      setTimeout(() => {
        if (!this.running) return

        const sendInterval = setInterval(async () => {
          if (!this.running) {
            clearInterval(sendInterval)
            return
          }

          const tokenKey = `${tokenIdx + 1}`
          const currentCount = this.tokenCounters.get(tokenKey) || 0

          if (!isInfinite && currentCount >= count) {
            clearInterval(sendInterval)

            if (this.checkAllCompleted()) {
              setTimeout(() => this.stop(), 100)
            }
            return
          }

          const msg = this.getNext()
          if (msg) {
            const result = await this.sendReply(token, msg, tokenIdx + 1, isInfinite, count)

            if (result.limitReached) {
              clearInterval(sendInterval)

              if (!isInfinite && this.checkAllCompleted()) {
                setTimeout(() => this.stop(), 100)
              }
            }
          }
        }, interval)

        this.intervals.push(sendInterval)
      }, tokenIdx * tokenDelay)
    })
  }

  stop() {
    if (!this.running) return

    this.running = false
    this.startBtn.disabled = false
    this.stopBtn.disabled = true

    this.log("Stopping replyer...", "info", "stop_circle")

    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []

    this.log("Stopped replyer", "success", "stop_circle")
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.checker = new Checker()
  window.config = new Config()
  window.sender = new Sender()
  window.replyer = new Replyer()
})
