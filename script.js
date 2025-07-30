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
          this.log(`Bot ${botId}: Emoji fetch failed`, "error", "error", error.message)
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
          this.log(`Bot ${botId}: String fetch failed`, "error", "error", error.message)
        }
      }
    }

    return processedText
  }

  async createBot(botId, name, room, message) {
    try {
      this.log(`Bot ${botId}: Authenticating...`, "info", "bot")

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
        throw new Error(`Authentication failed: ${tokenRes.status} - ${errorText}`)
      }

      const tokenData = await tokenRes.json()
      const token = tokenData.idToken

      this.log(`Bot ${botId}: Auth success`, "success", "check_circle")

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

      this.log(`Bot ${botId}: Joined room`, "success", "check_circle")

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

  async start() {
    if (this.isRunning) return

    const name = this.nameInput.value.trim()
    const room = this.roomInput.value.trim()
    const message = this.messageInput.value.trim()
    const botCount = Number.parseInt(this.botCountInput.value)

    if (!name || !room || !message) {
      this.log("Fill all fields", "error", "error")
      return
    }

    if (botCount < 1 || botCount > 12) {
      this.log("Bot count: 1-12", "error", "error")
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
      this.log("No bots created", "error", "error")
      this.stop()
    }
  }

  stop() {
    if (!this.isRunning) return

    this.isRunning = false
    this.startBtn.disabled = false
    this.stopBtn.disabled = true

    this.intervalIds.forEach((id) => clearInterval(id))
    this.intervalIds = []
    this.bots = []

    this.log("All bots stopped", "warning", "warning")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Godfielder()
})
