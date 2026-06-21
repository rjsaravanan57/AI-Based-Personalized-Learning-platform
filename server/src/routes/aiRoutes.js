import express from 'express'
import { generateAssessment, generatePractice, chatWithAI } from '../controllers/aiController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.post('/generate-assessment', protect, generateAssessment)
router.post('/generate-practice', protect, generatePractice)
router.post('/chat', protect, chatWithAI)

export default router
