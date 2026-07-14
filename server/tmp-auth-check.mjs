import dotenv from 'dotenv'
dotenv.config()

const base = 'http://localhost:4000'
const email = `ai.test.${Date.now()}@example.com`
const password = 'TestPass123!'

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch {}
  return { status: response.status, text, data }
}

const registerResult = await request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    name: 'AI Test User',
    email,
    password
  })
})
console.log('REGISTER_STATUS=' + registerResult.status)
console.log(registerResult.text)

const loginResult = await request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email,
    password
  })
})
console.log('LOGIN_STATUS=' + loginResult.status)
console.log(loginResult.text)

if (!loginResult.data?.token) {
  console.log('LOGIN_NO_TOKEN')
  process.exit(1)
}

const token = loginResult.data.token
const chatResult = await request('/api/ai/chat', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Say hello in one short sentence.',
    history: []
  })
})
console.log('CHAT_STATUS=' + chatResult.status)
console.log(chatResult.text)
