import express from 'express'
import { login, register, profile, updateProfile, addStudySession } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.post('/register', register)
router.post('/login', login)
router.get('/profile', protect, profile)
router.put('/profile', protect, updateProfile)
router.post('/profile/study-sessions', protect, addStudySession)
export default router
