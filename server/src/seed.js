import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Question from './models/Question.js'
import Career from './models/Career.js'
import Resource from './models/Resource.js'
import LearningProgress from './models/LearningProgress.js'
import Roadmap from './models/Roadmap.js'
import StudyGroup from './models/StudyGroup.js'

dotenv.config()
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-learning'

async function seed() {
  await mongoose.connect(MONGODB_URI)
  await User.deleteMany({})
  await Question.deleteMany({})
  await Career.deleteMany({})
  await Resource.deleteMany({})
  await LearningProgress.deleteMany({})
  await Roadmap.deleteMany({})
  await StudyGroup.deleteMany({})

  const password = await bcrypt.hash('Password123', 10)
  const student = await User.create({ name: 'Student Demo', email: 'student@example.com', password, role: 'student', educationLevel: 'College', interestedSubjects: ['Programming', 'Mathematics'], careerInterests: ['Technology'], learningStyle: 'Practice' })
  const teacher = await User.create({ name: 'Teacher Demo', email: 'teacher@example.com', password, role: 'teacher', educationLevel: 'College', interestedSubjects: ['Mathematics', 'Physics'], careerInterests: ['Education'], learningStyle: 'Reading' })
  const admin = await User.create({ name: 'Admin Demo', email: 'admin@example.com', password, role: 'admin', educationLevel: 'College', interestedSubjects: ['Programming'], careerInterests: ['Management'], learningStyle: 'Mixed' })

  await LearningProgress.create({ user: student._id, completedTopics: ['Programming Basics'], scoreHistory: [{ score: 85, date: new Date() }] })
  await Roadmap.create({ user: student._id, items: ['Review basic concepts', 'Practice guided exercises', 'Take a follow-up test'] })

  const questions = [
    { text: 'What is a variable in programming?', subject: 'Programming', topic: 'Variables', difficulty: 'Easy', options: ['A fixed number', 'A named storage location', 'An operating system', 'A function'], answer: 'A named storage location' },
    { text: 'Which statement is used to repeat a block of code?', subject: 'Programming', topic: 'Loops', difficulty: 'Easy', options: ['if', 'for', 'return', 'import'], answer: 'for' },
    { text: 'What is the derivative of x^2?', subject: 'Mathematics', topic: 'Calculus', difficulty: 'Medium', options: ['2x', 'x^2', 'x', '1'], answer: '2x' },
    { text: 'Which formula relates force, mass, and acceleration?', subject: 'Physics', topic: 'Mechanics', difficulty: 'Easy', options: ['F = ma', 'E = mc^2', 'P = mv', 'V = IR'], answer: 'F = ma' },
    { text: 'What is the output of 2 + 3 * 4?', subject: 'Mathematics', topic: 'Order of Operations', difficulty: 'Easy', options: ['14', '20', '18', '10'], answer: '14' },
    { text: 'When is a function considered pure?', subject: 'Programming', topic: 'Functions', difficulty: 'Medium', options: ['It modifies global state', 'It returns the same output for same inputs', 'It uses loops', 'It is asynchronous'], answer: 'It returns the same output for same inputs' },
    { text: 'What is Ohm’s law?', subject: 'Physics', topic: 'Circuits', difficulty: 'Medium', options: ['V = IR', 'F = ma', 'P = mv', 'E = mc^2'], answer: 'V = IR' },
    { text: 'What is the integral of 1/x?', subject: 'Mathematics', topic: 'Calculus', difficulty: 'Hard', options: ['ln|x|', 'x^2', '1/x^2', 'e^x'], answer: 'ln|x|' },
    { text: 'Which data structure uses LIFO order?', subject: 'Programming', topic: 'Data Structures', difficulty: 'Hard', options: ['Queue', 'Stack', 'Heap', 'Graph'], answer: 'Stack' },
    { text: 'What is the principle of superposition?', subject: 'Physics', topic: 'Waves', difficulty: 'Hard', options: ['Energy conservation', 'Sum of effects equals if independent', 'Force = mass x acceleration', 'Current equals voltage / resistance'], answer: 'Sum of effects equals if independent' }
  ]
  await Question.create(questions)

  const careers = [
    { title: 'Software Developer', subjects: ['Programming'], interests: ['Technology'], improvement: ['Build projects', 'Practice coding daily'] },
    { title: 'Data Analyst', subjects: ['Mathematics', 'Programming'], interests: ['Analytics'], improvement: ['Analyze datasets', 'Learn spreadsheet tools'] },
    { title: 'Physics Researcher', subjects: ['Physics'], interests: ['Research'], improvement: ['Study experiments', 'Read science articles'] }
  ]
  await Career.create(careers)

  const resources = [
    { topic: 'Variables', title: 'Programming Variables Guide', type: 'Article', link: 'https://example.com/variables' },
    { topic: 'Loops', title: 'For loops tutorial', type: 'Video', link: 'https://example.com/loops' },
    { topic: 'Calculus', title: 'Calculus practice notes', type: 'Notes', link: 'https://example.com/calculus' },
    { topic: 'Mechanics', title: 'Mechanics fundamentals', type: 'Article', link: 'https://example.com/mechanics' }
  ]
  await Resource.create(resources)

  console.log('Seed completed')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
