import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import assessmentRoutes from './routes/assessmentRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import roadmapRoutes from './routes/roadmapRoutes.js'
import careerRoutes from './routes/careerRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import studyGroupRoutes from './routes/studyGroupRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'

dotenv.config()
const app = express()
app.use(cors())
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
app.use(errorHandler)

const DEFAULT_PORT = Number(process.env.PORT || 4000)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-learning'

function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
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

mongoose.connect(MONGODB_URI)
  .then(() => {
    startServer(DEFAULT_PORT)
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
  })
