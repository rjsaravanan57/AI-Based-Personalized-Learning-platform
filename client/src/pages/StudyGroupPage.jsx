import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ReactMarkdown from 'react-markdown'

function GroupChatAI({ groupId, api }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can help explain concepts from your group discussion, generate notes, or suggest study materials.'
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

      throw new Error('Invalid response format')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Unable to reach AI service'
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
    <div className="flex h-full flex-col rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-6 shadow-glow">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">AI Study Assistant</p>
        <h3 className="text-lg font-semibold text-white">Group companion</h3>
      </div>

      {error && <p className="mb-3 rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}

      <div className="max-h-[35vh] flex-1 space-y-3 overflow-y-auto rounded-[1.5rem] border border-slate-800/70 bg-slate-900/80 p-3 mb-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-xl px-3 py-2 text-xs ${message.role === 'user'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950/80 text-slate-100'
                }`}
            >
              <div className="prose prose-invert max-w-none leading-5">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-slate-950/80 px-3 py-2">
              <span className="inline-flex gap-0.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" style={{ animationDelay: '0.15s' }} />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" style={{ animationDelay: '0.3s' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              handleSend()
            }
          }}
          rows="2"
          placeholder="Ask the AI..."
          className="min-h-[2.5rem] w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none resize-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isTyping}
          className="self-end rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default function StudyGroupPage() {
  const { api } = useAuth()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [addMemberQuery, setAddMemberQuery] = useState('')
  const [addMemberResults, setAddMemberResults] = useState([])
  const [addingMember, setAddingMember] = useState(false)
  const messagesEndRef = useRef(null)

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === selectedGroupId) || null,
    [groups, selectedGroupId]
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [groupsResp, requestsResp] = await Promise.all([
          api.get('/study-groups/groups'),
          api.get('/study-groups/requests/incoming')
        ])
        setGroups(groupsResp.data)
        setIncomingRequests(requestsResp.data)
      } catch (err) {
        setError('Unable to load study group dashboard')
      }
    }
    loadInitialData()
  }, [api])

  useEffect(() => {
    async function loadMessages() {
      if (!selectedGroupId) {
        setMessages([])
        return
      }
      try {
        const response = await api.get(`/study-groups/groups/${selectedGroupId}/messages`)
        setMessages(response.data)
      } catch (err) {
        setError('Unable to load group messages')
      }
    }
    loadMessages()
  }, [api, selectedGroupId])

  const refreshDashboard = async () => {
    try {
      const [groupsResp, requestsResp] = await Promise.all([
        api.get('/study-groups/groups'),
        api.get('/study-groups/requests/incoming')
      ])
      setGroups(groupsResp.data)
      setIncomingRequests(requestsResp.data)
    } catch (err) {
      setError('Unable to refresh dashboard')
    }
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    try {
      const response = await api.get('/study-groups/users', { params: { q: query } })
      setSearchResults(response.data)
      if (!response.data.length) {
        setStatus('No peers found for that search.')
      }
    } catch (err) {
      setError('Unable to search for peers')
    }
  }

  const sendRequest = async (receiverId) => {
    setStatus('')
    setError('')
    try {
      await api.post('/study-groups/requests', { receiverId })
      setStatus('Study request sent successfully.')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send request')
    }
  }

  const respondToRequest = async (requestId, accept) => {
    setStatus('')
    setError('')
    try {
      await api.post(`/study-groups/requests/${requestId}/${accept ? 'accept' : 'reject'}`)
      await refreshDashboard()
      if (accept) {
        setStatus('Request accepted and group created.')
      } else {
        setStatus('Request rejected.')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update request')
    }
  }

  const sendMessage = async () => {
    if (!selectedGroupId || !messageText.trim()) return
    setStatus('')
    setError('')
    try {
      await api.post(`/study-groups/groups/${selectedGroupId}/messages`, { message: messageText.trim() })
      setMessageText('')
      const response = await api.get(`/study-groups/groups/${selectedGroupId}/messages`)
      setMessages(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send message')
    }
  }

  const searchMembersToAdd = async (event) => {
    event.preventDefault()
    if (!addMemberQuery.trim()) {
      setAddMemberResults([])
      return
    }
    try {
      const response = await api.get('/study-groups/users', { params: { q: addMemberQuery } })
      // Filter out members already in the group
      const filtered = response.data.filter(
        (user) => !selectedGroup.members.some((member) => member._id === user._id)
      )
      setAddMemberResults(filtered)
    } catch (err) {
      setError('Unable to search for members')
    }
  }

  const addMemberToGroup = async (userId) => {
    if (!selectedGroupId) return
    setAddingMember(true)
    try {
      const response = await api.post(`/study-groups/groups/${selectedGroupId}/add-member`, {
        groupId: selectedGroupId,
        userId
      })
      // Update the selected group with new members
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === selectedGroupId ? { ...group, members: response.data.members } : group
        )
      )
      setStatus('Member added successfully!')
      setAddMemberQuery('')
      setAddMemberResults([])
      setShowAddMemberModal(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to add member')
    } finally {
      setAddingMember(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 lg:h-[calc(100vh-80px)] lg:overflow-hidden">
      {selectedGroupId && selectedGroup ? (
        // Full-screen chat view with AI assistant.
        // Mobile/tablet: stacked vertically and page-scrollable.
        // Desktop (lg+): side-by-side, chat 75% / AI assistant 25%, fixed height.
        <div className="flex h-full flex-col gap-4 p-4 lg:flex-row">
          {/* Chat column: full width on mobile, 75% on desktop */}
          <div className="flex w-full flex-col gap-4 lg:w-3/4">
            {/* Group header */}
            <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-6 shadow-glow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-white">{selectedGroup.groupName || 'Study Group'}</h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Members: {selectedGroup.members?.length || 0}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(true)}
                    className="rounded-2xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    + Add Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGroupId(null)}
                    className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Add Member Modal */}
              {showAddMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/95 p-8 shadow-2xl max-w-md w-full mx-4">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-white">Add Member to Group</h2>
                      <p className="mt-2 text-sm text-slate-400">Search and add new members to your study group.</p>
                    </div>

                    <form onSubmit={searchMembersToAdd} className="mb-6 flex flex-col gap-3">
                      <input
                        type="text"
                        value={addMemberQuery}
                        onChange={(e) => setAddMemberQuery(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                      >
                        Search
                      </button>
                    </form>

                    {addMemberResults.length > 0 && (
                      <div className="mb-6 max-h-64 space-y-3 overflow-y-auto">
                        {addMemberResults.map((user) => (
                          <div key={user._id} className="flex items-center justify-between rounded-2xl bg-slate-900/80 p-4">
                            <div className="flex-1">
                              <p className="font-semibold text-white">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addMemberToGroup(user._id)}
                              disabled={addingMember}
                              className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMemberModal(false)
                          setAddMemberQuery('')
                          setAddMemberResults([])
                        }}
                        className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="h-[45vh] rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-6 shadow-glow overflow-y-auto lg:h-auto lg:flex-1">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg._id} className="rounded-2xl bg-slate-900/80 p-4">
                      <p className="text-sm font-semibold text-cyan-300">{msg.sender?.name}</p>
                      <p className="mt-2 text-slate-100">{msg.message}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400">No messages yet. Start the conversation!</p>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message input */}
            {error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            {status && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{status}</p>}
            <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-6 shadow-glow">
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows="3"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:self-end"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* AI assistant column: full width below chat on mobile, 25% side panel on desktop */}
          <div className="h-[55vh] w-full lg:h-full lg:w-1/4">
            <GroupChatAI groupId={selectedGroupId} api={api} />
          </div>
        </div>
      ) : (
        // Study group list view
        <div className="overflow-y-auto px-4 py-10 sm:px-6 lg:h-full">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Search and dashboard section */}
            <section className="rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Study groups</p>
                  <h1 className="text-3xl font-semibold text-white">Study group collaboration</h1>
                </div>
                <p className="text-sm text-slate-400">Search, connect, and chat with peers.</p>
              </div>

              {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              {status && <p className="mb-6 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{status}</p>}

              <form onSubmit={handleSearch} className="mb-8 flex flex-col gap-3 sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search peers by name, email, or subject"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                />
                <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Search
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="grid gap-4 xl:grid-cols-2">
                  {searchResults.map((student) => (
                    <div key={student._id} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-white">{student.name}</h2>
                          <p className="text-sm text-slate-500">{student.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => sendRequest(student._id)}
                          className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Send request
                        </button>
                      </div>
                      <p className="mt-4 text-slate-400">
                        Subjects: {student.interestedSubjects?.join(', ') || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
              {/* Incoming requests */}
              {incomingRequests.length > 0 && (
                <section className="rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
                  <h2 className="mb-6 text-2xl font-semibold text-white">Incoming requests</h2>
                  <div className="space-y-4">
                    {incomingRequests.map((req) => (
                      <div key={req._id} className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-white">{req.sender?.name}</p>
                            <p className="text-sm text-slate-400">{req.sender?.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => respondToRequest(req._id, true)}
                              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => respondToRequest(req._id, false)}
                              className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-red-400"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* My study groups */}
              <section className="rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
                <h2 className="mb-6 text-2xl font-semibold text-white">My study groups</h2>
                {groups.length > 0 ? (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <button
                        key={group._id}
                        type="button"
                        onClick={() => setSelectedGroupId(group._id)}
                        className="w-full rounded-3xl border border-slate-800/70 bg-slate-900/80 px-5 py-4 text-left transition hover:border-cyan-400 hover:bg-slate-900"
                      >
                        <p className="text-lg font-semibold text-white">{group.groupName || 'Study Group'}</p>
                        <p className="mt-2 text-sm text-slate-400">
                          Members: {group.members?.map((m) => m.name).join(', ')}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No study groups yet.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
