import express from 'express'
import studyRoutes from './studyRoutes.js'

const router = express.Router()
router.use('/', studyRoutes)
export default router
