import mongoose from 'mongoose'

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: {
    type: [{
      questionId: { type: String },
      selected: String,
      correct: Boolean,
      subject: String,
      topic: String,
      difficulty: String
    }],
    default: []
  },
  score: Number,
  classification: String,
  topicPerformance: { type: Map, of: Object, default: {} }
}, { timestamps: true })

export default mongoose.model('Assessment', assessmentSchema)
