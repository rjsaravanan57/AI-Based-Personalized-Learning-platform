import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  reminderTime: { type: Date },
}, { timestamps: true })

export default mongoose.model('Todo', todoSchema)
