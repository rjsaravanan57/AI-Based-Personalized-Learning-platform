import Message from '../models/Message.js'
import StudyGroup from '../models/StudyGroup.js'

export async function getGroupMessages(req, res, next) {
  try {
    const group = await StudyGroup.findOne({ _id: req.params.groupId, members: req.user._id })
    if (!group) return res.status(404).json({ error: 'Study group not found or access denied' })

    const messages = await Message.find({ groupId: group._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
    res.json(messages)
  } catch (error) {
    next(error)
  }
}

export async function postGroupMessage(req, res, next) {
  try {
    const group = await StudyGroup.findOne({ _id: req.params.groupId, members: req.user._id })
    if (!group) return res.status(404).json({ error: 'Study group not found or access denied' })
    if (!req.body.message?.trim()) return res.status(400).json({ error: 'Message is required' })

    const message = await Message.create({
      groupId: group._id,
      sender: req.user._id,
      message: req.body.message.trim()
    })
    const populated = await message.populate('sender', 'name email')
    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}
