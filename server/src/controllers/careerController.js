import { suggestCareers } from '../services/learningService.js'
import User from '../models/User.js'

export async function getCareerGuidance(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
    const careers = suggestCareers(user.interestedSubjects || [], user.careerInterests || [])
    res.json(careers)
  } catch (error) {
    next(error)
  }
}
