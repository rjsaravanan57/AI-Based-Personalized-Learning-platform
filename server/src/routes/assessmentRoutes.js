import express from 'express'
import { submitAssessment, getAssessmentHistory } from '../controllers/assessmentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.post('/submit', protect, submitAssessment)
router.get('/history', protect, getAssessmentHistory)
export default router
