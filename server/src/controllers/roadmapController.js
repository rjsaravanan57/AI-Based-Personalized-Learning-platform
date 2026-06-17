import Roadmap from '../models/Roadmap.js'

export async function getRoadmap(req, res, next) {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id })
    res.json(roadmap || { items: [] })
  } catch (error) {
    next(error)
  }
}
