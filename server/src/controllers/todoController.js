import Todo from '../models/Todo.js'

export async function getTodos(req, res, next) {
  try {
    const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json(todos)
  } catch (error) {
    next(error)
  }
}

export async function createTodo(req, res, next) {
  try {
    const { title, reminderMinutes } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    const todo = new Todo({
      userId: req.user._id,
      title: title.trim(),
      status: 'pending',
    })

    if (reminderMinutes !== undefined && reminderMinutes !== null && reminderMinutes !== '') {
      const minutes = Number(reminderMinutes)
      if (!Number.isInteger(minutes) || minutes < 0) {
        return res.status(400).json({ error: 'Reminder must be a non-negative integer' })
      }
      todo.reminderTime = new Date(Date.now() + minutes * 60 * 1000)
    }

    await todo.save()
    res.status(201).json(todo)
  } catch (error) {
    next(error)
  }
}

export async function updateTodo(req, res, next) {
  try {
    const { status } = req.body
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id })
    if (!todo) return res.status(404).json({ error: 'Task not found' })

    if (status && ['pending', 'completed'].includes(status)) {
      todo.status = status
    }

    await todo.save()
    res.json(todo)
  } catch (error) {
    next(error)
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!todo) return res.status(404).json({ error: 'Task not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
