import StudyGroup from '../models/StudyGroup.js'
import User from '../models/User.js'

export async function findStudyGroup(req, res, next) {
  try {
    const students = await User.find({ role: 'student' })
    const me = req.user
    const myWeak = new Set(me.interestedSubjects || [])
    // complementary matching by weak subjects / career interests
    const matches = students.filter((student) => {
      if (student._id.equals(me._id)) return false
      const otherStrong = new Set(student.interestedSubjects || [])
      return [...myWeak].some((subject) => otherStrong.has(subject))
    }).slice(0, 5)
    const group = await StudyGroup.create({ students: matches.map((s) => s._id), topics: [...myWeak] })
    res.json({ matches, groupId: group._id })
  } catch (error) {
    next(error)
  }
}
