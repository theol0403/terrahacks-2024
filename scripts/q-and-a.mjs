/**
 * A multiple choice is a question, 4 possible answers, and the correct index.
 * @typedef {{question: string, answer1: string, answer2: string, answer3: string, answer4: string, correctAnswer: number}} MultipleChoice
 */

/** @type {Array<MultipleChoice>} */
const multipleChoiceQuestions = [
  {
    question: 'What is the capital of France?',
    answer1: 'Paris',
    answer2: 'London',
    answer3: 'Berlin',
    answer4: 'Madrid',
    correctAnswer: 1,
  },
  {
    question: 'What is the capital of Japan?',
    answer1: 'Tokyo',
    answer2: 'Beijing',
    answer3: 'Seoul',
    answer4: 'Bangkok',
    correctAnswer: 0,
  },
  {
    question: 'What is the capital of Brazil?',
    answer1: 'Buenos Aires',
    answer2: 'Rio de Janeiro',
    answer3: 'São Paulo',
    answer4: 'Brasília',
    correctAnswer: 3,
  },
]

// record picked questions (and whether they were answered correctly)
/** @type {Array<{questionIndex: number, correct: boolean}>} */
const pickedQuestions = {}

while (multipleChoiceQuestions.length > pickedQuestions.length) {
  // pick a random question that hasn't been picked yet
  const questionIndex = Math.floor(Math.random() * multipleChoiceQuestions.length)
  if (pickedQuestions.some((pickedQuestion) => pickedQuestion.questionIndex === questionIndex)) {
    continue
  }

  const question = multipleChoiceQuestions[questionIndex]
  const answer =
    parseInt(
      prompt(
        question.question +
          '\n1. ' +
          question.answer1 +
          '\n2. ' +
          question.answer2 +
          '\n3. ' +
          question.answer3 +
          '\n4. ' +
          question.answer4,
      ),
    ) - 1
  const correct = answer === question.correctAnswer
  pickedQuestions.push({ questionIndex, correct })
}
