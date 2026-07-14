import express from 'express'
import { getProgress } from '../controllers/progressController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/', protect, getProgress)
export default router
