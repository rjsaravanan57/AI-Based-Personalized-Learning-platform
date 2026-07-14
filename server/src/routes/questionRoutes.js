import express from 'express'
import { getQuestions, getAdaptiveQuestions } from '../controllers/questionController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/', protect, getQuestions)
router.get('/adaptive', protect, getAdaptiveQuestions)
export default router
