import mongoose from 'mongoose'

const studyMaterialSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, default: 'application/octet-stream' },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('StudyMaterial', studyMaterialSchema)
