import type { SurveyAssignmentStatus } from '@/types/api'
import type { AssignedProject } from '@/types/project'

export type SurveyFilter = 'all' | SurveyAssignmentStatus

export const surveyFilters: Array<{ id: SurveyFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Ongoing' },
  { id: 'complete', label: 'Completed' },
  { id: 'terminate', label: 'Terminated' },
  { id: 'quota_full', label: 'Quota full' },
]

export function countByStatus(projects: AssignedProject[]): Record<SurveyFilter, number> {
  const counts: Record<SurveyFilter, number> = { all: projects.length, active: 0, complete: 0, terminate: 0, quota_full: 0 }
  for (const project of projects) {
    if (project.status in counts && project.status !== 'all') {
      counts[project.status as SurveyAssignmentStatus] += 1
    }
  }
  return counts
}

export function filterByStatus(projects: AssignedProject[], filter: SurveyFilter) {
  return filter === 'all' ? projects : projects.filter((project) => project.status === filter)
}

export function ongoingFirst(projects: AssignedProject[]) {
  return [...projects].sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active'))
}

export function getProjectAction(project: AssignedProject) {
  if (project.status === 'complete') {
    return { disabled: true, label: 'Completed' }
  }
  if (project.status === 'terminate') {
    return { disabled: true, label: 'Terminated' }
  }
  if (project.status === 'quota_full') {
    return { disabled: true, label: 'Quota full' }
  }
  if (project.surveyUrl) {
    return { disabled: false, label: 'Continue survey', href: project.surveyUrl }
  }
  return { disabled: true, label: 'Link not available yet' }
}

export function rewardStatusLabel(status: AssignedProject['rewardStatus']) {
  if (status === 'credited') return 'Credited'
  return status === 'not_eligible' ? 'Not eligible' : 'Pending'
}
