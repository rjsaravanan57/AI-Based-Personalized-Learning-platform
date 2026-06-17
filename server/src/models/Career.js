import mongoose from 'mongoose'

const careerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subjects: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  improvement: { type: [String], default: [] }
})

export default mongoose.model('Career', careerSchema)
