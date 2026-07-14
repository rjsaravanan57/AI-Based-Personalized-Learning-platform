import Assessment from '../models/Assessment.js'
import { analyzeTopics, classify, generateRoadmap, recommendResources, buildAdaptiveQuestions, updateProgress } from '../services/learningService.js'

export async function submitAssessment(req, res, next) {
  try {
    const { answers } = req.body
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' })
    }

    // Ensure exactly 15 questions were answered
    if (answers.length !== 15) {
      return res.status(400).json({
        error: `Assessment must have exactly 15 questions. Received ${answers.length}.`
      })
    }

    const normalizedAnswers = answers.map((item) => ({
      questionId: String(item.questionId ?? ''),
      selected: item.selected ?? '',
      correct: Boolean(item.correct),
      subject: item.subject || 'General',
      topic: item.topic || 'General',
      difficulty: item.difficulty || 'Medium'
    }))

    // Calculate score: each correct answer = 1 mark, out of 15 total
    const correctCount = normalizedAnswers.filter((item) => item.correct).length
    const score = correctCount // 0-15
    const percentage = Math.round((correctCount / 15) * 100)
    const classification = classify(percentage)
    const topicPerformance = analyzeTopics(normalizedAnswers)

    const assessment = await Assessment.create({
      user: req.user._id,
      answers: normalizedAnswers,
      score: percentage, // Store as percentage for UI consistency
      classification,
      topicPerformance
    })

    // Auto-generate roadmap based on assessment results
    const roadmap = await generateRoadmap(req.user._id, classification)
    await updateProgress(req.user._id, percentage, topicPerformance)
    const resources = recommendResources(topicPerformance)
    const questions = await buildAdaptiveQuestions(classification)

    res.json({
      assessment: {
        ...assessment.toObject(),
        totalQuestions: 15,
        correctAnswers: correctCount,
        wrongAnswers: 15 - correctCount,
        percentage
      },
      roadmap,
      resources,
      questions,
      classification,
      topicPerformance
    })
  } catch (error) {
    console.error('Assessment Submit Error:', error)
    next(error)
  }
}

export async function getAssessmentHistory(req, res, next) {
  try {
    const history = await Assessment.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(history)
  } catch (error) {
    next(error)
  }
}
