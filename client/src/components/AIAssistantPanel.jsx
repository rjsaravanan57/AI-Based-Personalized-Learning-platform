import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../context/AuthContext.jsx'

export default function AIAssistantPanel() {
    const { api } = useAuth()
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I can help you review notes, summarize discussions, or suggest study ideas.'
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [error, setError] = useState('')
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const handleSend = async () => {
        const trimmed = input.trim()
        if (!trimmed || isTyping) return

        const userMessage = { role: 'user', content: trimmed }
        const nextMessages = [...messages, userMessage]
        setMessages(nextMessages)
        setInput('')
        setError('')
        setIsTyping(true)

        try {
            const response = await api.post('/ai/chat', {
                message: trimmed,
                history: nextMessages.slice(-20)
            })

            // Handle successful response
            if (response.status === 200 && response.data) {
                const reply = response.data.response || response.data.reply
                if (reply && typeof reply === 'string' && reply.trim().length > 0) {
                    setMessages([
                        ...nextMessages,
                        {
                            role: 'assistant',
                            content: reply.trim()
                        }
                    ])
                    return
                }
            }

            // Fallback for unexpected response format
            throw new Error('Invalid response format from AI service')
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Unable to contact the AI assistant right now.'
            setError(errorMsg)
            setMessages([
                ...nextMessages,
                {
                    role: 'assistant',
                    content: `Error: ${errorMsg}`
                }
            ])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <section className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow xl:sticky xl:top-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">AI assistant</p>
                    <h2 className="text-2xl font-semibold text-white">Study companion</h2>
                </div>
            </div>

            {error && <p className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

            <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-4">
                {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950/80 text-slate-100'}`}>
                            <div className="prose prose-invert max-w-none text-sm leading-6">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl bg-slate-950/80 px-4 py-3 text-slate-100">
                            <span className="inline-flex gap-1">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" style={{ animationDelay: '0.15s' }} />
                                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" style={{ animationDelay: '0.3s' }} />
                            </span>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="mt-4 flex gap-3">
                <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            handleSend()
                        }
                    }}
                    rows="3"
                    placeholder="Ask for help with your studies..."
                    className="min-h-[5rem] w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={isTyping}
                    className="self-end rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    Send
                </button>
            </div>
        </section>
    )
}