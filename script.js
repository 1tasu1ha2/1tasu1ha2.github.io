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
    this.currentChannelIndex = 0

    this.fetchingLogEntry = this.log("Getting members...", "info", "alternate_email")

    for (const token of tokens) {
      this.currentToken = token

      const success = await this.connectWebSocket()
      if (success) {
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
    const channelId = this.channelIds[0]

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
      const details = `Used channel: ${this.channelIds[0]}`
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
  new Godfielder()
})
