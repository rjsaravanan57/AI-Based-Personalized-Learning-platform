import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

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

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === selectedGroupId) || null,
    [groups, selectedGroupId]
  )

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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Study groups</p>
              <h1 className="text-3xl font-semibold text-white">Study group collaboration</h1>
            </div>
            <p className="text-sm text-slate-400">Search, connect, and chat with peers who share your interests.</p>
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
              Search peers
            </button>
          </form>

          {searchResults.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {searchResults.map((student) => (
                <div key={student._id} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6 shadow-sm">
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
                  <p className="mt-4 text-slate-400">Subjects: {student.interestedSubjects?.join(', ') || 'N/A'}</p>
                  <p className="mt-2 text-slate-400">Career interests: {student.careerInterests?.join(', ') || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Search for peers and send a study request.</p>
          )}
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
            <h2 className="mb-6 text-2xl font-semibold text-white">Incoming requests</h2>
            {incomingRequests.length ? (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <div key={request._id} className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">{request.sender.name}</p>
                        <p className="text-sm text-slate-400">{request.sender.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => respondToRequest(request._id, true)}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => respondToRequest(request._id, false)}
                          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-red-400"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No incoming study requests.</p>
            )}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
            <h2 className="mb-6 text-2xl font-semibold text-white">My study groups</h2>
            {groups.length ? (
              <div className="space-y-4">
                {groups.map((group) => (
                  <button
                    key={group._id}
                    type="button"
                    onClick={() => setSelectedGroupId(group._id)}
                    className={`w-full rounded-3xl border px-5 py-4 text-left transition ${selectedGroupId === group._id ? 'border-cyan-400 bg-slate-900/90' : 'border-slate-800/70 bg-slate-900/80 hover:border-slate-600'}`}
                  >
                    <p className="text-lg font-semibold text-white">{group.groupName || 'Study Group'}</p>
                    <p className="mt-2 text-slate-400">Members: {group.members.map((member) => member.name).join(', ')}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">You have not joined any study groups yet.</p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Group chat</h2>
              <p className="text-sm text-slate-400">Select a group to view the chat history and post messages.</p>
            </div>
            <button
              type="button"
              onClick={refreshDashboard}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400"
            >
              Refresh dashboard
            </button>
          </div>

          {!selectedGroup ? (
            <p className="text-slate-400">Select a group from the list to open the chat.</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                <p className="text-sm text-slate-400">Group: {selectedGroup.groupName || 'Study Group'}</p>
                <p className="mt-2 text-sm text-slate-400">Members: {selectedGroup.members.map((member) => member.name).join(', ')}</p>
              </div>

              <div className="space-y-4">
                {messages.length ? (
                  messages.map((message) => (
                    <div key={message._id} className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                      <p className="text-sm text-cyan-300">{message.sender.name}</p>
                      <p className="mt-2 text-slate-100">{message.message}</p>
                      <p className="mt-2 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No messages in this group yet.</p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Type your message"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Send message
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
