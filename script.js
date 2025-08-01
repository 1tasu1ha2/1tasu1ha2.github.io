const helpTexts = {
  tokens:
    "Enter Discord bot tokens or user tokens, one per line.\nThese will be validated to check if they're working.",
  configTokens:
    "Enter Discord tokens that will be used for fetching channels and sending messages.\nOne token per line.",
  serverId: "Enter the Discord server (guild) ID where you want to fetch channels or send messages.",
  channelIds:
    "Enter Discord channel IDs where messages will be sent, one per line.\nUse 'Get Channels' to automatically fetch them.",
  mentionIds:
    "Enter user IDs that can be mentioned in messages, one per line.\nUse 'Get Mentions' to automatically fetch server members.",
  messageInput:
    "Enter your message pattern.\nSupports /rs/ for random strings, /re/ for random emojis, and /rm/ for random mentions.",
  sendMode:
    "Choose how messages are selected:\nRandom picks a random pattern each time, Sequential goes through patterns in order.",
  infiniteToggle:
    "When enabled, messages will be sent continuously until stopped.\nWhen disabled, only the specified count will be sent.",
  messageCount: "Number of messages to send per token per channel.\nOnly used when Infinite Mode is disabled.",
  messageInterval: "Time interval in milliseconds between each message.\nMinimum is 100ms to avoid rate limits.",
  name: "Enter the name for Godfield bots.\nSupports /rs/ for random strings and /re/ for random emojis.",
  room: "Enter the room password for Godfield.\nThis will be used to create and join rooms.",
  message:
    "Enter the message that Godfield bots will send.\nSupports /rs/ for random strings and /re/ for random emojis.",
  botCount: "Number of Godfield bots to create and run simultaneously.\nMust be between 1 and 12.",
}

const boxNames = {
  tokens: "Token Checker",
  configTokens: "Config",
  serverId: "Config",
  channelIds: "Config",
  mentionIds: "Config",
  messageInput: "Sender",
  sendMode: "Sender",
  infiniteToggle: "Sender",
  messageCount: "Sender",
  messageInterval: "Sender",
  name: "Godfielder",
  room: "Godfielder",
  message: "Godfielder",
  botCount: "Godfielder",
}

const fieldNames = {
  tokens: "Tokens",
  configTokens: "Tokens",
  serverId: "Server ID",
  channelIds: "Channel IDs",
  mentionIds: "Mention IDs",
  messageInput: "Message",
  sendMode: "Send Mode",
  infiniteToggle: "Infinite Mode",
  messageCount: "Count",
  messageInterval: "Interval",
  name: "Name",
  room: "Room",
  message: "Message",
  botCount: "Bot Count",
}

function showHelp(field) {
  const modal = document.getElementById("helpModal")
  const title = document.getElementById("helpTitle")
  const content = document.getElementById("helpContent")

  const boxName = boxNames[field] || "Unknown"
  const fieldName = fieldNames[field] || field
  title.textContent = `${boxName} - ${fieldName} Help`

  const helpText = helpTexts[field] || "No help available for this field."
  content.textContent = helpText

  modal.style.display = "block"
}

function closeHelp() {
  document.getElementById("helpModal").style.display = "none"
}

window.onclick = (event) => {
  const modal = document.getElementById("helpModal")
  if (event.target === modal) {
    closeHelp()
  }
}

class CustomSelect {
  constructor(element) {
    this.element = element
    this.display = element.querySelector(".select-display")
    this.options = element.querySelector(".select-options")
    this.value = "random"

    this.bindEvents()
  }

  bindEvents() {
    this.display.addEventListener("click", () => this.toggle())

    this.options.querySelectorAll(".select-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        this.selectOption(e.target.dataset.value, e.target.textContent)
      })
    })

    document.addEventListener("click", (e) => {
      if (!this.element.contains(e.target)) {
        this.close()
      }
    })
  }

  toggle() {
    const isActive = this.display.classList.contains("active")
    if (isActive) {
      this.close()
    } else {
      this.open()
    }
  }

  open() {
    this.display.classList.add("active")
    this.options.classList.add("active")
  }

  close() {
    this.display.classList.remove("active")
    this.options.classList.remove("active")
  }

  selectOption(value, text) {
    this.value = value
    this.display.querySelector(".select-value").textContent = text
    this.close()
  }

  getValue() {
    return this.value
  }
}

class TokenChecker {
  constructor() {
    this.validTokens = []
    this.initElements()
    this.bindEvents()
  }

  initElements() {
    this.tokensInput = document.getElementById("tokens")
    this.checkBtn = document.getElementById("checkBtn")
    this.copyValidBtn = document.getElementById("copyValidBtn")
    this.resultsBox = document.getElementById("resultsBox")
  }

  bindEvents() {
    this.checkBtn.addEventListener("click", () => this.checkTokens())
    this.copyValidBtn.addEventListener("click", () => this.copyValidTokens())
  }

  async checkTokens() {
    const tokens = this.tokensInput.value
      .split("\n")
      .map((token) => token.trim())
      .filter((token) => token.length > 0)

    if (tokens.length === 0) {
      this.showError("Please provide tokens")
      return
    }

    this.checkBtn.disabled = true
    this.copyValidBtn.disabled = true
    this.resultsBox.innerHTML = ""
    this.validTokens = []

    for (const token of tokens) {
      await this.checkSingleToken(token)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.checkBtn.disabled = false
    if (this.validTokens.length > 0) {
      this.copyValidBtn.disabled = false
    }
  }

  async checkSingleToken(token) {
    try {
      const response = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: `Bot ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        this.displayAccount(token, data, true)
        this.validTokens.push(token)
        return
      }

      const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: token,
        },
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        this.displayAccount(token, userData, false)
        this.validTokens.push(token)
      } else {
        this.displayInvalidToken(token)
      }
    } catch (error) {
      this.displayInvalidToken(token, error.message)
    }
  }

  displayAccount(token, data, isBot) {
    const card = document.createElement("div")
    card.className = "account-card"

    const avatarUrl = data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${(Number.parseInt(data.discriminator) || 0) % 5}.png`

    const globalName = data.global_name || "None"
    const username = data.username || "Unknown"
    const email = !isBot && data.email ? data.email : "None"
    const phone = !isBot && data.phone ? data.phone : "None"

    card.innerHTML = `
      <div class="account-header">
        <img src="${avatarUrl}" alt="Avatar" class="account-avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <div class="account-basic">
          <div class="account-name">${globalName !== "None" ? globalName : username}</div>
          <span class="account-type ${isBot ? "bot" : "user"}">${isBot ? "BOT" : "USER"}</span>
        </div>
      </div>
      <div class="account-details">
        <div class="account-detail">
          <span class="account-detail-label">ID</span>
          <span class="account-detail-value">${data.id}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">Global Name</span>
          <span class="account-detail-value">${globalName}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">Username</span>
          <span class="account-detail-value">${username}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">Email</span>
          <span class="account-detail-value">${email}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">Phone</span>
          <span class="account-detail-value">${phone}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">Verified</span>
          <span class="account-detail-value">${data.verified ? "Yes" : "No"}</span>
        </div>
      </div>
      <div class="account-token" onclick="navigator.clipboard.writeText('${token}')" title="Click to copy token">
        ${token}
      </div>
    `

    this.resultsBox.appendChild(card)
  }

  displayInvalidToken(token, error = "Invalid token") {
    const card = document.createElement("div")
    card.className = "account-card"
    card.style.borderColor = "rgba(255, 71, 87, 0.5)"

    card.innerHTML = `
      <div class="account-header">
        <div style="width: 40px; height: 40px; background: rgba(255, 71, 87, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span class="material-icons" style="color: #ff4757; font-size: 1.2rem;">error</span>
        </div>
        <div class="account-basic">
          <div class="account-name">Invalid Token</div>
          <span class="account-type" style="background: rgba(255, 71, 87, 0.2); color: #ff4757;">ERROR</span>
        </div>
      </div>
      <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.8rem;">
        ${error}
      </div>
      <div class="account-token" style="border-color: rgba(255, 71, 87, 0.3);">
        ${token}
      </div>
    `

    this.resultsBox.appendChild(card)
  }

  copyValidTokens() {
    if (this.validTokens.length === 0) return

    const tokensText = this.validTokens.join("\n")
    navigator.clipboard.writeText(tokensText).then(() => {
      const originalText = this.copyValidBtn.innerHTML
      this.copyValidBtn.innerHTML = '<span class="material-icons">check</span>Copied!'
      setTimeout(() => {
        this.copyValidBtn.innerHTML = originalText
      }, 2000)
    })
  }

  showError(message) {
    this.resultsBox.innerHTML = `
      <div style="text-align: center; color: #ff4757; padding: 2rem;">
        <span class="material-icons" style="font-size: 2rem; margin-bottom: 0.5rem;">error</span>
        <div>${message}</div>
      </div>
    `
  }
}

class Config {
  constructor() {
    this.initElements()
    this.bindEvents()
    this.allMembers = new Set()
    this.ws = null
    this.currentToken = null
    this.currentTokenIndex = 0
    this.serverId = null
    this.channelIds = []
    this.currentChannelIndex = 0
    this.memberFetchTimeout = null
    this.fetchingLogEntry = null
  }

  initElements() {
    this.configTokensInput = document.getElementById("configTokens")
    this.serverIdInput = document.getElementById("serverId")
    this.channelIdsInput = document.getElementById("channelIds")
    this.mentionIdsInput = document.getElementById("mentionIds")
    this.fetchChannelsBtn = document.getElementById("fetchChannelsBtn")
    this.fetchMentionsBtn = document.getElementById("fetchMentionsBtn")
    this.validateTokensBtn = document.getElementById("validateTokensBtn")
    this.configLogBox = document.getElementById("configLogBox")
  }

  bindEvents() {
    this.fetchChannelsBtn.addEventListener("click", () => this.fetchChannels())
    this.fetchMentionsBtn.addEventListener("click", () => this.fetchMentions())
    this.validateTokensBtn.addEventListener("click", () => this.validateTokens())
  }

  log(message, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const iconMap = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      list: "list",
      alternate_email: "alternate_email",
    }

    entry.innerHTML = `
      <span class="log-time">${time}</span>
      <span class="material-icons log-icon">${iconMap[icon] || icon}</span>
      <span class="log-message">${message}</span>
    `

    if (details) {
      entry.addEventListener("click", () => {
        const messageSpan = entry.querySelector(".log-message")
        if (entry.classList.contains("expanded")) {
          messageSpan.textContent = message
          entry.classList.remove("expanded")
        } else {
          messageSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.configLogBox.appendChild(entry)
    this.configLogBox.scrollTop = this.configLogBox.scrollHeight
    return entry
  }

  parseList(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async fetchChannels() {
    const tokens = this.parseList(this.configTokensInput.value)
    const serverId = this.serverIdInput.value.trim()

    if (!tokens.length) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    if (!serverId) {
      this.log("Please provide server ID", "error", "error")
      return
    }

    this.fetchChannelsBtn.disabled = true
    this.log("Getting channels...", "info", "list")

    for (const token of tokens) {
      try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
          headers: {
            Authorization: token,
          },
        })

        if (response.ok) {
          const channels = await response.json()
          const textChannels = channels.filter((channel) => channel.type === 0)
          const channelIds = textChannels.map((channel) => channel.id)
          this.channelIdsInput.value = channelIds.join("\n")
          this.log(`Got ${channelIds.length} channels`, "success", "check_circle")
          break
        } else {
          this.log(`Token failed: ${response.status}`, "warning", "warning")
        }
      } catch (error) {
        this.log("Request failed", "error", "error", error.message)
      }
    }

    this.fetchChannelsBtn.disabled = false
  }

  async fetchMentions() {
    const tokens = this.parseList(this.configTokensInput.value)
    const serverId = this.serverIdInput.value.trim()
    const channelIds = this.parseList(this.channelIdsInput.value)

    if (!tokens.length) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    if (!serverId) {
      this.log("Please provide server ID", "error", "error")
      return
    }

    if (!channelIds.length) {
      this.log("Please provide channel IDs", "error", "error")
      return
    }

    this.fetchMentionsBtn.disabled = true
    this.allMembers.clear()
    this.serverId = serverId
    this.channelIds = channelIds
    this.currentTokenIndex = 0
    this.currentChannelIndex = 0

    this.log("Getting members...", "info", "alternate_email")

    let success = false
    for (let tokenIndex = 0; tokenIndex < tokens.length && !success; tokenIndex++) {
      this.currentToken = tokens[tokenIndex]
      this.currentTokenIndex = tokenIndex

      for (let channelIndex = 0; channelIndex < channelIds.length && !success; channelIndex++) {
        this.currentChannelIndex = channelIndex
        this.allMembers.clear()

        success = await this.connectWebSocket()
        if (success && this.allMembers.size > 0) {
          break
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      if (success && this.allMembers.size > 0) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    if (this.allMembers.size === 0) {
      this.log("Members not found", "warning", "warning")
    }

    this.fetchMentionsBtn.disabled = false
  }

  connectWebSocket() {
    return new Promise((resolve) => {
      if (this.ws) {
        this.ws.close()
      }

      this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json")
      let heartbeatInterval = null
      let hasConnected = false

      this.ws.onopen = () => {}

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        switch (data.op) {
          case 10:
            const heartbeatIntervalMs = data.d.heartbeat_interval
            heartbeatInterval = setInterval(() => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ op: 1, d: null }))
              }
            }, heartbeatIntervalMs)

            this.ws.send(
              JSON.stringify({
                op: 2,
                d: {
                  token: this.currentToken,
                  properties: {
                    os: "Windows",
                    browser: "Discord Client",
                    device: "desktop",
                  },
                  intents: 513,
                },
              }),
            )
            break

          case 0:
            if (data.t === "READY") {
              hasConnected = true
              this.requestMemberChunk()
            } else if (data.t === "GUILD_MEMBER_LIST_UPDATE") {
              this.processMemberListUpdate(data.d)
            } else if (data.t === "GUILD_MEMBERS_CHUNK") {
              this.processMemberChunk(data.d)
            }
            break

          case 9:
            if (heartbeatInterval) clearInterval(heartbeatInterval)
            this.ws.close()
            break
        }
      }

      this.ws.onerror = (error) => {
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        resolve(false)
      }

      this.ws.onclose = (event) => {
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        if (this.memberFetchTimeout) clearTimeout(this.memberFetchTimeout)

        if (!hasConnected) {
          resolve(false)
        } else {
          this.finalizeMemberCollection()
          resolve(true)
        }
      }

      setTimeout(() => {
        if (!hasConnected) {
          this.ws.close()
          resolve(false)
        }
      }, 10000)
    })
  }

  requestMemberChunk() {
    const channelId = this.channelIds[this.currentChannelIndex]

    this.ws.send(
      JSON.stringify({
        op: 14,
        d: {
          guild_id: this.serverId,
          typing: false,
          activities: false,
          threads: false,
          channels: {
            [channelId]: [[0, 99]],
          },
        },
      }),
    )

    this.memberFetchTimeout = setTimeout(() => {
      this.ws.close()
    }, 5000)
  }

  processMemberListUpdate(data) {
    if (data.ops) {
      data.ops.forEach((op) => {
        if (op.items) {
          op.items.forEach((item) => {
            if (item.member && item.member.user && !item.member.user.bot) {
              this.allMembers.add(item.member.user.id)
            }
          })
        }
      })
    }

    if (this.memberFetchTimeout) {
      clearTimeout(this.memberFetchTimeout)
    }

    this.memberFetchTimeout = setTimeout(() => {
      this.ws.close()
    }, 2000)
  }

  processMemberChunk(data) {
    if (data.members) {
      data.members.forEach((member) => {
        if (member.user && !member.user.bot) {
          this.allMembers.add(member.user.id)
        }
      })
    }
  }

  finalizeMemberCollection() {
    if (this.allMembers.size > 0) {
      this.mentionIdsInput.value = Array.from(this.allMembers).join("\n")
      const details = `Token: ${this.currentTokenIndex + 1}/${this.parseList(this.configTokensInput.value).length}, Channel: ${this.currentChannelIndex + 1}/${this.channelIds.length}`
      this.log(`Got ${this.allMembers.size} members`, "success", "check_circle", details)
    } else {
      this.log("Members not found", "warning", "warning")
    }
  }

  async validateTokens() {
    const configTokens = this.parseList(this.configTokensInput.value)

    if (configTokens.length === 0) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    document.getElementById("tokens").value = configTokens.join("\n")

    this.log("Validating tokens...", "info", "info")

    const tokenChecker = window.tokenCheckerInstance
    await tokenChecker.checkTokens()

    if (tokenChecker.validTokens.length > 0) {
      this.configTokensInput.value = tokenChecker.validTokens.join("\n")
      this.log(`Validated ${tokenChecker.validTokens.length} valid tokens`, "success", "check_circle")
    } else {
      this.configTokensInput.value = ""
      this.log("Valid tokens not found", "warning", "warning")
    }
  }
}

class Sender {
  constructor() {
    this.messagePatterns = []
    this.isRunning = false
    this.sendIntervals = []
    this.currentMessageIndex = 0
    this.sendModeSelect = null
    this.initElements()
    this.bindEvents()
  }

  initElements() {
    this.messageInput = document.getElementById("messageInput")
    this.addMessageBtn = document.getElementById("addMessageBtn")
    this.messagePatternsBox = document.getElementById("messagePatterns")
    this.sendModeSelect = new CustomSelect(document.getElementById("sendModeSelect"))
    this.infiniteToggle = document.getElementById("infiniteToggle")
    this.messageCountInput = document.getElementById("messageCount")
    this.messageIntervalInput = document.getElementById("messageInterval")
    this.startSendBtn = document.getElementById("startSendBtn")
    this.stopSendBtn = document.getElementById("stopSendBtn")
    this.senderLogBox = document.getElementById("senderLogBox")
    this.countGroup = document.getElementById("countGroup")
  }

  bindEvents() {
    this.addMessageBtn.addEventListener("click", () => this.addMessage())
    this.infiniteToggle.addEventListener("change", () => this.toggleInfiniteMode())
    this.startSendBtn.addEventListener("click", () => this.startSending())
    this.stopSendBtn.addEventListener("click", () => this.stopSending())
  }

  toggleInfiniteMode() {
    if (this.infiniteToggle.checked) {
      this.countGroup.style.display = "none"
    } else {
      this.countGroup.style.display = "flex"
    }
  }

  log(message, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const iconMap = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      send: "send",
    }

    entry.innerHTML = `
      <span class="log-time">${time}</span>
      <span class="material-icons log-icon">${iconMap[icon] || icon}</span>
      <span class="log-message">${message}</span>
    `

    if (details) {
      entry.addEventListener("click", () => {
        const messageSpan = entry.querySelector(".log-message")
        if (entry.classList.contains("expanded")) {
          messageSpan.textContent = message
          entry.classList.remove("expanded")
        } else {
          messageSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.senderLogBox.appendChild(entry)
    this.senderLogBox.scrollTop = this.senderLogBox.scrollHeight
  }

  parseList(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async processMessage(message) {
    let processedMessage = message

    const rsMatch = message.match(/\/rs(\d*)\//g)
    if (rsMatch) {
      for (const match of rsMatch) {
        const lengthMatch = match.match(/\/rs(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-string?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-string"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processedMessage = processedMessage.replace(match, data.result || "")
        } catch (error) {
          this.log("String API failed", "error", "error", error.message)
        }
      }
    }

    const reMatch = message.match(/\/re(\d*)\//g)
    if (reMatch) {
      for (const match of reMatch) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-emoji?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-emoji"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processedMessage = processedMessage.replace(match, data.result || "")
        } catch (error) {
          this.log("Emoji API failed", "error", "error", error.message)
        }
      }
    }

    const rmMatch = message.match(/\/rm(\d*)\//g)
    if (rmMatch) {
      const mentionIds = this.parseList(document.getElementById("mentionIds").value)

      if (mentionIds.length === 0) {
        this.log("Please provide mention IDs", "error", "error")
        return processedMessage
      }

      for (const match of rmMatch) {
        const lengthMatch = match.match(/\/rm(\d+)\//)
        const count = lengthMatch ? Number.parseInt(lengthMatch[1]) : 1

        const selectedMentions = []
        for (let i = 0; i < count && i < mentionIds.length; i++) {
          const randomIndex = Math.floor(Math.random() * mentionIds.length)
          selectedMentions.push(`<@${mentionIds[randomIndex]}>`)
        }

        processedMessage = processedMessage.replace(match, selectedMentions.join(" "))
      }
    }

    return processedMessage
  }

  addMessage() {
    const message = this.messageInput.value.trim()

    if (!message) {
      this.log("Please provide message", "error", "error")
      return
    }

    this.messagePatterns.push(message)
    this.messageInput.value = ""
    this.renderMessagePatterns()
  }

  renderMessagePatterns() {
    this.messagePatternsBox.innerHTML = ""

    this.messagePatterns.forEach((pattern, index) => {
      const patternElement = document.createElement("div")
      patternElement.className = "message-pattern"

      patternElement.innerHTML = `
        <div class="message-header">
          <span class="message-number">${index + 1}</span>
          <div class="message-controls">
            <button class="message-control-btn" onclick="window.senderInstance.moveMessage(${index}, -1)" ${index === 0 ? "disabled" : ""}>
              <span class="material-icons" style="font-size: 1rem;">keyboard_arrow_up</span>
            </button>
            <button class="message-control-btn" onclick="window.senderInstance.moveMessage(${index}, 1)" ${index === this.messagePatterns.length - 1 ? "disabled" : ""}>
              <span class="material-icons" style="font-size: 1rem;">keyboard_arrow_down</span>
            </button>
            <button class="message-control-btn delete" onclick="window.senderInstance.deleteMessage(${index})">
              <span class="material-icons" style="font-size: 1rem;">delete</span>
            </button>
          </div>
        </div>
        <div class="message-content">${pattern}</div>
      `

      this.messagePatternsBox.appendChild(patternElement)
    })
  }

  moveMessage(index, direction) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= this.messagePatterns.length) return

    const temp = this.messagePatterns[index]
    this.messagePatterns[index] = this.messagePatterns[newIndex]
    this.messagePatterns[newIndex] = temp

    this.renderMessagePatterns()
  }

  deleteMessage(index) {
    this.messagePatterns.splice(index, 1)
    this.renderMessagePatterns()
  }

  getNextMessage() {
    if (this.messagePatterns.length === 0) return null

    if (this.sendModeSelect.getValue() === "random") {
      const randomIndex = Math.floor(Math.random() * this.messagePatterns.length)
      return this.messagePatterns[randomIndex]
    } else {
      const message = this.messagePatterns[this.currentMessageIndex]
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messagePatterns.length
      return message
    }
  }

  async sendMessage(token, channelId, message) {
    try {
      const processedMessage = await this.processMessage(message)

      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: processedMessage,
        }),
      })

      if (response.ok) {
        return true
      } else {
        this.log(`Send failed: ${response.status}`, "error", "error")
        return false
      }
    } catch (error) {
      this.log("Send failed", "error", "error", error.message)
      return false
    }
  }

  async startSending() {
    if (this.isRunning) return

    const tokens = this.parseList(document.getElementById("configTokens").value)
    const channelIds = this.parseList(document.getElementById("channelIds").value)
    const isInfinite = this.infiniteToggle.checked
    const count = isInfinite ? Number.POSITIVE_INFINITY : Number.parseInt(this.messageCountInput.value)
    const interval = Number.parseInt(this.messageIntervalInput.value)

    if (!tokens.length) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    if (!channelIds.length) {
      this.log("Please provide channel IDs", "error", "error")
      return
    }

    if (this.messagePatterns.length === 0) {
      this.log("Please provide message patterns", "error", "error")
      return
    }

    if (count < 1) {
      this.log("Please provide valid count", "error", "error")
      return
    }

    if (interval < 100) {
      this.log("Please provide valid interval", "error", "error")
      return
    }

    this.isRunning = true
    this.startSendBtn.disabled = true
    this.stopSendBtn.disabled = false
    this.currentMessageIndex = 0

    const tokenDelay = Math.floor(interval / tokens.length)
    const totalMessages = isInfinite ? "∞" : tokens.length * channelIds.length * count

    this.log(`Starting sender (${totalMessages} messages)`, "info", "send")

    tokens.forEach((token, tokenIndex) => {
      setTimeout(() => {
        if (!this.isRunning) return

        channelIds.forEach((channelId) => {
          let sentCount = 0

          const sendInterval = setInterval(async () => {
            if (!this.isRunning || (!isInfinite && sentCount >= count)) {
              clearInterval(sendInterval)
              return
            }

            const message = this.getNextMessage()
            if (message) {
              const success = await this.sendMessage(token, channelId, message)
              if (success) {
                sentCount++
                this.log(`Sent ${sentCount}/${isInfinite ? "∞" : count}`, "success", "check_circle")
              }
            }
          }, interval)

          this.sendIntervals.push(sendInterval)
        })
      }, tokenIndex * tokenDelay)
    })
  }

  stopSending() {
    if (!this.isRunning) return

    this.isRunning = false
    this.startSendBtn.disabled = false
    this.stopSendBtn.disabled = true

    this.sendIntervals.forEach((interval) => clearInterval(interval))
    this.sendIntervals = []

    this.log("Sender stopped", "warning", "warning")
  }
}

class Godfielder {
  constructor() {
    this.isRunning = false
    this.bots = []
    this.intervalIds = []
    this.initElements()
    this.bindEvents()
  }

  initElements() {
    this.nameInput = document.getElementById("name")
    this.roomInput = document.getElementById("room")
    this.messageInput = document.getElementById("message")
    this.botCountInput = document.getElementById("botCount")
    this.startBtn = document.getElementById("startBtn")
    this.stopBtn = document.getElementById("stopBtn")
    this.logBox = document.getElementById("logBox")
  }

  bindEvents() {
    this.startBtn.addEventListener("click", () => this.start())
    this.stopBtn.addEventListener("click", () => this.stop())
  }

  log(message, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const iconMap = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      bot: "smart_toy",
      message: "message",
      room: "meeting_room",
    }

    entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="material-icons log-icon">${iconMap[icon] || icon}</span>
            <span class="log-message">${message}</span>
        `

    if (details) {
      entry.addEventListener("click", () => {
        const messageSpan = entry.querySelector(".log-message")
        if (entry.classList.contains("expanded")) {
          messageSpan.textContent = message
          entry.classList.remove("expanded")
        } else {
          messageSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.logBox.appendChild(entry)
    this.logBox.scrollTop = this.logBox.scrollHeight
  }

  async processText(text, botId) {
    let processedText = text

    const reMatch = text.match(/\/re(\d*)\//g)
    if (reMatch) {
      for (const match of reMatch) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-emoji?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-emoji"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processedText = processedText.replace(match, data.result || "")
        } catch (error) {
          this.log(`Bot ${botId}: Emoji failed`, "error", "error", error.message)
        }
      }
    }

    const rsMatch = text.match(/\/rs(\d*)\//g)
    if (rsMatch) {
      for (const match of rsMatch) {
        const lengthMatch = match.match(/\/rs(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-string?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-string"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processedText = processedText.replace(match, data.result || "")
        } catch (error) {
          this.log(`Bot ${botId}: String failed`, "error", "error", error.message)
        }
      }
    }

    return processedText
  }

  async createBot(botId, name, room, message) {
    try {
      this.log(`Bot ${botId}: Connecting...`, "info", "bot")

      const tokenRes = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCBvMvZkHymK04BfEaERtbmELhyL8-mtAg",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnSecureToken: true }),
        },
      )

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text()
        throw new Error(`Auth failed: ${tokenRes.status} - ${errorText}`)
      }

      const tokenData = await tokenRes.json()
      const token = tokenData.idToken

      this.log(`Bot ${botId}: Connected`, "success", "check_circle")

      const processedName = await this.processText(name, botId)

      this.log(`Bot ${botId}: Creating room...`, "info", "room")
      const roomRes = await fetch("https://asia-northeast1-godfield.cloudfunctions.net/createRoom", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "hidden",
          password: room,
          userName: processedName,
        }),
      })

      if (!roomRes.ok) {
        const errorText = await roomRes.text()
        throw new Error(`Room creation failed: ${roomRes.status} - ${errorText}`)
      }

      const roomData = await roomRes.json()
      const roomId = roomData.roomId

      this.log(`Bot ${botId}: Room created`, "success", "check_circle", `Room ID: ${roomId}`)

      this.log(`Bot ${botId}: Joining room...`, "info", "room")
      const joinRes = await fetch("https://asia-northeast1-godfield.cloudfunctions.net/addRoomUser", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "hidden",
          roomId: roomId,
          userName: processedName,
        }),
      })

      if (!joinRes.ok) {
        const errorText = await joinRes.text()
        throw new Error(`Room join failed: ${joinRes.status} - ${errorText}`)
      }

      this.log(`Bot ${botId}: Room joined`, "success", "check_circle")

      return { token, roomId, processedName }
    } catch (error) {
      this.log(`Bot ${botId}: Setup failed`, "error", "error", error.message)
      return null
    }
  }

  async sendMessage(botId, token, roomId, message) {
    try {
      const processedMessage = await this.processText(message, botId)

      const response = await fetch("https://asia-northeast1-godfield.cloudfunctions.net/setComment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "hidden",
          roomId: roomId,
          text: processedMessage,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Message send failed: ${response.status} - ${errorText}`)
      }

      this.log(`Bot ${botId}: Message sent`, "success", "message", `Message: "${processedMessage}"`)
      return true
    } catch (error) {
      this.log(`Bot ${botId}: Send failed`, "error", "error", error.message)
      return false
    }
  }

  async removeBot(botId, token, roomId) {
    try {
      this.log(`Bot ${botId}: Leaving room...`, "info", "room")

      const response = await fetch("https://asia-northeast1-godfield.cloudfunctions.net/removeRoomUser", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "hidden",
          roomId: roomId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Room leave failed: ${response.status} - ${errorText}`)
      }

      this.log(`Bot ${botId}: Room left`, "success", "check_circle")
      return true
    } catch (error) {
      this.log(`Bot ${botId}: Leave failed`, "error", "error", error.message)
      return false
    }
  }

  async start() {
    if (this.isRunning) return

    const name = this.nameInput.value.trim()
    const room = this.roomInput.value.trim()
    const message = this.messageInput.value.trim()
    const botCount = Number.parseInt(this.botCountInput.value)

    if (!name) {
      this.log("Please provide name", "error", "error")
      return
    }

    if (!room) {
      this.log("Please provide room", "error", "error")
      return
    }

    if (!message) {
      this.log("Please provide message", "error", "error")
      return
    }

    if (botCount < 1 || botCount > 12) {
      this.log("Please provide bot count 1-12", "error", "error")
      return
    }

    this.isRunning = true
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    this.bots = []
    this.intervalIds = []

    this.log(`Starting ${botCount} bots...`, "info", "bot")

    for (let i = 1; i <= botCount; i++) {
      if (!this.isRunning) break

      const botData = await this.createBot(i, name, room, message)
      if (botData) {
        this.bots.push({ id: i, ...botData })

        const intervalId = setInterval(
          async () => {
            if (!this.isRunning) return
            await this.sendMessage(i, botData.token, botData.roomId, message)
          },
          2000 + i * 100,
        )

        this.intervalIds.push(intervalId)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (this.bots.length === 0) {
      this.log("Bots not created", "error", "error")
      this.stop()
    }
  }

  async stop() {
    if (!this.isRunning) return

    this.isRunning = false
    this.startBtn.disabled = true
    this.stopBtn.disabled = true

    this.intervalIds.forEach((id) => clearInterval(id))
    this.intervalIds = []

    this.log("Stopping bots...", "warning", "warning")

    for (const bot of this.bots) {
      await this.removeBot(bot.id, bot.token, bot.roomId)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    this.bots = []
    this.startBtn.disabled = false
    this.stopBtn.disabled = true

    this.log("All bots stopped", "warning", "warning")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.tokenCheckerInstance = new TokenChecker()
  new Config()
  window.senderInstance = new Sender()
  new Godfielder()
})
