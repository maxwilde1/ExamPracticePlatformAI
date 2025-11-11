import ExamViewer from '../ExamViewer'

export default function ExamViewerExample() {
  return (
    <ExamViewer
      paperId="1"
      paperTitle="AQA Mathematics Paper 1 (Non-Calculator) - Summer 2024"
      totalPages={12}
      currentPageNumber={1}
    />
  )
}
