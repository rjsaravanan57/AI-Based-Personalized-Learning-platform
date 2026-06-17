import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import LearningProgress from '../models/LearningProgress.js'

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export async function register(req, res, next) {
  try {
    const { name, email, password, educationLevel, interestedSubjects, careerInterests, learningStyle } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) return res.status(400).json({ error: 'User already exists' })
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      educationLevel,
      interestedSubjects,
      careerInterests,
      learningStyle,
      role: 'student'
    })
    await LearningProgress.create({ user: user._id })
    const token = generateToken(user._id)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, interestedSubjects: user.interestedSubjects, careerInterests: user.careerInterests, educationLevel: user.educationLevel, learningStyle: user.learningStyle, dailyGoalMinutes: user.dailyGoalMinutes, studySessions: user.studySessions } })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })
    const token = generateToken(user._id)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, interestedSubjects: user.interestedSubjects, careerInterests: user.careerInterests, educationLevel: user.educationLevel, learningStyle: user.learningStyle, dailyGoalMinutes: user.dailyGoalMinutes, studySessions: user.studySessions } })
  } catch (error) {
    next(error)
  }
}

export async function profile(req, res, next) {
  try {
    if (req.user.dailyGoalMinutes === undefined) req.user.dailyGoalMinutes = 60
    if (!Array.isArray(req.user.studySessions)) req.user.studySessions = []
    res.json(req.user)
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { dailyGoalMinutes } = req.body
    if (dailyGoalMinutes !== undefined) {
      const minutes = Number(dailyGoalMinutes)
      if (!Number.isInteger(minutes) || minutes < 1) {
        return res.status(400).json({ error: 'Daily goal must be at least 1 minute' })
      }
      req.user.dailyGoalMinutes = minutes
    }
    await req.user.save()
    res.json(req.user)
  } catch (error) {
    next(error)
  }
}

export async function addStudySession(req, res, next) {
  try {
    const minutes = Number(req.body.minutes)
    if (!Number.isInteger(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'Minutes must be a positive integer' })
    }
    const today = new Date().toISOString().slice(0, 10)
    const sessions = Array.isArray(req.user.studySessions) ? req.user.studySessions : []
    const existing = sessions.find((entry) => entry.date === today)
    if (existing) {
      existing.minutes += minutes
    } else {
      sessions.push({ date: today, minutes })
    }
    req.user.studySessions = sessions
    await req.user.save()
    res.json(req.user)
  } catch (error) {
    next(error)
  }
}
