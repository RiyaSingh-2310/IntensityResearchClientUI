import type { PaginatedResponse } from '@/types/common'
import type { AssignedProject, ProjectQuery } from '@/types/project'
import { surveyService } from './survey.service'

export const projectService = {
  getAssigned(query: ProjectQuery = { sort: 'assignedAt:desc' }): Promise<PaginatedResponse<AssignedProject>> {
    if (query.status || query.page || query.limit) return surveyService.list(query)
    return surveyService.listAll(query.sort)
  },
  getById(id: string | number) {
    return surveyService.getById(id)
  },
}
