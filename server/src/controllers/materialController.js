import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import StudyGroup from '../models/StudyGroup.js'
import StudyMaterial from '../models/StudyMaterial.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '../../uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

export async function uploadMaterial(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' })
    }

    const group = await StudyGroup.findOne({ _id: req.params.groupId, members: req.user._id })
    if (!group) {
      if (req.file) {
        fs.unlink(req.file.path, () => {})
      }
      return res.status(403).json({ error: 'Access denied or group not found' })
    }

    const material = await StudyMaterial.create({
      groupId: group._id,
      uploadedBy: req.user._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      filePath: req.file.path
    })

    const populated = await material.populate('uploadedBy', 'name email')
    res.status(201).json(populated)
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {})
    }
    next(error)
  }
}

export async function getMaterials(req, res, next) {
  try {
    const group = await StudyGroup.findOne({ _id: req.params.groupId, members: req.user._id })
    if (!group) {
      return res.status(403).json({ error: 'Access denied or group not found' })
    }

    const materials = await StudyMaterial.find({ groupId: group._id })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 })
    res.json(materials)
  } catch (error) {
    next(error)
  }
}

export async function downloadMaterial(req, res, next) {
  try {
    const material = await StudyMaterial.findById(req.params.materialId)
    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    const group = await StudyGroup.findOne({ _id: material.groupId, members: req.user._id })
    if (!group) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({ error: 'File not found on server' })
    }

    res.download(material.filePath, material.fileName)
  } catch (error) {
    next(error)
  }
}

export async function viewMaterial(req, res, next) {
  try {
    const material = await StudyMaterial.findById(req.params.materialId)
    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    const group = await StudyGroup.findOne({ _id: material.groupId, members: req.user._id })
    if (!group) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({ error: 'File not found on server' })
    }

    res.sendFile(material.filePath)
  } catch (error) {
    next(error)
  }
}

export async function deleteMaterial(req, res, next) {
  try {
    const material = await StudyMaterial.findById(req.params.materialId)
    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    const group = await StudyGroup.findOne({ _id: material.groupId, members: req.user._id })
    if (!group) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only uploader can delete' })
    }

    if (fs.existsSync(material.filePath)) {
      fs.unlink(material.filePath, () => {})
    }

    await StudyMaterial.findByIdAndDelete(req.params.materialId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
