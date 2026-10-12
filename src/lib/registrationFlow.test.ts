import assert from 'node:assert/strict'
import { buildProfileAnswers, type FormQuestion } from './profileQuestions'
import { registerRequestBody } from '@/services/auth.service'
import { emptyRegisterForm, firstInvalidStep, registerSteps, validateRegisterForm, validateRegisterStep } from './validation'
import type { ProfileSections } from './profileQuestions'

const sections: ProfileSections = {
  demographics: [
    {
      key: '27',
      section: 'demographics',
      label: 'Which industry does your organization primarily operate in?',
      fieldType: 'dropdown',
      required: true,
      options: [{ value: '357', label: '1. Healthcare & Pharmaceuticals' }],
      api: {
        id: 27,
        step_no: 2,
        question_text: 'Which industry does your organization primarily operate in?',
        field_type: 'dropdown',
        dropdown_category: 'Industry',
        is_required: 1,
        options: [{ id: 357, name: '1. Healthcare & Pharmaceuticals' }],
      },
    } satisfies FormQuestion,
  ],
  lifestyle: [],
  preferences: [],
}

const emptyErrors = validateRegisterStep(emptyRegisterForm, 'account', sections)
assert.ok(emptyErrors.firstName)
assert.ok(emptyErrors.email)
assert.ok(emptyErrors.password)

const invalidEmail = validateRegisterStep(
  { ...emptyRegisterForm, firstName: 'Riya', lastName: 'Singh', email: 'not-an-email', password: 'short', confirmPassword: 'short' },
  'account',
  sections,
)
assert.equal(invalidEmail.email, 'Enter a valid email address.')
assert.equal(invalidEmail.password, 'Use at least 8 characters.')

const validAccount = {
  ...emptyRegisterForm,
  firstName: 'Riya',
  lastName: 'Singh',
  email: 'riya@example.com',
  password: 'PanelTest1',
  confirmPassword: 'PanelTest1',
}
assert.deepEqual(validateRegisterStep(validAccount, 'account', sections), {})

const missingIndustry = validateRegisterForm(validAccount, sections, registerSteps)
assert.ok(missingIndustry['q-27'])
assert.equal(firstInvalidStep(validAccount, sections, registerSteps), 1)

const withIndustry = {
  ...validAccount,
  answers: { '27': '357' },
  acceptTerms: true,
  acceptPrivacy: true,
}
assert.equal(missingIndustry['q-27'] ? validateRegisterStep(withIndustry, 'demographics', sections)['q-27'] : 'present', undefined)

const saved = buildProfileAnswers(sections.demographics, withIndustry.answers)
assert.deepEqual(saved.answers, [{ question_id: 27, answer_ref_id: 357 }])

const registerBody = registerRequestBody({
  name: 'Riya Singh',
  email: 'riya@example.com',
  password: 'PanelTest1',
  phone: '+919876543210',
})
assert.deepEqual(Object.keys(registerBody).sort(), ['email', 'name', 'password', 'phone'])
assert.equal('profile_type' in registerBody, false)
assert.equal('panels' in registerBody, false)

console.log('registration flow tests passed')
