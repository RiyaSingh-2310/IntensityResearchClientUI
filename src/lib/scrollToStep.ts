export function scrollToRegistrationStep(element: HTMLElement | null) {
  if (!element) return
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
