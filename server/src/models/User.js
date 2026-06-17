import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  educationLevel: { type: String, default: 'College' },
  interestedSubjects: { type: [String], default: [] },
  careerInterests: { type: [String], default: [] },
  learningStyle: { type: String, enum: ['Visual', 'Reading', 'Practice', 'Mixed'], default: 'Mixed' },
  history: { type: [String], default: [] }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
