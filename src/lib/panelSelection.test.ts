import assert from 'node:assert/strict'
import { initialPanelSelection, panelPromptFor } from './panelSelection'

const healthcare = ['b2b', 'healthcare', 'patient'] as const
const standard = ['b2b', 'patient'] as const

assert.equal(panelPromptFor({ industryLabel: '', eligible: [], created: [], saved: null }).status, 'missing-industry')
assert.deepEqual(
  panelPromptFor({ industryLabel: '3. Technology & IT', eligible: standard, created: [], saved: null }),
  { status: 'choose', options: ['b2b', 'patient'] },
)
assert.deepEqual(
  panelPromptFor({ industryLabel: '1. Healthcare & Pharmaceuticals', eligible: healthcare, created: [], saved: null }),
  { status: 'choose', options: ['b2b', 'healthcare', 'patient'] },
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
assert.deepEqual(
  panelPromptFor({
    industryLabel: '3. Technology & IT',
    eligible: standard,
    created: ['b2b'],
    saved: { industry: '3. Technology & IT', kinds: ['b2b'] },
  }),
  { status: 'choose', options: ['patient'] },
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
assert.deepEqual(
  panelPromptFor({
    industryLabel: '1. Healthcare & Pharmaceuticals',
    eligible: healthcare,
    created: ['b2b'],
    saved: { industry: '3. Technology & IT', kinds: ['b2b'] },
  }),
  { status: 'choose', options: ['healthcare', 'patient'] },
)
assert.deepEqual(
  panelPromptFor({
    industryLabel: '2. Financial Services',
    eligible: standard,
    created: ['b2b'],
    saved: { industry: '2. Financial Services', kinds: ['b2b', 'patient'] },
  }),
  { status: 'retry', options: ['patient'], pending: ['patient'] },
)
assert.deepEqual(
  panelPromptFor({ industryLabel: '4. Consumer & Retail', eligible: standard, created: ['patient'], saved: null }),
  { status: 'choose', options: ['b2b'] },
)
assert.equal(
  panelPromptFor({
    industryLabel: '2. Financial Services',
    eligible: standard,
    created: ['b2b', 'patient'],
    saved: null,
  }).status,
  'complete',
)

assert.equal(initialPanelSelection(['b2b', 'patient']), 'b2b')
assert.equal(initialPanelSelection(['patient', 'healthcare']), 'patient')
assert.equal(initialPanelSelection([]), null)
assert.equal(initialPanelSelection(['patient'], ['b2b']), 'patient')
assert.equal(initialPanelSelection(['healthcare', 'patient'], ['healthcare', 'patient']), 'healthcare')
assert.equal(initialPanelSelection(['b2b', 'patient'], ['healthcare']), 'b2b')

console.log('panel selection tests passed')
