import Todo from '../models/Todo.js'

export async function getTodos(req, res, next) {
    try {
        const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.json(todos)
    } catch (error) {
        next(error)
    }
}

export async function createTodo(req, res, next) {
    try {
        const { title, reminderTime } = req.body
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Todo title is required' })
        }

        const todo = await Todo.create({
            user: req.user._id,
            title: title.trim(),
            reminderTime: reminderTime ? new Date(reminderTime) : null
        })

        res.status(201).json(todo)
    } catch (error) {
        next(error)
    }
}

export async function updateTodo(req, res, next) {
    try {
        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        )

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' })
        }

        res.json(todo)
    } catch (error) {
        next(error)
    }
}

export async function deleteTodo(req, res, next) {
    try {
        const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id })
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' })
        }

        res.json({ message: 'Todo deleted' })
    } catch (error) {
        next(error)
    }
}
