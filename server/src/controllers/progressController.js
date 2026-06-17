import LearningProgress from '../models/LearningProgress.js'

export async function getProgress(req, res, next) {
  try {
    const progress = await LearningProgress.findOne({ user: req.user._id })
    res.json(progress || { completedTopics: [], scoreHistory: [], lastReviewed: {} })
  } catch (error) {
    next(error)
  }
}
