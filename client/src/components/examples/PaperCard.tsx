import PaperCard from '../PaperCard'

export default function PaperCardExample() {
  return (
    <div className="max-w-sm">
      <PaperCard
        id="1"
        title="Mathematics Paper 1 (Non-Calculator)"
        board="AQA"
        subject="Mathematics"
        year="2024"
        series="Summer 2024"
        questionCount={25}
        totalMarks={80}
      />
    </div>
  )
}
