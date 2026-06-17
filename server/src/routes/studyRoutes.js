import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  searchUsers,
  createStudyRequest,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  getMyGroups
} from '../controllers/studyRequestController.js'
import { getGroupMessages, postGroupMessage } from '../controllers/messageController.js'
import {
  uploadMaterial,
  getMaterials,
  viewMaterial,
  downloadMaterial,
  deleteMaterial
} from '../controllers/materialController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

const router = express.Router()

router.use(authMiddleware)

router.get('/users', searchUsers)
router.post('/requests', createStudyRequest)
router.get('/requests/incoming', getIncomingRequests)
router.post('/requests/:id/accept', acceptRequest)
router.post('/requests/:id/reject', rejectRequest)
router.get('/groups', getMyGroups)
router.get('/groups/:groupId/messages', getGroupMessages)
router.post('/groups/:groupId/messages', postGroupMessage)
router.post('/groups/:groupId/materials', upload.single('file'), uploadMaterial)
router.get('/groups/:groupId/materials', getMaterials)
router.get('/materials/:materialId/view', viewMaterial)
router.get('/materials/:materialId/download', downloadMaterial)
router.delete('/materials/:materialId', deleteMaterial)

export default router
