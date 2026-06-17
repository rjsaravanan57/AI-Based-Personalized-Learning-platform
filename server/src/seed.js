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

  const generatedQuestions = []
  const subjects = [
    {
      subject: 'Programming',
      topics: ['Variables', 'Loops', 'Functions', 'Data Structures', 'Algorithms'],
      easy: [
        { text: 'What symbol is used to assign a value in JavaScript?', answer: '=' },
        { text: 'What keyword creates a constant in JavaScript?', answer: 'const' },
        { text: 'Which loop runs while a condition is true?', answer: 'while' },
        { text: 'What keyword begins an if statement?', answer: 'if' },
        { text: 'What is the purpose of a function?', answer: 'To reuse code' },
        { text: 'What symbol accesses an array element?', answer: '[]' },
        { text: 'What does HTML stand for?', answer: 'HyperText Markup Language' },
        { text: 'What does CSS style?', answer: 'Web pages' },
        { text: 'What does API stand for?', answer: 'Application Programming Interface' },
        { text: 'What is a boolean value?', answer: 'True or false' }
      ],
      medium: [
        { text: 'What is the time complexity of binary search?', answer: 'O(log n)' },
        { text: 'What does DOM stand for?', answer: 'Document Object Model' },
        { text: 'What is an object in programming?', answer: 'A collection of properties' },
        { text: 'What is a callback function?', answer: 'A function passed as an argument' },
        { text: 'What is a class in OOP?', answer: 'A blueprint for objects' },
        { text: 'What does JSON stand for?', answer: 'JavaScript Object Notation' },
        { text: 'What is a syntax error?', answer: 'A mistake in code structure' },
        { text: 'What is a promise in JavaScript?', answer: 'An object representing eventual completion' },
        { text: 'What is recursion?', answer: 'A function calling itself' },
        { text: 'What is a stack used for?', answer: 'LIFO operations' }
      ],
      hard: [
        { text: 'What data structure is used for breadth-first search?', answer: 'Queue' },
        { text: 'What is a closure in JavaScript?', answer: 'A function with access to outer scope variables' },
        { text: 'What is polymorphism?', answer: 'One interface, many forms' },
        { text: 'What is memoization?', answer: 'Caching results of function calls' },
        { text: 'What is a linked list?', answer: 'A sequence of nodes' },
        { text: 'What is a binary tree?', answer: 'A tree with two children per node' },
        { text: 'What is a hash table?', answer: 'A key-value lookup structure' },
        { text: 'What is dynamic programming?', answer: 'Optimizing overlapping subproblems' },
        { text: 'What is the difference between var and let?', answer: 'Scope behavior' },
        { text: 'What does async/await simplify?', answer: 'Asynchronous code' }
      ]
    },
    {
      subject: 'Mathematics',
      topics: ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Probability'],
      easy: [
        { text: 'What is 5 + 7?', answer: '12' },
        { text: 'What is the value of x if x + 3 = 7?', answer: '4' },
        { text: 'What shape has three sides?', answer: 'Triangle' },
        { text: 'What is 10 - 4?', answer: '6' },
        { text: 'What is 2 times 3?', answer: '6' },
        { text: 'What is the next number after 9?', answer: '10' },
        { text: 'What is 8 divided by 2?', answer: '4' },
        { text: 'What is the value of 0?', answer: 'Zero' },
        { text: 'What is 1 + 1?', answer: '2' },
        { text: 'What is the shape of a circle?', answer: 'Round' }
      ],
      medium: [
        { text: 'What is the slope of the line y = 2x + 3?', answer: '2' },
        { text: 'What is the area of a rectangle with width 4 and height 6?', answer: '24' },
        { text: 'What is the mean of 2, 4, 6, 8?', answer: '5' },
        { text: 'What is 15% of 200?', answer: '30' },
        { text: 'What is the perimeter of a square with side 5?', answer: '20' },
        { text: 'What is the product of 7 and 3?', answer: '21' },
        { text: 'What is the value of 9 squared?', answer: '81' },
        { text: 'What is the sum of 12 and 8?', answer: '20' },
        { text: 'What is the median of 3, 5, 7?', answer: '5' },
        { text: 'What is 100 divided by 10?', answer: '10' }
      ],
      hard: [
        { text: 'What is the derivative of sin(x)?', answer: 'cos(x)' },
        { text: 'Solve for x: x^2 - 4 = 0', answer: '2 or -2' },
        { text: 'What is the probability of rolling a 4 on a six-sided die?', answer: '1/6' },
        { text: 'What is the formula for the area of a circle?', answer: 'πr^2' },
        { text: 'What is the derivative of x^3?', answer: '3x^2' },
        { text: 'What is the integral of 2x?', answer: 'x^2 + C' },
        { text: 'What is a prime number?', answer: 'A number divisible by only 1 and itself' },
        { text: 'What is the value of 2^5?', answer: '32' },
        { text: 'What is the perimeter of a triangle with sides 3, 4, 5?', answer: '12' },
        { text: 'What is the sum of interior angles of a triangle?', answer: '180 degrees' }
      ]
    },
    {
      subject: 'Physics',
      topics: ['Mechanics', 'Waves', 'Electricity', 'Thermodynamics', 'Optics'],
      easy: [
        { text: 'What does gravity do?', answer: 'Pulls objects toward each other' },
        { text: 'What is the unit of force?', answer: 'Newton' },
        { text: 'Which planet is known as the red planet?', answer: 'Mars' },
        { text: 'What is the unit of distance?', answer: 'Meter' },
        { text: 'What is the unit of time?', answer: 'Second' },
        { text: 'What is the state of matter that has a fixed shape?', answer: 'Solid' },
        { text: 'What causes day and night?', answer: 'Earth rotation' },
        { text: 'What is the unit of energy?', answer: 'Joule' },
        { text: 'What do we call moving electric charge?', answer: 'Current' },
        { text: 'What is light made of?', answer: 'Photons' }
      ],
      medium: [
        { text: 'What is the speed of light approximately?', answer: '3 x 10^8 m/s' },
        { text: 'What kind of wave is sound?', answer: 'Mechanical wave' },
        { text: 'What is current measured in?', answer: 'Amperes' },
        { text: 'What is the unit of voltage?', answer: 'Volt' },
        { text: 'What is the unit of resistance?', answer: 'Ohm' },
        { text: 'What is kinetic energy?', answer: '1/2 mv^2' },
        { text: 'What is the law of reflection?', answer: 'Angle of incidence equals angle of reflection' },
        { text: 'What is frequency measured in?', answer: 'Hertz' },
        { text: 'What is pressure measured in?', answer: 'Pascals' },
        { text: 'What is thermal energy?', answer: 'Energy from heat' }
      ],
      hard: [
        { text: 'What is the formula for kinetic energy?', answer: '1/2 mv^2' },
        { text: 'What is the law of conservation of energy?', answer: 'Energy cannot be created or destroyed' },
        { text: 'What happens when light enters a denser medium?', answer: 'It bends toward the normal' },
        { text: 'What is the formula for acceleration?', answer: 'Change in velocity over time' },
        { text: 'What is a wave’s amplitude?', answer: 'Maximum displacement' },
        { text: 'What is a diffraction pattern?', answer: 'Interference of waves' },
        { text: 'What is thermal equilibrium?', answer: 'Same temperature' },
        { text: 'What is a lens that converges light?', answer: 'Convex lens' },
        { text: 'What is electric power?', answer: 'Voltage times current' },
        { text: 'What is the period of a pendulum?', answer: 'Time for one oscillation' }
      ]
    },
    {
      subject: 'General Aptitude',
      topics: ['Reasoning', 'Patterns', 'Logic', 'Data Interpretation', 'Verbal'],
      easy: [
        { text: 'What comes next in the sequence 1, 2, 3, 4, ?', answer: '5' },
        { text: 'If all cats are animals and all animals are living, are all cats living?', answer: 'Yes' },
        { text: 'Which number is even?', answer: '4' },
        { text: 'What is the opposite of hot?', answer: 'Cold' },
        { text: 'Which word is a noun?', answer: 'Dog' },
        { text: 'What is the capital of France?', answer: 'Paris' },
        { text: 'What color is the sky on a clear day?', answer: 'Blue' },
        { text: 'What day comes after Monday?', answer: 'Tuesday' },
        { text: 'What is 10 minus 5?', answer: '5' },
        { text: 'What is the plural of mouse?', answer: 'Mice' }
      ],
      medium: [
        { text: 'If A is taller than B and B is taller than C, who is the shortest?', answer: 'C' },
        { text: 'Select the odd one out: apple, banana, carrot, orange', answer: 'Carrot' },
        { text: 'What is 15% of 200?', answer: '30' },
        { text: 'What comes next in the pattern 2, 4, 6, 8, ?', answer: '10' },
        { text: 'What is the antonym of easy?', answer: 'Difficult' },
        { text: 'Which sentence is a question?', answer: 'Is it raining?' },
        { text: 'What is 7 + 6?', answer: '13' },
        { text: 'What is the opposite of big?', answer: 'Small' },
        { text: 'What is 20 divided by 4?', answer: '5' },
        { text: 'What is the meaning of the word fast?', answer: 'Quick' }
      ],
      hard: [
        { text: 'If the pattern is 2, 4, 8, 16, what is the next number?', answer: '32' },
        { text: 'What is the 7th prime number?', answer: '17' },
        { text: 'If a train travels 60 km in 1 hour 20 minutes, what is its average speed?', answer: '45 km/h' },
        { text: 'What is the missing number in the sequence 3, 6, 12, 24, ?', answer: '48' },
        { text: 'Which word is a synonym of quick?', answer: 'Fast' },
        { text: 'If 5 people share 20 apples equally, how many apples each?', answer: '4' },
        { text: 'What is 3 cubed?', answer: '27' },
        { text: 'What is the opposite of success?', answer: 'Failure' },
        { text: 'What is 30% of 50?', answer: '15' },
        { text: 'Which shape has four equal sides and four right angles?', answer: 'Square' }
      ]
    }
  ]

  subjects.forEach((subjectData) => {
    Object.entries({ Easy: subjectData.easy, Medium: subjectData.medium, Hard: subjectData.hard }).forEach(([difficulty, questionList]) => {
      questionList.forEach((item, index) => {
        generatedQuestions.push({
          text: item.text,
          subject: subjectData.subject,
          topic: subjectData.topics[index % subjectData.topics.length],
          difficulty,
          options: [
            item.answer,
            'None of these',
            'All of these',
            'Cannot determine'
          ],
          answer: item.answer
        })
      })
    })
  })

  await Question.create([...questions, ...generatedQuestions])

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
