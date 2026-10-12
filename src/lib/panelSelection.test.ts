import assert from 'node:assert/strict'
import { panelPromptFor } from './panelSelection'

const healthcare = ['b2b', 'healthcare', 'patient'] as const
const standard = ['b2b', 'patient'] as const

assert.equal(panelPromptFor({ industryLabel: '', eligible: [], created: [], saved: null }).status, 'missing-industry')
assert.deepEqual(
  panelPromptFor({ industryLabel: '3. Technology & IT', eligible: standard, created: [], saved: null }),
  { status: 'choose', options: ['b2b', 'patient'] },
)
assert.deepEqual(
  panelPromptFor({ industryLabel: '1. Healthcare & Pharmaceuticals', eligible: healthcare, created: [], saved: null }).status,
  'choose',
)
assert.equal(
  panelPromptFor({
    industryLabel: '2. Financial Services',
    eligible: standard,
    created: [],
    saved: { industry: '2. Financial Services', kinds: ['b2b'] },
  }).status,
  'retry',
)
assert.equal(
  panelPromptFor({
    industryLabel: '3. Technology & IT',
    eligible: standard,
    created: ['b2b'],
    saved: { industry: '3. Technology & IT', kinds: ['b2b'] },
  }).status,
  'complete',
)
assert.equal(
  panelPromptFor({
    industryLabel: '3. Technology & IT',
    eligible: standard,
    created: [],
    saved: { industry: '3. Technology & IT', kinds: [] },
  }).status,
  'complete',
)
assert.equal(
  panelPromptFor({
    industryLabel: '1. Healthcare & Pharmaceuticals',
    eligible: healthcare,
    created: ['b2b'],
    saved: { industry: '3. Technology & IT', kinds: ['b2b'] },
  }).status,
  'choose',
)
assert.equal(
  panelPromptFor({ industryLabel: '4. Consumer & Retail', eligible: standard, created: ['patient'], saved: null }).status,
  'complete',
)

console.log('panel selection tests passed')
