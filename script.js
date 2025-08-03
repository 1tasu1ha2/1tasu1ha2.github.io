const helpTexts = {
  tokens:
    "Enter Discord tokens to validate.\nYou can check if they're working with the button below.\nEnter multiple tokens on separate lines.",
  configTokens:
    "Enter Discord tokens to use for most tools.\nThese tokens will be used for fetching channels, sending messages, etc.\nEnter multiple tokens on separate lines.",
  serverId: "Enter Discord server ID.\nUsed for fetching channels, members, leaving servers, etc.",
  channelIds: "Enter Discord channel IDs for message sending.\nEnter multiple channel IDs on separate lines.",
  mentionIds: "Enter Discord user IDs for random mentions.\nEnter multiple user IDs on separate lines.",
  inviteCode:
    "Enter Discord server invite code (without discord.gg/).\nTokens from Config will be used to join this server.",
  msgInput:
    "Enter message to send.\nSupports /rs/ for random strings, /re/ for random emojis, /rm/ for random mentions.\nYou can add numbers (e.g., /rs5/ generates pH4J0).",
  sendMode:
    "Choose message selection method.\nRandom: picks random pattern each time.\nSequential: goes through patterns in order from 1st.",
  infiniteMode: "Toggle infinite message sending.\nWhen enabled, messages are sent continuously until stopped.",
  msgCount: "Number of messages to send.\nOnly used when Infinite Mode is disabled.",
  msgInterval: "Time interval between messages in milliseconds.\n1000ms = 1 second.",
  botName:
    "Enter name for Godfield bots.\nSupports /rs/ for random strings, /re/ for random emojis.\nYou can add numbers (e.g., /rs5/ generates pH4J0).\nSame names cannot join the same room.",
  roomCode: "Enter Godfield room password.\nBots will join rooms with this password.",
  botMsg:
    "Enter message for bots to send continuously.\nSupports /rs/ for random strings, /re/ for random emojis.\nYou can add numbers (e.g., /rs5/ generates pH4J0).",
  botCount: "Number of bots to create and run simultaneously.\nMaximum 12 bots per room.",
}

function showHelp(field) {
  const modal = document.getElementById("helpModal")
  const title = document.getElementById("helpTitle")
  const content = document.getElementById("helpContent")

  title.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} Help`
  content.textContent = helpTexts[field] || "No help available for this field."

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
    this.el = element
    this.display = element.querySelector(".select-display")
    this.options = element.querySelector(".select-options")
    this.value = "random"
    this.init()
  }

  init() {
    this.display.addEventListener("click", () => this.toggle())
    this.options.querySelectorAll(".select-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        this.select(e.target.dataset.value, e.target.textContent)
      })
    })
    document.addEventListener("click", (e) => {
      if (!this.el.contains(e.target)) {
        this.close()
      }
    })
  }

  toggle() {
    this.display.classList.contains("active") ? this.close() : this.open()
  }

  open() {
    this.display.classList.add("active")
    this.options.classList.add("active")
  }

  close() {
    this.display.classList.remove("active")
    this.options.classList.remove("active")
  }

  select(value, text) {
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
    this.init()
  }

  init() {
    this.tokensInput = document.getElementById("tokens")
    this.checkBtn = document.getElementById("checkBtn")
    this.copyBtn = document.getElementById("copyValidBtn")
    this.resultsBox = document.getElementById("resultsBox")

    this.checkBtn.addEventListener("click", () => this.check())
    this.copyBtn.addEventListener("click", () => this.copy())
  }

  async check() {
    const tokens = this.parseInput(this.tokensInput.value)
    if (!tokens.length) {
      this.showError("Please provide tokens")
      return
    }

    this.checkBtn.disabled = true
    this.copyBtn.disabled = true
    this.resultsBox.innerHTML = ""
    this.validTokens = []

    for (const token of tokens) {
      await this.checkToken(token)
      await this.delay(100)
    }

    this.checkBtn.disabled = false
    if (this.validTokens.length > 0) {
      this.copyBtn.disabled = false
    }
  }

  async checkToken(token) {
    try {
      let response = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bot ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        this.displayAccount(token, data, true)
        this.validTokens.push(token)
        return
      }

      response = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: token },
      })

      if (response.ok) {
        const data = await response.json()
        this.displayAccount(token, data, false)
        this.validTokens.push(token)
      } else {
        this.displayInvalid(token)
      }
    } catch (error) {
      this.displayInvalid(token, error.message)
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

  displayInvalid(token, error = "Invalid token") {
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

  copy() {
    if (!this.validTokens.length) return

    navigator.clipboard.writeText(this.validTokens.join("\n")).then(() => {
      const original = this.copyBtn.innerHTML
      this.copyBtn.innerHTML = '<span class="material-icons">check</span>Copied!'
      setTimeout(() => {
        this.copyBtn.innerHTML = original
      }, 2000)
    })
  }

  showError(msg) {
    this.resultsBox.innerHTML = `
      <div style="text-align: center; color: #ff4757; padding: 2rem;">
        <span class="material-icons" style="font-size: 2rem; margin-bottom: 0.5rem;">error</span>
        <div>${msg}</div>
      </div>
    `
  }

  parseInput(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

class Config {
  constructor() {
    this.members = new Set()
    this.ws = null
    this.currentToken = null
    this.currentTokenIdx = 0
    this.serverId = null
    this.channelIds = []
    this.currentChannelIdx = 0
    this.memberTimeout = null
    this.init()
  }

  init() {
    this.tokensInput = document.getElementById("configTokens")
    this.serverInput = document.getElementById("serverId")
    this.channelsInput = document.getElementById("channelIds")
    this.mentionsInput = document.getElementById("mentionIds")
    this.getChannelsBtn = document.getElementById("getChannelsBtn")
    this.getMentionsBtn = document.getElementById("getMentionsBtn")
    this.validateBtn = document.getElementById("validateBtn")
    this.logs = document.getElementById("configLogs")

    this.getChannelsBtn.addEventListener("click", () => this.getChannels())
    this.getMentionsBtn.addEventListener("click", () => this.getMentions())
    this.validateBtn.addEventListener("click", () => this.validate())
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
      list: "list",
      alternate_email: "alternate_email",
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
    return entry
  }

  parseInput(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async getChannels() {
    const tokens = this.parseInput(this.tokensInput.value)
    const serverId = this.serverInput.value.trim()

    if (!tokens.length) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    if (!serverId) {
      this.log("Please provide server ID", "error", "error")
      return
    }

    this.getChannelsBtn.disabled = true
    this.log("Getting channels...", "info", "list")

    for (const token of tokens) {
      try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
          headers: { Authorization: token },
        })

        if (response.ok) {
          const channels = await response.json()
          const textChannels = channels.filter((ch) => ch.type === 0)
          const channelIds = textChannels.map((ch) => ch.id)
          this.channelsInput.value = channelIds.join("\n")
          this.log(`Got ${channelIds.length} channels`, "success", "check_circle")
          break
        } else {
          this.log(`Token failed: ${response.status}`, "warning", "warning")
        }
      } catch (error) {
        this.log("Request failed", "error", "error", error.message)
      }
    }

    this.getChannelsBtn.disabled = false
  }

  async getMentions() {
    const tokens = this.parseInput(this.tokensInput.value)
    const serverId = this.serverInput.value.trim()
    const channelIds = this.parseInput(this.channelsInput.value)

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

    this.getMentionsBtn.disabled = true
    this.members.clear()
    this.serverId = serverId
    this.channelIds = channelIds
    this.currentTokenIdx = 0
    this.currentChannelIdx = 0

    this.log("Getting members...", "info", "alternate_email")

    let success = false
    for (let tokenIdx = 0; tokenIdx < tokens.length && !success; tokenIdx++) {
      this.currentToken = tokens[tokenIdx]
      this.currentTokenIdx = tokenIdx

      for (let channelIdx = 0; channelIdx < channelIds.length && !success; channelIdx++) {
        this.currentChannelIdx = channelIdx
        this.members.clear()

        success = await this.connectWS()
        if (success && this.members.size > 0) {
          break
        }

        await this.delay(1000)
      }

      if (success && this.members.size > 0) {
        break
      }

      await this.delay(2000)
    }

    if (this.members.size === 0) {
      this.log("Members not found", "warning", "warning")
    }

    this.getMentionsBtn.disabled = false
  }

  connectWS() {
    return new Promise((resolve) => {
      if (this.ws) {
        this.ws.close()
      }

      this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json")
      let heartbeat = null
      let connected = false

      this.ws.onopen = () => {}

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        switch (data.op) {
          case 10:
            const interval = data.d.heartbeat_interval
            heartbeat = setInterval(() => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ op: 1, d: null }))
              }
            }, interval)

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
              connected = true
              this.requestMembers()
            } else if (data.t === "GUILD_MEMBER_LIST_UPDATE") {
              this.processMemberUpdate(data.d)
            } else if (data.t === "GUILD_MEMBERS_CHUNK") {
              this.processMemberChunk(data.d)
            }
            break

          case 9:
            if (heartbeat) clearInterval(heartbeat)
            this.ws.close()
            break
        }
      }

      this.ws.onerror = () => {
        if (heartbeat) clearInterval(heartbeat)
        resolve(false)
      }

      this.ws.onclose = () => {
        if (heartbeat) clearInterval(heartbeat)
        if (this.memberTimeout) clearTimeout(this.memberTimeout)

        if (!connected) {
          resolve(false)
        } else {
          this.finalizeMemberCollection()
          resolve(true)
        }
      }

      setTimeout(() => {
        if (!connected) {
          this.ws.close()
          resolve(false)
        }
      }, 10000)
    })
  }

  requestMembers() {
    const channelId = this.channelIds[this.currentChannelIdx]

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

    this.memberTimeout = setTimeout(() => {
      this.ws.close()
    }, 5000)
  }

  processMemberUpdate(data) {
    if (data.ops) {
      data.ops.forEach((op) => {
        if (op.items) {
          op.items.forEach((item) => {
            if (item.member && item.member.user && !item.member.user.bot) {
              this.members.add(item.member.user.id)
            }
          })
        }
      })
    }

    if (this.memberTimeout) {
      clearTimeout(this.memberTimeout)
    }

    this.memberTimeout = setTimeout(() => {
      this.ws.close()
    }, 2000)
  }

  processMemberChunk(data) {
    if (data.members) {
      data.members.forEach((member) => {
        if (member.user && !member.user.bot) {
          this.members.add(member.user.id)
        }
      })
    }
  }

  finalizeMemberCollection() {
    if (this.members.size > 0) {
      this.mentionsInput.value = Array.from(this.members).join("\n")
      this.log(`Got ${this.members.size} members`, "success", "check_circle")
    } else {
      this.log("Members not found", "warning", "warning")
    }
  }

  async validate() {
    const tokens = this.parseInput(this.tokensInput.value)

    if (!tokens.length) {
      this.log("Please provide tokens", "error", "error")
      return
    }

    document.getElementById("tokens").value = tokens.join("\n")

    this.log("Validating tokens...", "info", "info")

    const checker = window.tokenChecker
    await checker.check()

    if (checker.validTokens.length > 0) {
      this.tokensInput.value = checker.validTokens.join("\n")
      this.log(`Validated ${checker.validTokens.length} valid tokens`, "success", "check_circle")
    } else {
      this.tokensInput.value = ""
      this.log("Valid tokens not found", "warning", "warning")
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

class Server {
  constructor() {
    this.init()
  }

  init() {
    this.inviteInput = document.getElementById("inviteCode")
    this.joinBtn = document.getElementById("joinBtn")
    this.leaveBtn = document.getElementById("leaveBtn")
    this.logs = document.getElementById("serverLogs")

    this.joinBtn.addEventListener("click", () => this.join())
    this.leaveBtn.addEventListener("click", () => this.leave())
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
      login: "login",
      logout: "logout",
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

  genSessionID() {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  async genFingerprint() {
    const ua =
      "Mozilla/5.0 (Linux; Android 6.0; Nexus " +
      Math.floor(Math.random() * 10) / 10 +
      " Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 Edg/114.0.182" +
      Math.floor(Math.random() * 100) / 100

    const headers = {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
      Referer: "https://discord.com/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "Sec-GPC": "1",
      "User-Agent": ua,
      "X-Track": btoa(
        '{"os":"' +
          (Math.random() > 0.5 ? "IOS" : "WINDOWS") +
          '","browser":"Safe","system_locale":"en-GB","browser_user_agent":"' +
          ua +
          '","browser_version":"15.0","os_v":"","referrer":"","referring_domain":"","referrer_domain_cookie":"stable","client_build_number":9999,"client_event_source":"stable"}',
      ),
    }

    try {
      const response = await fetch("https://discord.com/api/v9/experiments", { headers })
      const data = await response.json()
      return data.fingerprint || "1191414115344855082._nokxHUJzvNiBOhCRr1h1UAa8Ho"
    } catch {
      return "1191414115344855082._nokxHUJzvNiBOhCRr1h1UAa8Ho"
    }
  }

  async joinServer(token, invite) {
    const fingerprint = await this.genFingerprint()

    const headers = {
      authorization: token,
      "x-super-properties":
        "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRmlyZWZveCIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi1VUyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQ7IHJ2OjkzLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvOTMuMCIsImJyb3dzZXJfdmVyc2lvbiI6IjkzLjAiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTAwODA0LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
      "sec-fetch-dest": "empty",
      "x-debug-options": "bugReporterEnabled",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      accept: "*/*",
      "accept-language": "en-GB",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.16 Chrome/91.0.4472.164 Electron/13.4.0 Safari/537.36",
      TE: "trailers",
      "x-fingerprint": fingerprint,
      "Content-Type": "application/json",
    }

    const response = await fetch(`https://discord.com/api/v9/invites/${invite}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ session_id: this.genSessionID() }),
    })

    return response.ok
  }

  async leaveServer(token, serverId) {
    const response = await fetch(`https://discord.com/api/v9/users/@me/guilds/${serverId}`, {
      method: "DELETE",
      headers: { Authorization: token },
    })

    return response.ok
  }

  async join() {
    const invite = this.inviteInput.value.trim().replace(/^https?:\/\/(discord\.gg\/|discordapp\.com\/invite\/)/, "")
    const tokens = this.parseInput(document.getElementById("configTokens").value)

    if (!invite) {
      this.log("Please provide invite code", "error", "error")
      return
    }

    if (!tokens.length) {
      this.log("Please provide tokens in Config", "error", "error")
      return
    }

    this.joinBtn.disabled = true
    this.log(`Joining server with ${tokens.length} tokens...`, "info", "login")

    let successCount = 0
    for (let i = 0; i < tokens.length; i++) {
      try {
        const success = await this.joinServer(tokens[i], invite)
        if (success) {
          successCount++
          this.log(`Token ${i + 1}: Joined successfully`, "success", "check_circle")
        } else {
          this.log(`Token ${i + 1}: Join failed`, "error", "error")
        }
      } catch (error) {
        this.log(`Token ${i + 1}: Join failed`, "error", "error", error.message)
      }
      await this.delay(500)
    }

    this.log(`Joined with ${successCount}/${tokens.length} tokens`, successCount > 0 ? "success" : "warning", "login")
    this.joinBtn.disabled = false
  }

  async leave() {
    const serverId = document.getElementById("serverId").value.trim()
    const tokens = this.parseInput(document.getElementById("configTokens").value)

    if (!serverId) {
      this.log("Please provide server ID in Config", "error", "error")
      return
    }

    if (!tokens.length) {
      this.log("Please provide tokens in Config", "error", "error")
      return
    }

    this.leaveBtn.disabled = true
    this.log(`Leaving server with ${tokens.length} tokens...`, "info", "logout")

    let successCount = 0
    for (let i = 0; i < tokens.length; i++) {
      try {
        const success = await this.leaveServer(tokens[i], serverId)
        if (success) {
          successCount++
          this.log(`Token ${i + 1}: Left successfully`, "success", "check_circle")
        } else {
          this.log(`Token ${i + 1}: Leave failed`, "error", "error")
        }
      } catch (error) {
        this.log(`Token ${i + 1}: Leave failed`, "error", "error", error.message)
      }
      await this.delay(500)
    }

    this.log(`Left with ${successCount}/${tokens.length} tokens`, successCount > 0 ? "success" : "warning", "logout")
    this.leaveBtn.disabled = false
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
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
    this.addBtn = document.getElementById("addMsgBtn")
    this.patternsBox = document.getElementById("msgPatterns")
    this.sendMode = new CustomSelect(document.getElementById("sendModeSelect"))
    this.infiniteToggle = document.getElementById("infiniteMode")
    this.countInput = document.getElementById("msgCount")
    this.intervalInput = document.getElementById("msgInterval")
    this.startBtn = document.getElementById("startSendBtn")
    this.stopBtn = document.getElementById("stopSendBtn")
    this.logs = document.getElementById("senderLogs")
    this.countGroup = document.getElementById("countGroup")

    this.addBtn.addEventListener("click", () => this.addPattern())
    this.infiniteToggle.addEventListener("change", () => this.toggleInfinite())
    this.startBtn.addEventListener("click", () => this.start())
    this.stopBtn.addEventListener("click", () => this.stop())
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

    const rsMatches = msg.match(/\/rs(\d*)\//g)
    if (rsMatches) {
      for (const match of rsMatches) {
        const lengthMatch = match.match(/\/rs(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-string?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-string"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.log("String API failed", "error", "error", error.message)
        }
      }
    }

    const reMatches = msg.match(/\/re(\d*)\//g)
    if (reMatches) {
      for (const match of reMatches) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-emoji?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-emoji"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.log("Emoji API failed", "error", "error", error.message)
        }
      }
    }

    const rmMatches = msg.match(/\/rm(\d*)\//g)
    if (rmMatches) {
      const mentionIds = this.parseInput(document.getElementById("mentionIds").value)

      if (!mentionIds.length) {
        this.log("Please provide mention IDs", "error", "error")
        return processed
      }

      for (const match of rmMatches) {
        const lengthMatch = match.match(/\/rm(\d+)\//)
        const count = lengthMatch ? Number.parseInt(lengthMatch[1]) : 1

        const mentions = []
        for (let i = 0; i < count && i < mentionIds.length; i++) {
          const randomIdx = Math.floor(Math.random() * mentionIds.length)
          mentions.push(`<@${mentionIds[randomIdx]}>`)
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
      el.className = "msg-pattern"

      el.innerHTML = `
        <div class="msg-header">
          <span class="msg-number">${idx + 1}</span>
          <div class="msg-controls">
            <button class="msg-control-btn" onclick="window.sender.movePattern(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>
              <span class="material-icons" style="font-size: 1rem;">keyboard_arrow_up</span>
            </button>
            <button class="msg-control-btn" onclick="window.sender.movePattern(${idx}, 1)" ${idx === this.patterns.length - 1 ? "disabled" : ""}>
              <span class="material-icons" style="font-size: 1rem;">keyboard_arrow_down</span>
            </button>
            <button class="msg-control-btn delete" onclick="window.sender.deletePattern(${idx})">
              <span class="material-icons" style="font-size: 1rem;">delete</span>
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

  getNextMsg() {
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

  async sendMsg(token, channelId, msg, tokenNum, isInfinite, totalCount) {
    try {
      const processed = await this.processMsg(msg)

      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: processed }),
      })

      if (response.ok) {
        const tokenKey = `${tokenNum}-${channelId}`
        if (!this.tokenCounters.has(tokenKey)) {
          this.tokenCounters.set(tokenKey, 0)
        }
        this.tokenCounters.set(tokenKey, this.tokenCounters.get(tokenKey) + 1)

        const currentCount = this.tokenCounters.get(tokenKey)
        const countInfo = isInfinite ? "" : ` (${currentCount}/${totalCount})`
        const details = `Message: "${processed}"${countInfo}`

        this.log(`Token ${tokenNum}: Message sent`, "success", "message", details)

        if (!isInfinite && this.checkAllCompleted()) {
          setTimeout(() => this.stop(), 100)
        }

        return { success: true, count: currentCount }
      } else {
        this.log(`Token ${tokenNum}: Send failed`, "error", "error", `Status: ${response.status}`)
        return { success: false, count: 0 }
      }
    } catch (error) {
      this.log(`Token ${tokenNum}: Send failed`, "error", "error", error.message)
      return { success: false, count: 0 }
    }
  }

  checkAllCompleted() {
    const tokens = this.parseInput(document.getElementById("configTokens").value)
    const channelIds = this.parseInput(document.getElementById("channelIds").value)
    const count = Number.parseInt(this.countInput.value)

    for (let tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
      for (const channelId of channelIds) {
        const tokenKey = `${tokenIdx + 1}-${channelId}`
        const currentCount = this.tokenCounters.get(tokenKey) || 0
        if (currentCount < count) {
          return false
        }
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
      this.log("Please provide valid count", "error", "error")
      return
    }

    if (interval < 1) {
      this.log("Please provide valid interval", "error", "error")
      return
    }

    this.running = true
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    this.currentIdx = 0
    this.tokenCounters.clear()

    const tokenDelay = Math.floor(interval / tokens.length)

    this.log(`Starting ${tokens.length} tokens...`, "info", "send")

    tokens.forEach((token, tokenIdx) => {
      setTimeout(() => {
        if (!this.running) return

        channelIds.forEach((channelId) => {
          const sendInterval = setInterval(async () => {
            if (!this.running) {
              clearInterval(sendInterval)
              return
            }

            const msg = this.getNextMsg()
            if (msg) {
              await this.sendMsg(token, channelId, msg, tokenIdx + 1, isInfinite, count)
            }
          }, interval)

          this.intervals.push(sendInterval)
        })
      }, tokenIdx * tokenDelay)
    })
  }

  stop() {
    if (!this.running) return

    this.running = false
    this.startBtn.disabled = false
    this.stopBtn.disabled = true

    this.log("Stopping tokens...", "warning", "warning")

    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []

    this.log("All tokens stopped", "warning", "warning")
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

class Godfielder {
  constructor() {
    this.running = false
    this.bots = []
    this.intervals = []
    this.init()
  }

  init() {
    this.nameInput = document.getElementById("botName")
    this.roomInput = document.getElementById("roomCode")
    this.msgInput = document.getElementById("botMsg")
    this.countInput = document.getElementById("botCount")
    this.startBtn = document.getElementById("startBotsBtn")
    this.stopBtn = document.getElementById("stopBotsBtn")
    this.logs = document.getElementById("godfielderLogs")

    this.startBtn.addEventListener("click", () => this.start())
    this.stopBtn.addEventListener("click", () => this.stop())
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
      bot: "smart_toy",
      message: "message",
      room: "meeting_room",
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

  async processText(text, botId) {
    let processed = text

    const reMatches = text.match(/\/re(\d*)\//g)
    if (reMatches) {
      for (const match of reMatches) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-emoji?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-emoji"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.log(`Bot ${botId}: Emoji failed`, "error", "error", error.message)
        }
      }
    }

    const rsMatches = text.match(/\/rs(\d*)\//g)
    if (rsMatches) {
      for (const match of rsMatches) {
        const lengthMatch = match.match(/\/rs(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-string?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-string"

        try {
          const response = await fetch(url)
          const data = await response.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.log(`Bot ${botId}: String failed`, "error", "error", error.message)
        }
      }
    }

    return processed
  }

  async createBot(botId, name, room, msg) {
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

  async sendMsg(botId, token, roomId, msg) {
    try {
      const processed = await this.processText(msg, botId)

      const response = await fetch("https://asia-northeast1-godfield.cloudfunctions.net/setComment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "hidden",
          roomId: roomId,
          text: processed,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Message send failed: ${response.status} - ${errorText}`)
      }

      this.log(`Bot ${botId}: Message sent`, "success", "message", `Message: "${processed}"`)
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
    if (this.running) return

    const name = this.nameInput.value.trim()
    const room = this.roomInput.value.trim()
    const msg = this.msgInput.value.trim()
    const botCount = Number.parseInt(this.countInput.value)

    if (!name) {
      this.log("Please provide name", "error", "error")
      return
    }

    if (!room) {
      this.log("Please provide room", "error", "error")
      return
    }

    if (!msg) {
      this.log("Please provide message", "error", "error")
      return
    }

    if (botCount < 1 || botCount > 12) {
      this.log("Please provide bot count 1-12", "error", "error")
      return
    }

    this.running = true
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    this.bots = []
    this.intervals = []

    this.log(`Starting ${botCount} bots...`, "info", "bot")

    for (let i = 1; i <= botCount; i++) {
      if (!this.running) break

      const botData = await this.createBot(i, name, room, msg)
      if (botData) {
        this.bots.push({ id: i, ...botData })

        const intervalId = setInterval(
          async () => {
            if (!this.running) return
            await this.sendMsg(i, botData.token, botData.roomId, msg)
          },
          2000 + i * 100,
        )

        this.intervals.push(intervalId)
      }

      await this.delay(500)
    }

    if (this.bots.length === 0) {
      this.log("Bots not created", "error", "error")
      this.stop()
    }
  }

  async stop() {
    if (!this.running) return

    this.running = false
    this.startBtn.disabled = true
    this.stopBtn.disabled = true

    this.intervals.forEach((id) => clearInterval(id))
    this.intervals = []

    this.log("Stopping bots...", "warning", "warning")

    for (const bot of this.bots) {
      await this.removeBot(bot.id, bot.token, bot.roomId)
      await this.delay(200)
    }

    this.bots = []
    this.startBtn.disabled = false
    this.stopBtn.disabled = true

    this.log("All bots stopped", "warning", "warning")
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.tokenChecker = new TokenChecker()
  new Config()
  new Server()
  window.sender = new Sender()
  new Godfielder()
})
