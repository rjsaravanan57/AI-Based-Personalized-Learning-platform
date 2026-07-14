import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import serverless from 'serverless-http'
import authRoutes from './routes/authRoutes.js'
import assessmentRoutes from './routes/assessmentRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import roadmapRoutes from './routes/roadmapRoutes.js'
import careerRoutes from './routes/careerRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import studyGroupRoutes from './routes/studyGroupRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import { env, ensureRequiredEnv } from './config/env.js'

const app = express()

// Render (and most PaaS hosts) sit behind a reverse proxy, so trust the
// first proxy hop for correct protocol/IP handling (safe no-op locally).
app.set('trust proxy', 1)

const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map((item) => item.trim()).filter(Boolean)
  : []

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/assessment', assessmentRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/roadmap', roadmapRoutes)
app.use('/api/career', careerRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/study-groups', studyGroupRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/todos', todoRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: env.NODE_ENV })
})

app.use(errorHandler)

function startServer(port, attemptsLeft = 5) {
  // Bind explicitly to 0.0.0.0 so the server is reachable inside Render's
  // container (and any other host that proxies traffic to the container).
  // Falling back to auto-increment ports only makes sense locally — on
  // Render the platform assigns PORT and expects a single fixed bind, so we
  // skip the retry/increment behavior there.
  const host = '0.0.0.0'
  const server = app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`)
  })

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attemptsLeft > 0 && !process.env.RENDER) {
      console.warn(`Port ${port} is busy. Trying ${port + 1} instead...`)
      server.close(() => {
        startServer(port + 1, attemptsLeft - 1)
      })
      return
    }

    console.error('Server startup error:', error)
    process.exit(1)
  })
}

async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: env.NODE_ENV !== 'production'
    })

    console.log('MongoDB connected successfully')

    if (!process.env.VERCEL) {
      startServer(env.PORT)
    }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

if (env.NODE_ENV !== 'test') {
  ensureRequiredEnv()
  connectDatabase()
}

export default process.env.VERCEL ? serverless(app) : app
