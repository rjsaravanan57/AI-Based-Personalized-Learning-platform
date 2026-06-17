import Question from '../models/Question.js'
import { buildAdaptiveQuestions } from '../services/learningService.js'

export async function getQuestions(req, res, next) {
  try {
    const questions = await Question.find()
    res.json(questions)
  } catch (error) {
    next(error)
  }
}

export async function getAdaptiveQuestions(req, res, next) {
  try {
    const level = req.query.level || 'Beginner'
    const questions = await buildAdaptiveQuestions(level)
    res.json(questions)
  } catch (error) {
    next(error)
  }
}
