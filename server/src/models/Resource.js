import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  link: { type: String, required: true }
})

export default mongoose.model('Resource', resourceSchema)
