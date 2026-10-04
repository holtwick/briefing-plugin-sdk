import { setupTestPlugin } from 'briefing-plugin-sdk/testing'
import { describe, expect, it } from 'vitest'
import manifest from '../plugin-manifest.json'
import Plugin from './index-client'

describe('plugin', () => {
  it('adds a stage document with a translated title', async () => {
    const { components, messages } = await setupTestPlugin(Plugin, { manifest })
    expect(components.map(c => c.placement)).toEqual(['presentation'])
    expect(components[0]!.title).toBe(`${manifest.id}.title`)
    expect(await messages('en')).toMatchObject({ title: 'Counter', hint: expect.any(String), increment: expect.any(String) })
    expect(Object.keys(await messages('de')).sort()).toEqual(Object.keys(await messages('en')).sort())
  })

  it('parses its config', async () => {
    expect((await setupTestPlugin(Plugin, { manifest })).config).toEqual({ step: 1 })
    expect((await setupTestPlugin(Plugin, { manifest, config: { step: '5' } })).config).toEqual({ step: 5 })
  })
})
