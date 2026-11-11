import { afterEach, describe, expect, it, vi } from 'vitest'
import { mailTo, shouldEnforceAppCheck } from './params'

describe('mailTo', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it.each([
    ['contact', 'CONTACT_MAIL_TO'],
    ['safety', 'SAFETY_MAIL_TO'],
    ['recruit', 'RECRUIT_MAIL_TO'],
  ] as const)('%s の宛先はパラメータ %s から読む', (formType, name) => {
    vi.stubEnv(name, `${formType}@example.com`)
    expect(mailTo(formType)).toBe(`${formType}@example.com`)
  })
})

describe('shouldEnforceAppCheck', () => {
  it('本番（Emulator 以外）では App Check を強制する', () => {
    expect(shouldEnforceAppCheck({})).toBe(true)
  })

  it('Functions Emulator では強制しない（トークンを検証しないため）', () => {
    expect(shouldEnforceAppCheck({ FUNCTIONS_EMULATOR: 'true' })).toBe(false)
  })
})
