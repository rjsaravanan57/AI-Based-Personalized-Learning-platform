import Assessment from '../models/Assessment.js'
import User from '../models/User.js'

export async function getTeacherDashboard(req, res, next) {
  try {
    const students = await User.find({ role: 'student' }).select('name email interestedSubjects careerInterests')
    const studentIds = students.map((s) => s._id)
    const assessments = await Assessment.find({ user: { $in: studentIds } }).sort({ createdAt: -1 })
    res.json({ students, assessments })
  } catch (error) {
    next(error)
  }
}
