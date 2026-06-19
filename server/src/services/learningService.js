import Assessment from '../models/Assessment.js'
import LearningProgress from '../models/LearningProgress.js'
import Roadmap from '../models/Roadmap.js'
import Career from '../models/Career.js'
import Question from '../models/Question.js'
import Resource from '../models/Resource.js'

const classificationThresholds = {
  beginner: 33,      // 0-32% → Beginner
  intermediate: 67   // 33-66% → Intermediate, 67-100% → Advanced
}

const roadmapTemplates = {
  beginner: [
    'Review basic concepts',
    'Study examples and definitions',
    'Practice guided exercises',
    'Take a follow-up test'
  ],
  intermediate: [
    'Strengthen core topics',
    'Solve mixed practice problems',
    'Study real examples',
    'Review weak topics weekly'
  ],
  advanced: [
    'Tackle advanced concepts',
    'Solve complex problems',
    'Build a mini project',
    'Prepare for career applications'
  ]
}

export function classify(score) {
  if (score < classificationThresholds.beginner) return 'Beginner'
  if (score < classificationThresholds.intermediate) return 'Intermediate'
  return 'Advanced'
}

export function analyzeTopics(answers) {
  const topicStats = {}
  answers.forEach((item) => {
    const topic = item.topic
    if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0, subject: item.subject }
    topicStats[topic].total += 1
    if (item.correct) topicStats[topic].correct += 1
  })
  const performance = {}
  Object.entries(topicStats).forEach(([topic, stats]) => {
    const percentage = Math.round((stats.correct / stats.total) * 100)
    performance[topic] = {
      subject: stats.subject,
      percentage,
      label: percentage >= 70 ? 'Strong' : 'Weak'
    }
  })
  return performance
}

export async function generateRoadmap(userId, classification) {
  const template = roadmapTemplates[classification.toLowerCase()] || roadmapTemplates.beginner
  const roadmap = await Roadmap.findOneAndUpdate({ user: userId }, { items: template }, { new: true, upsert: true })
  return roadmap
}

export async function recommendResources(topicPerformance) {
  const weakTopics = Object.entries(topicPerformance).filter(([, data]) => data.label === 'Weak').map(([topic]) => topic)
  const recommendations = await Resource.find({ topic: { $in: weakTopics } })
  return recommendations
}

function sampleArray(array, count) {
  const items = [...array]
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items.slice(0, count)
}

export async function buildAdaptiveQuestions(level) {
  const ratios = {
    Beginner: { Easy: 0.6, Medium: 0.3, Hard: 0.1 },
    Intermediate: { Easy: 0.3, Medium: 0.5, Hard: 0.2 },
    Advanced: { Easy: 0.2, Medium: 0.3, Hard: 0.5 }
  }
  const total = 10
  const levelRatios = ratios[level] || ratios.Beginner
  const counts = {}
  Object.entries(levelRatios).forEach(([difficulty, ratio]) => {
    counts[difficulty] = Math.max(1, Math.round(total * ratio))
  })

  const difficultyBuckets = {}
  for (const difficulty of ['Easy', 'Medium', 'Hard']) {
    difficultyBuckets[difficulty] = await Question.find({ difficulty }).lean()
  }

  const selected = []
  Object.entries(counts).forEach(([difficulty, count]) => {
    const bucket = difficultyBuckets[difficulty] || []
    if (bucket.length === 0) return
    if (bucket.length <= count) {
      selected.push(...bucket)
    } else {
      selected.push(...sampleArray(bucket, count))
    }
  })

  if (selected.length < total) {
    const extras = await Question.find({ difficulty: { $in: ['Easy', 'Medium', 'Hard'] } }).lean()
    const remaining = extras.filter((question) => !selected.some((selectedItem) => selectedItem._id.equals(question._id)))
    selected.push(...sampleArray(remaining, Math.min(total - selected.length, remaining.length)))
  }

  return sampleArray(selected, Math.min(total, selected.length)).slice(0, total)
}

export function suggestCareers(subjects, interests) {
  const allCareers = [
    { title: 'Software Developer', subjects: ['Programming'], interests: ['Technology'], improvement: ['Build projects', 'Practice coding daily'] },
    { title: 'Data Analyst', subjects: ['Mathematics', 'Programming'], interests: ['Analytics'], improvement: ['Learn data tools', 'Analyze datasets'] },
    { title: 'Physics Researcher', subjects: ['Physics'], interests: ['Research'], improvement: ['Study experiments', 'Read science articles'] }
  ]
  const suggestions = allCareers.filter((career) => {
    const subjectMatch = career.subjects.some((subject) => subjects.includes(subject))
    const interestMatch = career.interests.some((interest) => interests.includes(interest))
    return subjectMatch || interestMatch
  })
  return suggestions.length ? suggestions : allCareers
}

export async function updateProgress(userId, score, topicPerformance) {
  const progress = await LearningProgress.findOne({ user: userId })
  const completedTopics = Object.entries(topicPerformance).filter(([, data]) => data.label === 'Strong').map(([topic]) => topic)
  const today = new Date()
  const updated = await LearningProgress.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        completedTopics,
        lastReviewed: topicPerformance ? Object.fromEntries(Object.keys(topicPerformance).map((topic) => [topic, today])) : {}
      },
      $push: { scoreHistory: { score, date: today } }
    },
    { new: true, upsert: true }
  )
  return updated
}
