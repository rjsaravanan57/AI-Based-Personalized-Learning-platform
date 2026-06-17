import Assessment from '../models/Assessment.js'
import LearningProgress from '../models/LearningProgress.js'
import Roadmap from '../models/Roadmap.js'
import Career from '../models/Career.js'
import Question from '../models/Question.js'
import Resource from '../models/Resource.js'

const classificationThresholds = {
  beginner: 50,
  intermediate: 75
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

export async function buildAdaptiveQuestions(level) {
  const ratios = {
    Beginner: { Easy: 0.6, Medium: 0.3, Hard: 0.1 },
    Intermediate: { Easy: 0.3, Medium: 0.5, Hard: 0.2 },
    Advanced: { Easy: 0.2, Medium: 0.3, Hard: 0.5 }
  }
  const questions = await Question.find()
  const selected = []
  const counts = { Easy: 0, Medium: 0, Hard: 0 }
  const total = 10
  const levelRatios = ratios[level] || ratios.Beginner
  Object.entries(levelRatios).forEach(([difficulty, ratio]) => {
    counts[difficulty] = Math.max(1, Math.round(total * ratio))
  })
  const grouped = questions.reduce((acc, question) => {
    acc[question.difficulty] = acc[question.difficulty] || []
    acc[question.difficulty].push(question)
    return acc
  }, {})
  Object.entries(counts).forEach(([difficulty, count]) => {
    const bucket = grouped[difficulty] || []
    selected.push(...bucket.slice(0, count))
  })
  return selected.slice(0, total)
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
