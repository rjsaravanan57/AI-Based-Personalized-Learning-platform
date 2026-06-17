import Assessment from '../models/Assessment.js'
import { analyzeTopics, classify, generateRoadmap, recommendResources, buildAdaptiveQuestions, updateProgress } from '../services/learningService.js'

export async function submitAssessment(req, res, next) {
  try {
    const { answers } = req.body
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' })
    }
    const correctCount = answers.filter((item) => item.correct).length
    const score = Math.round((correctCount / answers.length) * 100)
    const classification = classify(score)
    const topicPerformance = analyzeTopics(answers)
    const assessment = await Assessment.create({
      user: req.user._id,
      answers,
      score,
      classification,
      topicPerformance
    })
    await generateRoadmap(req.user._id, classification)
    await updateProgress(req.user._id, score, topicPerformance)
    const resources = recommendResources(topicPerformance)
    const questions = await buildAdaptiveQuestions(classification)
    res.json({ assessment, resources, questions, classification, topicPerformance })
  } catch (error) {
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
