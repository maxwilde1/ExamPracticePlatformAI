import PaperGrid from '../PaperGrid'

const mockPapers = [
  {
    id: "1",
    title: "Mathematics Paper 1 (Non-Calculator)",
    board: "AQA",
    subject: "Mathematics",
    year: "2024",
    series: "Summer 2024",
    questionCount: 25,
    totalMarks: 80,
  },
  {
    id: "2",
    title: "Biology Paper 2: The Variety of Living Organisms",
    board: "Edexcel",
    subject: "Biology",
    year: "2023",
    series: "Summer 2023",
    questionCount: 18,
    totalMarks: 60,
  },
  {
    id: "3",
    title: "English Language Paper 1: Explorations in Creative Reading",
    board: "AQA",
    subject: "English Language",
    year: "2024",
    series: "Summer 2024",
    questionCount: 5,
    totalMarks: 80,
  },
];

export default function PaperGridExample() {
  return (
    <div className="p-6">
      <PaperGrid papers={mockPapers} />
    </div>
  )
}
