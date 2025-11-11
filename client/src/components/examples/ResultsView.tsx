import ResultsView from '../ResultsView'

const mockResults = [
  {
    pageNumber: 1,
    questionNumber: "1",
    studentAnswer: "x = 5\n\nWorking:\n2x + 3 = 13\n2x = 10\nx = 5",
    awardedMarks: 6,
    maxMarks: 6,
    feedback: "Excellent work! You've correctly solved the equation and shown clear working throughout. Your algebraic manipulation is accurate and your final answer is correct.",
    improvementTips: [],
    confidence: "high" as const,
  },
  {
    pageNumber: 2,
    questionNumber: "2",
    studentAnswer: "Area = 48 cm²\n\nI calculated 6 × 8 = 48",
    awardedMarks: 4,
    maxMarks: 6,
    feedback: "Good calculation of the area, but you didn't show the formula or explain your method clearly. You lost marks for not identifying the shape or stating the formula A = base × height.",
    improvementTips: [
      "Always state the formula you're using (e.g., Area of triangle = ½ × base × height)",
      "Identify the shape in your working",
      "Show all steps including unit conversions if needed"
    ],
    confidence: "medium" as const,
  },
  {
    pageNumber: 3,
    questionNumber: "3",
    studentAnswer: "The answer is probably around 25%",
    awardedMarks: 1,
    maxMarks: 6,
    feedback: "You haven't shown any working or methodology. While your estimate is in the right direction, you need to demonstrate the calculation steps to earn full marks. The correct answer requires finding the fraction and converting to a percentage.",
    improvementTips: [
      "Show your working step by step",
      "Convert fractions to percentages by multiplying by 100",
      "Use the data from the question in your calculations"
    ],
    confidence: "low" as const,
  },
];

export default function ResultsViewExample() {
  return (
    <ResultsView
      paperTitle="AQA Mathematics Paper 1 - Summer 2024"
      totalScore={68}
      maxScore={80}
      pageResults={mockResults}
    />
  )
}
