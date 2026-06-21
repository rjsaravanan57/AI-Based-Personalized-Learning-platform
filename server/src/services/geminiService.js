import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

class GeminiServiceError extends Error {
    constructor(message, options = {}) {
        super(message)
        this.name = 'GeminiServiceError'
        this.cause = options.cause || null
    }
}

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    console.warn('[geminiService] GEMINI_API_KEY is not configured. AI endpoints will fail gracefully until the key is set.')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI
    ? genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: 'You are a helpful assistant. Return valid JSON only when requested and avoid markdown fences unless the user explicitly asks for them.'
    })
    : null

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function ensureModel() {
    if (!model) {
        throw new GeminiServiceError('GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in the server environment.')
    }
}

function normalizeHistory(history = []) {
    if (!Array.isArray(history)) return []

    const normalized = history
        .slice(-20)
        .map((entry) => {
            const role = entry?.role === 'assistant' ? 'model' : 'user'
            const text = typeof entry?.content === 'string' ? entry.content : ''
            return {
                role,
                parts: [{ text }]
            }
        })
        .filter((entry) => entry.parts[0]?.text?.trim().length > 0)

    while (normalized.length > 0 && normalized[0].role !== 'user') {
        normalized.shift()
    }

    return normalized
}

function stripCodeFences(text = '') {
    return text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
}

function extractJsonBlock(text = '') {
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    return match ? match[1] : null
}

async function parseJsonResponse(rawText) {
    const cleaned = stripCodeFences(rawText)
    try {
        return JSON.parse(cleaned)
    } catch (error) {
        const extracted = extractJsonBlock(cleaned)
        if (!extracted) {
            throw error
        }
        return JSON.parse(extracted)
    }
}

export async function generateJSON(prompt, { retries = 2 } = {}) {
    ensureModel()

    const attempts = retries + 1
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const result = await model.generateContent(prompt)
            const rawText = result?.response?.text?.() || ''
            const parsed = await parseJsonResponse(rawText)
            return parsed
        } catch (error) {
            if (attempt === attempts) {
                throw new GeminiServiceError(
                    `Failed to generate valid JSON after ${attempts} attempt(s).`,
                    { cause: error }
                )
            }
            const waitMs = 500 * attempt
            await delay(waitMs)
        }
    }

    throw new GeminiServiceError('Failed to generate valid JSON from Gemini response.')
}

export async function chatCompletion(history, userMessage) {
    ensureModel()

    try {
        const chat = model.startChat({
            history: normalizeHistory(history)
        })
        const result = await chat.sendMessage(userMessage)
        return result?.response?.text?.() || ''
    } catch (error) {
        throw new GeminiServiceError('Unable to complete chat response from Gemini.', {
            cause: error
        })
    }
}

export { GeminiServiceError }
