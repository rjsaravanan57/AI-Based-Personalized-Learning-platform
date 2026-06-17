import express from 'express'
import { findStudyGroup } from '../controllers/studyGroupController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/match', protect, findStudyGroup)
export default router
