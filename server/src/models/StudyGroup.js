import mongoose from 'mongoose'

const studyGroupSchema = new mongoose.Schema({
  students: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  topics: { type: [String], default: [] }
}, { timestamps: true })

export default mongoose.model('StudyGroup', studyGroupSchema)
