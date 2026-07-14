import mongoose from 'mongoose'

const studyGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('StudyGroup', studyGroupSchema)
