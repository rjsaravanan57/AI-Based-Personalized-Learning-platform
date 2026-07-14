import User from '../models/User.js'
import StudyRequest from '../models/StudyRequest.js'
import StudyGroup from '../models/StudyGroup.js'

export async function searchUsers(req, res, next) {
  try {
    const term = req.query.q?.trim() || ''
    const regex = new RegExp(term, 'i')
    const users = await User.find({
      _id: { $ne: req.user._id },
      role: 'student',
      $or: [{ name: regex }, { email: regex }]
    }).select('name email educationLevel interestedSubjects careerInterests')
    res.json(users)
  } catch (error) {
    next(error)
  }
}

export async function createStudyRequest(req, res, next) {
  try {
    const receiverId = req.body.receiverId
    if (!receiverId) return res.status(400).json({ error: 'Receiver is required' })
    if (receiverId === req.user._id.toString()) return res.status(400).json({ error: 'Cannot send request to yourself' })

    const existing = await StudyRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ],
      status: 'pending'
    })
    if (existing) return res.status(400).json({ error: 'A pending request already exists between these users' })

    const request = await StudyRequest.create({ sender: req.user._id, receiver: receiverId })
    const populated = await request.populate('sender', 'name email').populate('receiver', 'name email')
    res.json(populated)
  } catch (error) {
    next(error)
  }
}

export async function getIncomingRequests(req, res, next) {
  try {
    const requests = await StudyRequest.find({ receiver: req.user._id, status: 'pending' })
      .populate('sender', 'name email educationLevel interestedSubjects careerInterests')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (error) {
    next(error)
  }
}

export async function acceptRequest(req, res, next) {
  try {
    const request = await StudyRequest.findOne({ _id: req.params.id, receiver: req.user._id, status: 'pending' })
    if (!request) return res.status(404).json({ error: 'Request not found' })

    request.status = 'accepted'
    await request.save()

    const existingGroup = await StudyGroup.findOne({ members: { $all: [request.sender, request.receiver] } })
    let group = existingGroup
    if (!existingGroup) {
      const sender = await User.findById(request.sender)
      const receiver = await User.findById(request.receiver)
      group = await StudyGroup.create({
        groupName: `${sender.name} & ${receiver.name} Study Group`,
        members: [request.sender, request.receiver],
        createdBy: req.user._id
      })
    }

    const populated = await group.populate('members', 'name email educationLevel')
    res.json(populated)
  } catch (error) {
    next(error)
  }
}

export async function rejectRequest(req, res, next) {
  try {
    const request = await StudyRequest.findOne({ _id: req.params.id, receiver: req.user._id, status: 'pending' })
    if (!request) return res.status(404).json({ error: 'Request not found' })
    request.status = 'rejected'
    await request.save()
    res.json(request)
  } catch (error) {
    next(error)
  }
}

export async function getMyGroups(req, res, next) {
  try {
    const groups = await StudyGroup.find({ members: req.user._id }).populate('members', 'name email educationLevel')
    res.json(groups)
  } catch (error) {
    next(error)
  }
}

export async function addMemberToGroup(req, res, next) {
  try {
    const { groupId, userId } = req.body
    if (!groupId || !userId) {
      return res.status(400).json({ error: 'Group ID and User ID are required' })
    }

    // Check if user is a member of the group
    const group = await StudyGroup.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: 'Group not found' })
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not a member of this group' })
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member of this group' })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Add member to group
    group.members.push(userId)
    await group.save()

    const populated = await group.populate('members', 'name email educationLevel')
    res.json(populated)
  } catch (error) {
    next(error)
  }
}
