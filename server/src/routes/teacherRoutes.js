import express from 'express'
import { getTeacherDashboard } from '../controllers/teacherController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()
router.get('/', protect, authorize(['teacher', 'admin']), getTeacherDashboard)
export default router
