import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import LearningProgress from '../models/LearningProgress.js'

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    educationLevel: user.educationLevel,
    interestedSubjects: user.interestedSubjects,
    careerInterests: user.careerInterests,
    learningStyle: user.learningStyle,
    dailyGoalMinutes: user.dailyGoalMinutes || 60,
    studySessions: user.studySessions || []
  }
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
    res.json({ token, user: serializeUser(user) })
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
    res.json({ token, user: serializeUser(user) })
  } catch (error) {
    next(error)
  }
}

export async function profile(req, res, next) {
  try {
    res.json(serializeUser(req.user))
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updates = {}

    if (Object.prototype.hasOwnProperty.call(req.body, 'dailyGoalMinutes')) {
      const parsedGoal = Number(req.body.dailyGoalMinutes)
      updates.dailyGoalMinutes = Number.isFinite(parsedGoal) && parsedGoal > 0 ? Math.floor(parsedGoal) : 60
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'studySessions')) {
      if (Array.isArray(req.body.studySessions)) {
        updates.studySessions = req.body.studySessions.filter((entry) => entry && entry.date && Number.isFinite(Number(entry.minutes)))
      } else {
        updates.studySessions = []
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password')

    res.json(serializeUser(user))
  } catch (error) {
    next(error)
  }
}
