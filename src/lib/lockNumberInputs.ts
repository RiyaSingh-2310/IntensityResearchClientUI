const STEPPER_KEYS = new Set(['ArrowUp', 'ArrowDown'])

export function isNumberStepperKey(key: string) {
  return STEPPER_KEYS.has(key)
}

function isFocusedNumberInput(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement && target.type === 'number' && document.activeElement === target
}

/**
 * Stops mouse-wheel and ArrowUp/ArrowDown from changing focused number inputs.
 * Does not affect text, date, select, range, or unfocused controls.
 */
export function installNumberInputLock() {
  const onWheel = (event: WheelEvent) => {
    if (!isFocusedNumberInput(event.target)) return
    event.preventDefault()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isNumberStepperKey(event.key) || !isFocusedNumberInput(event.target)) return
    event.preventDefault()
  }

  document.addEventListener('wheel', onWheel, { passive: false, capture: true })
  document.addEventListener('keydown', onKeyDown, true)

  return () => {
    document.removeEventListener('wheel', onWheel, true)
    document.removeEventListener('keydown', onKeyDown, true)
  }
}
