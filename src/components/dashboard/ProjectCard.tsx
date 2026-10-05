import { AssignedSurveyCard } from '@/components/surveys/AssignedSurveyCard'
import type { AssignedProject } from '@/types/project'

export function ProjectCard({ project }: { project: AssignedProject }) {
  return <AssignedSurveyCard project={project} compact />
}
