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
import todoRoutes from './routes/todoRoutes.js'
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
app.use('/api/todos', todoRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-learning'

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}).catch((error) => {
  console.error('MongoDB connection error:', error)
})
