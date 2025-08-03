const helpTexts = {
  tokens:
    "Discordのトークンを入力してください。\n下のボタンで有効かをチェックできます。\n複数入力する場合は改行して入力してください。",
  cfgTokens:
    "Discordのトークンを入力してください。\nほとんどのツールでこのトークンが使用されます。\n複数入力する場合は改行して入力してください。",
  serverId: "DiscordのサーバーIDを入力してください。\nチャンネルやメンバーの取得、サーバー退出などに使用されます。",
  channelIds:
    "DiscordのチャンネルIDを入力してください。\nメッセージの送信などに使用されます。\n複数入力する場合は改行して入力してください。",
  mentionIds:
    "DiscordのユーザーIDを入力してください。\nランダムメンションで使用されます。\n複数入力する場合は改行して入力してください。",
  inviteCode:
    "Discordの招待コードを入力してください。\n設定のトークンを使用してサーバーに参加します。\nhttps://discord.gg/XXXXXX の XXXXXX の部分を入力してください。",
  msgInput:
    "送信するメッセージを入力してください。\n/rs/でランダムな英数字、/re/でランダムな絵文字、/rm/でランダムメンションを追加できます。\n数字を付け足す(例: /rs5/ で pH4J0)こともできます。",
  sendMode:
    "メッセージの送信方法を選択してください。\nランダムの場合はメッセージのパターンからランダムに選択して送信します。\nローテーションの場合は1番から順番に送信していきます。",
  infiniteMode: "オンにするとメッセージを永久に送信し続けるように切り替えます。",
  msgCount: "メッセージの送信回数を入力してください。\n入力された回数メッセージを送信します。",
  msgInterval:
    "メッセージの送信間隔を入力してください。\nメッセージを送信してから入力した時間を空けてから次のメッセージを送信します。\n1000msで1秒です。",
  botName:
    "Godfieldのボットの名前を入力してください。\n/rs/でランダムな英数字、/re/でランダムな絵文字を追加できます。\n数字を付け足す(例: /rs5/ で pH4J0)こともできます。\n同じ名前で同じルームには参加できません。",
  roomCode: "Godfieldのルームの合言葉を入力してください。\n入力された合言葉のルームに参加します。",
  botMsg:
    "送信するメッセージを入力してください。\n入力されたメッセージをルームで送信し続けます。\n/rs/でランダムな英数字、/re/でランダムな絵文字を追加できます。\n数字を付け足す(例: /rs5/ で pH4J0)こともできます。",
  botCount: "ルームに参加するボット数を入力してください。\n1つのルームには12人以上参加できません。",
}

const boxNames = {
  tokens: "トークン確認",
  cfgTokens: "設定",
  serverId: "設定",
  channelIds: "設定",
  mentionIds: "設定",
  inviteCode: "サーバー",
  msgInput: "メッセージ送信",
  sendMode: "メッセージ送信",
  infiniteMode: "メッセージ送信",
  msgCount: "メッセージ送信",
  msgInterval: "メッセージ送信",
  botName: "ころすまん",
  roomCode: "ころすまん",
  botMsg: "ころすまん",
  botCount: "ころすまん",
}

const fieldNames = {
  tokens: "トークン",
  cfgTokens: "トークン",
  serverId: "サーバーID",
  channelIds: "チャンネルID",
  mentionIds: "メンバーID",
  inviteCode: "招待コード",
  msgInput: "メッセージ",
  sendMode: "送信方法",
  infiniteMode: "永久送信",
  msgCount: "送信数",
  msgInterval: "送信間隔",
  botName: "名前",
  roomCode: "あいことば",
  botMsg: "メッセージ",
  botCount: "ボット数",
}

function showHelp(field) {
  const modal = document.getElementById("helpModal")
  const title = document.getElementById("helpTitle")
  const content = document.getElementById("helpContent")

  const boxName = boxNames[field] || "不明"
  const fieldName = fieldNames[field] || field
  title.textContent = `${boxName} - ${fieldName} ヘルプ`

  const helpText = helpTexts[field] || "ヘルプがありません"
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

function genSessionID() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

async function genFingerPrint() {
  const UA =
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
    "User-Agent": UA,
    "X-Track": btoa(
      '{"os":"' +
        (Math.random() > 0.5 ? "IOS" : "WINDOWS") +
        '","browser":"Safe","system_locale":"en-GB","browser_user_agent":"' +
        UA +
        '","browser_version":"15.0","os_v":"","referrer":"","referring_domain":"","referrer_domain_cookie":"stable","client_build_number":9999,"client_event_source":"stable","client_event_source":"stable"}',
    ),
  }

  return (
    (await (await fetch("https://discord.com/api/v9/experiments", { headers })).json()).fingerprint ??
    "1191414115344855082._nokxHUJzvNiBOhCRr1h1UAa8Ho"
  )
}

async function joinToken(token, invite) {
  const fingerprint = await genFingerPrint()
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
    headers: headers,
    body: JSON.stringify({
      session_id: genSessionID(),
    }),
  })

  if (!response.ok) {
    return "ERROR"
  }
  return "OK"
}

class CustomSelect {
  constructor(element) {
    this.el = element
    this.display = element.querySelector(".select-display")
    this.opts = element.querySelector(".select-options")
    this.val = "random"
    this.bind()
  }

  bind() {
    this.display.addEventListener("click", () => this.toggle())
    this.opts.querySelectorAll(".select-option").forEach((opt) => {
      opt.addEventListener("click", (e) => {
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
    const active = this.display.classList.contains("active")
    if (active) {
      this.close()
    } else {
      this.open()
    }
  }

  open() {
    this.display.classList.add("active")
    this.opts.classList.add("active")
  }

  close() {
    this.display.classList.remove("active")
    this.opts.classList.remove("active")
  }

  select(val, text) {
    this.val = val
    this.display.querySelector(".select-value").textContent = text
    this.close()
  }

  get() {
    return this.val
  }
}

class TokenChecker {
  constructor() {
    this.validTokens = []
    this.init()
    this.bind()
  }

  init() {
    this.tokensInput = document.getElementById("tokens")
    this.checkBtn = document.getElementById("checkBtn")
    this.copyBtn = document.getElementById("copyBtn")
    this.results = document.getElementById("results")
  }

  bind() {
    this.checkBtn.addEventListener("click", () => this.check())
    this.copyBtn.addEventListener("click", () => this.copy())
  }

  async check() {
    const tokens = this.parse(this.tokensInput.value)

    if (tokens.length === 0) {
      this.showErr("トークンを入力してください")
      return
    }

    this.checkBtn.disabled = true
    this.copyBtn.disabled = true
    this.results.innerHTML = ""
    this.validTokens = []

    for (const token of tokens) {
      await this.checkOne(token)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.checkBtn.disabled = false
    if (this.validTokens.length > 0) {
      this.copyBtn.disabled = false
    }
  }

  async checkOne(token) {
    try {
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bot ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        this.showAcc(token, data, true)
        this.validTokens.push(token)
        return
      }

      const userRes = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: token },
      })

      if (userRes.ok) {
        const userData = await userRes.json()
        this.showAcc(token, userData, false)
        this.validTokens.push(token)
      } else {
        this.showInvalid(token)
      }
    } catch (error) {
      this.showInvalid(token, error.message)
    }
  }

  showAcc(token, data, isBot) {
    const card = document.createElement("div")
    card.className = "account-card"

    const avatarUrl = data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${(Number.parseInt(data.discriminator) || 0) % 5}.png`

    const globalName = data.global_name || "なし"
    const username = data.username
    const email = !isBot && data.email ? data.email : "なし"
    const phone = !isBot && data.phone ? data.phone : "なし"

    card.innerHTML = `
      <div class="account-header">
        <img src="${avatarUrl}" alt="Avatar" class="account-avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <div class="account-basic">
          <div class="account-name">${globalName !== "なし" ? globalName : username}</div>
          <span class="account-type ${isBot ? "bot" : "user"}">${isBot ? "ボット" : "ユーザー"}</span>
        </div>
      </div>
      <div class="account-details">
        <div class="account-detail">
          <span class="account-detail-label">ID</span>
          <span class="account-detail-value">${data.id}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">グローバルネーム</span>
          <span class="account-detail-value">${globalName}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">ユーザーネーム</span>
          <span class="account-detail-value">${username}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">メール</span>
          <span class="account-detail-value">${email}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">電話番号</span>
          <span class="account-detail-value">${phone}</span>
        </div>
        <div class="account-detail">
          <span class="account-detail-label">認証済み</span>
          <span class="account-detail-value">${data.verified ? "はい" : "いいえ"}</span>
        </div>
      </div>
      <div class="account-token" onclick="navigator.clipboard.writeText('${token}')" title="トークンをコピー">
        ${token}
      </div>
    `

    this.results.appendChild(card)
  }

  showInvalid(token, error = "無効なトークン") {
    const card = document.createElement("div")
    card.className = "account-card"
    card.style.borderColor = "rgba(255, 71, 87, 0.5)"

    card.innerHTML = `
      <div class="account-header">
        <div style="width: 40px; height: 40px; background: rgba(255, 71, 87, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span class="material-icons" style="color: #ff4757; font-size: 1.2rem;">error</span>
        </div>
        <div class="account-basic">
          <div class="account-name">無効なトークン</div>
          <span class="account-type" style="background: rgba(255, 71, 87, 0.2); color: #ff4757;">エラー</span>
        </div>
      </div>
      <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 0.8rem;">
        ${error}
      </div>
      <div class="account-token" style="border-color: rgba(255, 71, 87, 0.3);">
        ${token}
      </div>
    `

    this.results.appendChild(card)
  }

  copy() {
    if (this.validTokens.length === 0) return

    const text = this.validTokens.join("\n")
    navigator.clipboard.writeText(text).then(() => {
      const orig = this.copyBtn.innerHTML
      this.copyBtn.innerHTML = '<span class="material-icons">check</span>コピー完了!'
      setTimeout(() => {
        this.copyBtn.innerHTML = orig
      }, 2000)
    })
  }

  showErr(msg) {
    this.results.innerHTML = `
      <div style="text-align: center; color: #ff4757; padding: 2rem;">
        <span class="material-icons" style="font-size: 2rem; margin-bottom: 0.5rem;">error</span>
        <div>${msg}</div>
      </div>
    `
  }

  parse(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }
}

class Config {
  constructor() {
    this.init()
    this.bind()
    this.members = new Set()
    this.ws = null
    this.curToken = null
    this.curTokenIdx = 0
    this.serverId = null
    this.channelIds = []
    this.curChannelIdx = 0
    this.timeout = null
  }

  init() {
    this.cfgTokens = document.getElementById("cfgTokens")
    this.serverId = document.getElementById("serverId")
    this.channelIds = document.getElementById("channelIds")
    this.mentionIds = document.getElementById("mentionIds")
    this.getChannelsBtn = document.getElementById("getChannelsBtn")
    this.getMentionsBtn = document.getElementById("getMentionsBtn")
    this.validateBtn = document.getElementById("validateBtn")
    this.log = document.getElementById("cfgLog")
  }

  bind() {
    this.getChannelsBtn.addEventListener("click", () => this.getChannels())
    this.getMentionsBtn.addEventListener("click", () => this.getMentions())
    this.validateBtn.addEventListener("click", () => this.validate())
  }

  addLog(msg, type = "info", icon = "info", details = null) {
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
      <span class="log-message">${msg}</span>
    `

    if (details) {
      entry.addEventListener("click", () => {
        const msgSpan = entry.querySelector(".log-message")
        if (entry.classList.contains("expanded")) {
          msgSpan.textContent = msg
          entry.classList.remove("expanded")
        } else {
          msgSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.log.appendChild(entry)
    this.log.scrollTop = this.log.scrollHeight
    return entry
  }

  parse(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async getChannels() {
    const tokens = this.parse(this.cfgTokens.value)
    const serverId = this.serverId.value.trim()

    if (!tokens.length) {
      this.addLog("トークンを入力してください", "error", "error")
      return
    }

    if (!serverId) {
      this.addLog("サーバーIDを入力してください", "error", "error")
      return
    }

    this.getChannelsBtn.disabled = true
    this.addLog("チャンネルを取得中...", "info", "list")

    for (const token of tokens) {
      try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
          headers: { Authorization: token },
        })

        if (res.ok) {
          const channels = await res.json()
          const textChannels = channels.filter((ch) => ch.type === 0)
          const channelIds = textChannels.map((ch) => ch.id)
          this.channelIds.value = channelIds.join("\n")
          this.addLog(`${channelIds.length}個のチャンネルを取得しました`, "success", "check_circle")
          break
        } else {
          this.addLog(`トークンエラー: ${res.status}`, "warning", "warning")
        }
      } catch (error) {
        this.addLog("リクエストに失敗しました", "error", "error", error.message)
      }
    }

    this.getChannelsBtn.disabled = false
  }

  async getMentions() {
    const tokens = this.parse(this.cfgTokens.value)
    const serverId = this.serverId.value.trim()
    const channelIds = this.parse(this.channelIds.value)

    if (!tokens.length) {
      this.addLog("トークンを入力してください", "error", "error")
      return
    }

    if (!serverId) {
      this.addLog("サーバーIDを入力してください", "error", "error")
      return
    }

    if (!channelIds.length) {
      this.addLog("チャンネルIDを入力してください", "error", "error")
      return
    }

    this.getMentionsBtn.this.addLog("チャンネルIDを入力してください", "error", "error")
    return
  }

  this;
  .
  getMentionsBtn;
  .
  disabled = true
  this;
  .
  members;
  .
  clear()
  this;
  .
  serverId = serverId
  this;
  .
  channelIds = channelIds
  this;
  .
  curTokenIdx = 0
  this;
  .
  curChannelIdx = 0

  this;
  .
  addLog("メンバーを取得中...", "info", "alternate_email")

  let
  success = false
  for (let tokenIdx = 0
  tokenIdx < tokens.length && !success
  tokenIdx;
  ++) {
  this
  .
  curToken = tokens[tokenIdx]
  this;
  .
  curTokenIdx = tokenIdx

  for (let channelIdx = 0
  channelIdx < channelIds.length && !success
  channelIdx;
  ++) {
  this
  .
  curChannelIdx = channelIdx
  this;
  .
  members;
  .
  clear()

  success = await this.connectWS()
  if (success && this.members.size > 0) {
          break
        }

  await
  new
  Promise((resolve)
  =>
  setTimeout(resolve, 1000)
  )
}

if (success && this.members.size > 0) {
  break
}

await new Promise((resolve) => setTimeout(resolve, 2000))
}

if (this.members.size === 0) {
  this.addLog("メンバーが見つかりませんでした", "warning", "warning")
}

this.getMentionsBtn.disabled = false
}

  connectWS()
{
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
                  token: this.curToken,
                  properties: {
                    os: "Windows",
                    browser: "Discord Client",
                    device: "desktop",
                  },
                  intents: 513,
                },
              })
            )
            break

          case 0:
            if (data.t === "READY") {
              connected = true
              this.reqMembers()
            } else if (data.t === "GUILD_MEMBER_LIST_UPDATE") {
              this.procMemberList(data.d)
            } else if (data.t === "GUILD_MEMBERS_CHUNK") {\
              this.procMemberChunk(data.d)\
            }\
            break
\
          case 9:\
            if (heartbeat) clearInterval(heartbeat)\
            this.ws.close()\
            break
        }
      }
\
      this.ws.onerror = (error) => \
        if (heartbeat) clearInterval(heartbeat)
        resolve(false)
\
      this.ws.onclose = (event) => \
        if (heartbeat) clearInterval(heartbeat)\
        if (this.timeout) clearTimeout(this.timeout)

        if (!connected) {\
          resolve(false)\
        } else {\
          this.finalize()\
          resolve(true)
        }

      setTimeout(() => {\
        if (!connected) {\
          this.ws.close()\
          resolve(false)\
        }\
      }, 10000)
    })
}
\
\
  reqMembers()
{
  const channelId = this.channelIds[this.curChannelIdx]

  this.ws.send(
      JSON.stringify({
        op: 14,
        d: {\
          guild_id: this.serverId,
          typing: false,
          activities: false,
          threads: false,
          channels: {
            [channelId]: [[0, 99]],\
          },
        },
      })
    )

  this.timeout = setTimeout(() => {
    this.ws.close()
  }, 5000)
}

procMemberList(data)
{
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

  if (this.timeout) {
    clearTimeout(this.timeout)
  }

  this.timeout = setTimeout(() => {
    this.ws.close()
  }, 2000)
}

procMemberChunk(data)
{
  if (data.members) {
    data.members.forEach((member) => {
      if (member.user && !member.user.bot) {
        this.members.add(member.user.id)
      }
    })
  }
}

finalize()
{
  if (this.members.size > 0) {
    this.mentionIds.value = Array.from(this.members).join("\n")
    this.addLog(`${this.members.size}人のメンバーを取得しました`, "success", "check_circle")
  } else {
    this.addLog("メンバーが見つかりませんでした", "warning", "warning")
  }
}

async
validate()
{
  const tokens = this.parse(this.cfgTokens.value)

  if (tokens.length === 0) {
    this.addLog("トークンを入力してください", "error", "error")
    return
  }

  document.getElementById("tokens").value = tokens.join("\n")

  this.addLog("トークンを検証中...", "info", "info")

  const checker = window.tokenChecker
  await checker.check()

  if (checker.validTokens.length > 0) {
    this.cfgTokens.value = checker.validTokens.join("\n")
    this.addLog(`${checker.validTokens.length}個の有効なトークンを確認しました`, "success", "check_circle")
  } else {
    this.cfgTokens.value = ""
    this.addLog("有効なトークンが見つかりませんでした", "warning", "warning")
  }
}
}

class Server {
  constructor() {
    this.init()
    this.bind()
  }

  init() {
    this.inviteCode = document.getElementById("inviteCode")
    this.joinBtn = document.getElementById("joinBtn")
    this.leaveBtn = document.getElementById("leaveBtn")
    this.log = document.getElementById("serverLog")
  }

  bind() {
    this.joinBtn.addEventListener("click", () => this.join())
    this.leaveBtn.addEventListener("click", () => this.leave())
  }

  addLog(msg, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    \
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const iconMap = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      login: "login",
      logout: "logout",
    }

    entry.innerHTML = `
      <span class=\"log-time">${time}</span>
      <span class="material-icons log-icon">${iconMap[icon] || icon}</span>
      <span class="log-message">${msg}</span>
    `

    if (details) {
      entry.addEventListener("click", () => {
        const msgSpan = entry.querySelector(".log-message")
        if (entry.classList.contains("expanded")) {
          msgSpan.textContent = msg
          entry.classList.remove("expanded")
        } else {
          \
          msgSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.log.appendChild(entry)
    this.log.scrollTop = this.log.scrollHeight
  }

  parse(input) {
    return input
    \
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async join() {
    const tokens = this.parse(document.getElementById("cfgTokens").value)
    const invite = this.inviteCode.value.trim()

    if (!tokens.length) {
      this.addLog("設定でトークンを入力してください", "error", "error")
      return
    }
    \

    if (!invite) {
      this.addLog("招待コードを入力してください", "error", "error")
      return
    }

    this.joinBtn.disabled = true
    this.addLog("サーバーに参加中...", "info", "login")

    let successCount = 0
    for (let i = 0; i < tokens.length; i++) {
      try {
        const result = await joinToken(tokens[i], invite)
        if (result === "OK") {
          successCount++
          this.addLog(`トークン ${i + 1}: 参加成功`, "success", "check_circle")
        } else {
          this.addLog(`トークン ${i + 1}: 参加失敗`, "error", "error")
        }
      } catch (error) {
        this.addLog(`トークン ${i + 1}: 参加失敗`, "error", "error", error.message)
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    this.addLog(`${successCount}/${tokens.length}個のトークンが参加しました`, "info", "info")
    this.joinBtn.disabled = false
  }

  async leave() {
    const tokens = this.parse(document.getElementById("cfgTokens").value)
    const serverId = document.getElementById("serverId").value.trim()

    if (!tokens.length) {
      this.addLog("設定でトークンを入力してください", "error", "error")
      return
    }

    if (!serverId) {
      this.addLog("設定でサーバーIDを入力してください", "error", "error")
      return
    }

    this.leaveBtn.disabled = true
    this.addLog("サーバーから退出中...", "info", "logout")

    let successCount = 0
    for (let i = 0; i < tokens.length; i++) {
      try {
        const res = await fetch(`https://discord.com/api/v10/users/@me/guilds/${serverId}`, {
          method: "DELETE",
          headers: { Authorization: tokens[i] },
        })

        if (res.ok) {
          successCount++
          this.addLog(`トークン ${i + 1}: 退出成功`, "success", "check_circle")
        } else {
          this.addLog(`トークン ${i + 1}: 退出失敗`, "error", "error", `Status: ${res.status}`)
        }
      } catch (error) {
        this.addLog(`トークン ${i + 1}: 退出失敗`, "error", "error", error.message)
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    this.addLog(`${successCount}/${tokens.length}個のトークンが退出しました`, "info", "info")
    this.leaveBtn.disabled = false
  }
}

class Sender {
  constructor() {
    this.patterns = []
    this.running = false
    this.intervals = []
    this.curIdx = 0
    this.select = null
    this.counters = new Map()
    this.init()
    this.bind()
  }

  init() {
    this.msgInput = document.getElementById("msgInput")
    this.addBtn = document.getElementById("addMsgBtn")
    this.patternsBox = document.getElementById("msgPatterns")
    this.select = new CustomSelect(document.getElementById("sendModeSelect"))
    this.infiniteMode = document.getElementById("infiniteMode")
    this.msgCount = document.getElementById("msgCount")
    this.msgInterval = document.getElementById("msgInterval")
    this.startBtn = document.getElementById("startSendBtn")
    this.stopBtn = document.getElementById("stopSendBtn")
    this.log = document.getElementById("sendLog")
    this.countGroup = document.getElementById("countGroup")
  }

  bind() {
    this.addBtn.addEventListener("click", () => this.add())
    this.infiniteMode.addEventListener("change", () => this.toggleInfinite())
    this.startBtn.addEventListener("click", () => this.start())
    this.stopBtn.addEventListener("click", () => this.stop())
  }

  toggleInfinite() {
    if (this.infiniteMode.checked) {
      this.countGroup.style.display = "none"
    } else {
      this.countGroup.style.display = "flex"
    }
  }

  addLog(msg, type = "info", icon = "info", details = null) {
    const time = new Date().toLocaleTimeString()
    const entry = document.createElement("div")
    entry.className = `log-entry ${type}`

    const iconMap = {
      info: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      send: "send",
      message: "message",
    }

    entry.innerHTML = `
      <span class="log-time">${time}</span>
      <span class="material-icons log-icon">${iconMap[icon] || icon}</span>
      <span class="log-message">${msg}</span>
    `

    if (details) {
      entry.addEventListener("click", () => {
        const msgSpan = entry.querySelector(".log-message")
        if (entry.classList.contains("expanded")) {
          msgSpan.textContent = msg
          entry.classList.remove("expanded")
        } else {
          msgSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.log.appendChild(entry)
    this.log.scrollTop = this.log.scrollHeight
  }

  parse(input) {
    return input
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  async processMsg(msg) {
    let processed = msg

    const rsMatch = msg.match(/\/rs(\d*)\//g)
    if (rsMatch) {
      for (const match of rsMatch) {
        const lengthMatch = match.match(/\/rs(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-string?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-string"

        try {
          const res = await fetch(url)
          const data = await res.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.addLog("文字列APIエラー", "error", "error", error.message)
        }
      }
    }

    const reMatch = msg.match(/\/re(\d*)\//g)
    if (reMatch) {
      for (const match of reMatch) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-emoji?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-emoji"

        try {
          const res = await fetch(url)
          const data = await res.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.addLog("絵文字APIエラー", "error", "error", error.message)
        }
      }
    }

    const rmMatch = msg.match(/\/rm(\d*)\//g)
    if (rmMatch) {
      const mentionIds = this.parse(document.getElementById("mentionIds").value)

      if (mentionIds.length === 0) {
        this.addLog("メンバーIDを入力してください", "error", "error")
        return processed
      }

      for (const match of rmMatch) {
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

  add() {
    const msg = this.msgInput.value.trim()

    if (!msg) {
      this.addLog("メッセージを入力してください", "error", "error")
      return
    }

    this.patterns.push(msg)
    this.msgInput.value = ""
    this.render()
  }

  render() {
    this.patternsBox.innerHTML = ""

    this.patterns.forEach((pattern, idx) => {
      const el = document.createElement("div")
      el.className = "message-pattern"

      el.innerHTML = `
        <div class="message-header">
          <span class="message-number">${idx + 1}</span>
          <div class="message-controls">
            <button class="message-control-btn" onclick="window.sender.move(${idx}, -1)" ${idx === 0 ? "disabled" : ""}>
              <span class="material-icons" style="font-size: 1rem;">keyboard_arrow_up</span>
            </button>
            <button class="message-control-btn" onclick="window.sender.move(${idx}, 1)" ${idx === this.patterns.length - 1 ? "disabled" : ""}>
              <span class="material-icons" style="font-size: 1rem;">keyboard_arrow_down</span>
            </button>
            <button class="message-control-btn delete" onclick="window.sender.del(${idx})">
              <span class="material-icons" style="font-size: 1rem;">delete</span>
            </button>
          </div>
        </div>
        <div class="message-content">${pattern}</div>
      `

      this.patternsBox.appendChild(el)
    })
  }

  move(idx, dir) {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= this.patterns.length) return

    const temp = this.patterns[idx]
    this.patterns[idx] = this.patterns[newIdx]
    this.patterns[newIdx] = temp

    this.render()
  }

  del(idx) {
    this.patterns.splice(idx, 1)
    this.render()
  }

  getNext() {
    if (this.patterns.length === 0) return null

    if (this.select.get() === "random") {
      const randomIdx = Math.floor(Math.random() * this.patterns.length)
      return this.patterns[randomIdx]
    } else {
      const msg = this.patterns[this.curIdx]
      this.curIdx = (this.curIdx + 1) % this.patterns.length
      return msg
    }
  }

  async sendMsg(token, channelId, msg, tokenNum, isInfinite, totalCount) {
    try {
      const processed = await this.processMsg(msg)

      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: processed,
        }),
      })

      if (res.ok) {
        const tokenKey = `${tokenNum}-${channelId}`
        if (!this.counters.has(tokenKey)) {
          this.counters.set(tokenKey, 0)
        }
        this.counters.set(tokenKey, this.counters.get(tokenKey) + 1)

        const curCount = this.counters.get(tokenKey)
        const countInfo = isInfinite ? "" : ` (${curCount}/${totalCount})`
        const details = `メッセージ: "${processed}"${countInfo}`

        this.addLog(`トークン ${tokenNum}: 送信成功`, "success", "message", details)

        if (!isInfinite && this.checkComplete()) {
          setTimeout(() => this.stop(), 100)
        }

        return { success: true, count: curCount }
      } else {
        this.addLog(`トークン ${tokenNum}: 送信失敗`, "error", "error", `Status: ${res.status}`)
        return { success: false, count: 0 }
      }
    } catch (error) {
      this.addLog(`トークン ${tokenNum}: 送信失敗`, "error", "error", error.message)
      return { success: false, count: 0 }
    }
  }

  checkComplete() {
    const tokens = this.parse(document.getElementById("cfgTokens").value)
    const channelIds = this.parse(document.getElementById("channelIds").value)
    const count = Number.parseInt(this.msgCount.value)

    for (let tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
      for (const channelId of channelIds) {
        const tokenKey = `${tokenIdx + 1}-${channelId}`
        const curCount = this.counters.get(tokenKey) || 0
        if (curCount < count) {
          return false
        }
      }
    }
    return true
  }

  async start() {
    if (this.running) return

    const tokens = this.parse(document.getElementById("cfgTokens").value)
    const channelIds = this.parse(document.getElementById("channelIds").value)
    const isInfinite = this.infiniteMode.checked
    const count = isInfinite ? Number.POSITIVE_INFINITY : Number.parseInt(this.msgCount.value)
    const interval = Number.parseInt(this.msgInterval.value)

    if (!tokens.length) {
      this.addLog("設定でトークンを入力してください", "error", "error")
      return
    }

    if (!channelIds.length) {
      this.addLog("設定でチャンネルIDを入力してください", "error", "error")
      return
    }

    if (this.patterns.length === 0) {
      this.addLog("メッセージパターンを追加してください", "error", "error")
      return
    }

    if (count < 1) {
      this.addLog("有効な送信数を入力してください", "error", "error")
      return
    }

    if (interval < 100) {
      this.addLog("有効な送信間隔を入力してください", "error", "error")
      return
    }

    this.running = true
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    this.curIdx = 0
    this.counters.clear()

    const tokenDelay = Math.floor(interval / tokens.length)

    this.addLog(`${tokens.length}個のトークンを開始中...`, "info", "send")

    tokens.forEach((token, tokenIdx) => {
      setTimeout(() => {
        if (!this.running) return

        channelIds.forEach((channelId) => {
          const sendInterval = setInterval(async () => {
            if (!this.running) {
              clearInterval(sendInterval)
              return
            }

            const msg = this.getNext()
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

    this.addLog("トークンを停止中...", "warning", "warning")

    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []

    this.addLog("全てのトークンが停止しました", "warning", "warning")
  }
}

class Godfielder {
  constructor() {
    this.running = false
    this.bots = []
    this.intervals = []
    this.init()
    this.bind()
  }

  init() {
    this.nameInput = document.getElementById("botName")
    this.roomInput = document.getElementById("roomCode")
    this.msgInput = document.getElementById("botMsg")
    this.countInput = document.getElementById("botCount")
    this.startBtn = document.getElementById("startBotBtn")
    this.stopBtn = document.getElementById("stopBotBtn")
    this.log = document.getElementById("botLog")
  }

  bind() {
    this.startBtn.addEventListener("click", () => this.start())
    this.stopBtn.addEventListener("click", () => this.stop())
  }

  addLog(msg, type = "info", icon = "info", details = null) {
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
      <span class="log-message">${msg}</span>
    `

    if (details) {
      entry.addEventListener("click", () => {
        const msgSpan = entry.querySelector(".log-message")
        if (entry.classList.contains("expanded")) {
          msgSpan.textContent = msg
          entry.classList.remove("expanded")
        } else {
          msgSpan.textContent = details
          entry.classList.add("expanded")
        }
      })
    }

    this.log.appendChild(entry)
    this.log.scrollTop = this.log.scrollHeight
  }

  async processText(text, botId) {
    let processed = text

    const reMatch = text.match(/\/re(\d*)\//g)
    if (reMatch) {
      for (const match of reMatch) {
        const lengthMatch = match.match(/\/re(\d+)\//)
        const length = lengthMatch ? lengthMatch[1] : ""
        const url = length
          ? `https://1tasu1ha2.vercel.app/api/random-emoji?length=${length}`
          : "https://1tasu1ha2.vercel.app/api/random-emoji"

        try {
          const res = await fetch(url)
          const data = await res.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.addLog(`ボット ${botId}: 絵文字エラー`, "error", "error", error.message)
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
          const res = await fetch(url)
          const data = await res.json()
          processed = processed.replace(match, data.result || "")
        } catch (error) {
          this.addLog(`ボット ${botId}: 文字列エラー`, "error", "error", error.message)
        }
      }
    }

    return processed
  }

  async createBot(botId, name, room, msg) {
    try {
      this.addLog(`ボット ${botId}: 接続中...`, "info", "bot")

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
        throw new Error(`認証失敗: ${tokenRes.status} - ${errorText}`)
      }

      const tokenData = await tokenRes.json()
      const token = tokenData.idToken

      this.addLog(`ボット ${botId}: 接続完了`, "success", "check_circle")

      const processedName = await this.processText(name, botId)

      this.addLog(`ボット ${botId}: ルーム作成中...`, "info", "room")
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
        throw new Error(`ルーム作成失敗: ${roomRes.status} - ${errorText}`)
      }

      const roomData = await roomRes.json()
      const roomId = roomData.roomId

      this.addLog(`ボット ${botId}: ルーム作成完了`, "success", "check_circle", `ルームID: ${roomId}`)

      this.addLog(`ボット ${botId}: ルーム参加中...`, "info", "room")
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
        throw new Error(`ルーム参加失敗: ${joinRes.status} - ${errorText}`)
      }

      this.addLog(`ボット ${botId}: ルーム参加完了`, "success", "check_circle")

      return { token, roomId, processedName }
    } catch (error) {
      this.addLog(`ボット ${botId}: セットアップ失敗`, "error", "error", error.message)
      return null
    }
  }

  async sendMsg(botId, token, roomId, msg) {
    try {
      const processed = await this.processText(msg, botId)

      const res = await fetch("https://asia-northeast1-godfield.cloudfunctions.net/setComment", {
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

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`メッセージ送信失敗: ${res.status} - ${errorText}`)
      }

      this.addLog(`ボット ${botId}: メッセージ送信`, "success", "message", `メッセージ: "${processed}"`)
      return true
    } catch (error) {
      this.addLog(`ボット ${botId}: 送信失敗`, "error", "error", error.message)
      return false
    }
  }

  async removeBot(botId, token, roomId) {
    try {
      this.addLog(`ボット ${botId}: ルーム退出中...`, "info", "room")

      const res = await fetch("https://asia-northeast1-godfield.cloudfunctions.net/removeRoomUser", {
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

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`ルーム退出失敗: ${res.status} - ${errorText}`)
      }

      this.addLog(`ボット ${botId}: ルーム退出完了`, "success", "check_circle")
      return true
    } catch (error) {
      this.addLog(`ボット ${botId}: 退出失敗`, "error", "error", error.message)
      return false
    }
  }

  async start() {
    if (this.running) return

    const name = this.nameInput.value.trim()
    const room = this.roomInput.value.trim()
    const msg = this.msgInput.value.trim()
    const count = Number.parseInt(this.countInput.value)

    if (!name) {
      this.addLog("名前を入力してください", "error", "error")
      return
    }

    if (!room) {
      this.addLog("あいことばを入力してください", "error", "error")
      return
    }

    if (!msg) {
      this.addLog("メッセージを入力してください", "error", "error")
      return
    }

    if (count < 1 || count > 12) {
      this.addLog("ボット数は1-12で入力してください", "error", "error")
      return
    }

    this.running = true
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    this.bots = []
    this.intervals = []

    this.addLog(`${count}個のボットを開始中...`, "info", "bot")

    for (let i = 1; i <= count; i++) {
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

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (this.bots.length === 0) {
      this.addLog("ボットが作成されませんでした", "error", "error")
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

    this.addLog("ボットを停止中...", "warning", "warning")

    for (const bot of this.bots) {
      await this.removeBot(bot.id, bot.token, bot.roomId)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    this.bots = []
    this.startBtn.disabled = false
    this.stopBtn.disabled = true

    this.addLog("全てのボットが停止しました", "warning", "warning")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.tokenChecker = new TokenChecker()
  new Config()
  new Server()
  window.sender = new Sender()
  new Godfielder()
})
