import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true }
})

export default mongoose.model('Question', questionSchema)
