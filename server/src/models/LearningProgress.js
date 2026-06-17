import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedTopics: { type: [String], default: [] },
  scoreHistory: { type: [{ score: Number, date: Date }], default: [] },
  lastReviewed: { type: Map, of: Date, default: {} }
}, { timestamps: true })

export default mongoose.model('LearningProgress', progressSchema)
