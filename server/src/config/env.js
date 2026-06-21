import dotenv from 'dotenv'

dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || ''
}

export function ensureRequiredEnv() {
  const missing = []

  if (!env.MONGO_URI) missing.push('MONGO_URI')
  if (!env.JWT_SECRET) missing.push('JWT_SECRET')
  if (!env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY')

  if (missing.length > 0 && env.NODE_ENV !== 'test') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
