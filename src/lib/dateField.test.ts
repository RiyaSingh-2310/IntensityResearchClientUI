import assert from 'node:assert/strict'
import { dateFieldError, formatIsoDate, monthGrid, parseIsoDate, todayIso, toIsoDate } from './dateField'

assert.equal(parseIsoDate('2026-02-31'), null)
assert.deepEqual(parseIsoDate('2026-10-21'), { year: 2026, month: 10, day: 21 })
assert.equal(toIsoDate(2026, 10, 21), '2026-10-21')
assert.equal(formatIsoDate('2026-10-21'), 'Oct 21, 2026')
assert.equal(dateFieldError(''), '')
assert.equal(dateFieldError('2026-02-31'), 'Please enter a valid date of birth.')
assert.equal(dateFieldError('1899-12-31'), 'Please enter a valid date of birth.')
assert.equal(dateFieldError('2099-01-01', '2026-10-21'), 'Please enter a valid date of birth.')
assert.equal(dateFieldError('2000-01-15', '2026-10-21'), '')
assert.equal(todayIso(new Date(2026, 9, 21)), '2026-10-21')
assert.equal(monthGrid(2026, 10)[0].iso, '2026-09-27')
assert.ok(monthGrid(2026, 10).some((cell) => cell.iso === '2026-10-21' && cell.inMonth))

console.log('date field tests passed')
