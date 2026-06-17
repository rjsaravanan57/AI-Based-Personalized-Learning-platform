import mongoose from 'mongoose'

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [String], default: [] }
}, { timestamps: true })

export default mongoose.model('Roadmap', roadmapSchema)
