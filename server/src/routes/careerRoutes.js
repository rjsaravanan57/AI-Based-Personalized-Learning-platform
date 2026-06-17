import express from 'express'
import { getCareerGuidance } from '../controllers/careerController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/', protect, getCareerGuidance)
export default router
