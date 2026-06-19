import { generateJSON, chatCompletion, GeminiServiceError } from '../services/geminiService.js'

function buildMappedQuestion(item) {
    return {
        _id: `ai-${Math.random().toString(36).slice(2, 10)}`,
        text: item.question || '',
        options: Array.isArray(item.options) ? item.options : [],
        answer: item.correctAnswer || '',
        explanation: item.explanation || '',
        subject: 'Syllabus',
        topic: 'General',
        difficulty: 'Medium'
    }
}

function validateAssessmentPayload(payload) {
    if (!payload || !Array.isArray(payload.questions) || payload.questions.length !== 15) {
        return false
    }

    return payload.questions.every((item) => {
        return (
            item &&
            typeof item.question === 'string' &&
            Array.isArray(item.options) &&
            item.options.length === 4 &&
            item.options.every((option) => typeof option === 'string') &&
            typeof item.correctAnswer === 'string' &&
            item.options.includes(item.correctAnswer) &&
            typeof item.explanation === 'string'
        )
    })
}

function validatePracticePayload(payload, expectedCount) {
    if (!payload || !Array.isArray(payload.twoMarkQuestions) || !Array.isArray(payload.longAnswerQuestions)) {
        return false
    }

    const hasCorrectCounts =
        payload.twoMarkQuestions.length === expectedCount.twoMarkQuestions &&
        payload.longAnswerQuestions.length === expectedCount.longAnswerQuestions

    if (!hasCorrectCounts) {
        return false
    }

    return payload.twoMarkQuestions.every((item) => {
        return (
            item &&
            typeof item.question === 'string' &&
            typeof item.expectedAnswer === 'string' &&
            item.marks === 2
        )
    }) && payload.longAnswerQuestions.every((item) => {
        return (
            item &&
            typeof item.question === 'string' &&
            typeof item.expectedAnswer === 'string' &&
            item.marks === expectedCount.longAnswerMarks
        )
    })
}

export async function generateAssessment(req, res, next) {
    try {
        const { syllabus } = req.body
        console.log('Assessment Request:', req.body)

        if (!syllabus || !syllabus.trim()) {
            return res.status(400).json({ error: 'Syllabus is required' })
        }

        const prompt = `Create exactly 15 multiple-choice questions based on the following syllabus. Return only valid JSON in this exact shape: {"questions":[{"question":"...","options":["...","...","...","..."],"correctAnswer":"...","explanation":"..."}]}. Every question must have exactly 4 options, and the correctAnswer must match one of the options. Syllabus: ${syllabus}`

        let payload
        try {
            payload = await generateJSON(prompt)
            console.log('Assessment payload received:', payload && Array.isArray(payload.questions) ? payload.questions.length : 'invalid')
        } catch (error) {
            console.error('Assessment generation failed:', error)
            if (error instanceof GeminiServiceError) {
                const status = /quota|429|Too Many Requests|rate limit/i.test(error.message) ? 503 : 502
                return res.status(status).json({
                    error: error.message || 'Failed to generate a valid assessment. Please try again.'
                })
            }
            return next(error)
        }

        if (!validateAssessmentPayload(payload)) {
            console.error('Assessment payload validation failed:', payload)
            return res.status(502).json({ error: 'Failed to generate a valid assessment. Please try again.' })
        }

        const questions = payload.questions.map(buildMappedQuestion)
        res.json({ questions })
    } catch (error) {
        console.error('Assessment controller error:', error)
        next(error)
    }
}

export async function generatePractice(req, res, next) {
    try {
        const { studentType = '', syllabus } = req.body
        console.log('Practice Request:', req.body)

        if (!syllabus || !syllabus.trim()) {
            return res.status(400).json({ error: 'Syllabus is required' })
        }

        const normalizedType = studentType === 'School Student' ? 'School Student' : 'College Student'
        const isSchool = normalizedType === 'School Student'
        const expectedCounts = {
            twoMarkQuestions: 10,
            longAnswerQuestions: isSchool ? 10 : 5,
            longAnswerMarks: isSchool ? 5 : 14
        }

        const prompt = `Create practice questions based on this syllabus for ${studentType || 'a general student'}. Return only valid JSON with exactly this shape: {"twoMarkQuestions":[{"question":"...","expectedAnswer":"...","marks":2}],"longAnswerQuestions":[{"question":"...","expectedAnswer":"...","marks":${expectedCounts.longAnswerMarks}}]}. The twoMarkQuestions array must contain exactly 10 questions, and the longAnswerQuestions array must contain exactly ${expectedCounts.longAnswerQuestions} questions. Syllabus: ${syllabus}`

        let payload
        let retries = 0
        while (retries < 2) {
            try {
                payload = await generateJSON(prompt, { retries: 0 })
                if (validatePracticePayload(payload, expectedCounts)) {
                    break
                }
            } catch (error) {
                console.error('Practice generation attempt failed:', error)
                payload = null
            }
            retries += 1
            if (retries >= 2) {
                payload = null
            }
        }

        if (!validatePracticePayload(payload, expectedCounts)) {
            const errorMessage = payload && payload.error ? payload.error : 'Failed to generate valid practice questions. Please try again.'
            console.error('Practice payload validation failed:', errorMessage)
            return res.status(502).json({ error: errorMessage })
        }

        res.json({
            ...payload,
            studentType: studentType || 'Unspecified',
            counts: expectedCounts
        })
    } catch (error) {
        console.error('Practice controller error:', error)
        next(error)
    }
}

export async function chatWithAI(req, res, next) {
    try {
        const { message, history = [] } = req.body
        console.log('Chat Request:', { messageLength: message?.length || 0, historyLength: Array.isArray(history) ? history.length : 0 })

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' })
        }

        const trimmedHistory = Array.isArray(history) ? history.slice(-20) : []

        let response
        try {
            response = await chatCompletion(trimmedHistory, message.trim())
            console.log('Chat response received:', response?.slice(0, 120))
        } catch (error) {
            console.error('Chat Gemini error:', error)
            if (error instanceof GeminiServiceError) {
                if (error.message.includes('GEMINI_API_KEY is not configured')) {
                    return res.status(503).json({
                        error: 'AI service is not configured. Please set GEMINI_API_KEY in server environment.'
                    })
                }
                const status = /quota|429|Too Many Requests|rate limit/i.test(error.message) ? 503 : 502
                return res.status(status).json({
                    error: error.message || 'Failed to reach Gemini API. Please try again in a moment.'
                })
            }
            throw error
        }

        if (!response || typeof response !== 'string' || response.trim().length === 0) {
            return res.status(502).json({
                error: 'Received empty response from AI service. Please try again.'
            })
        }

        return res.json({
            success: true,
            response: response.trim(),
            reply: response.trim()
        })
    } catch (error) {
        console.error('Chat Error:', error.message)
        return res.status(500).json({
            error: 'Internal server error processing your message.',
            message: error.message
        })
    }
}
