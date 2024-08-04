import Browser from 'webextension-polyfill'
import { OpenAIProvider } from './providers/openai'

async function generateAnswers(port: Browser.Runtime.Port, question: string) {

  const provider = new OpenAIProvider()

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    cleanup?.()
  })

  const { cleanup } = await provider.generateAnswer({
    prompt: question,
    signal: controller.signal,
    onEvent(event) {
      if (event.type === 'done') {
        port.postMessage({ event: 'DONE' })
        return
      }
      port.postMessage(event.data)
    },
  })
}

async function createTab(url) {
  Browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
    console.log('getCurrent', tabs)
    const tab = tabs[0]

    if (tab.id) {
      Browser.storage.local.set({ glarityTabId: tab.id })
    }
  })

  const oldTabId = await Browser.storage.local.get('pinnedTabId')
  let tab
  if (oldTabId.pinnedTabId) {
    try {
      tab = await Browser.tabs.get(oldTabId.pinnedTabId)
      Browser.tabs.update(tab.id, { active: true, pinned: true })
    } catch (error) {
      console.error(error)
    }
  }
  if (!tab) {
    tab = await Browser.tabs.create({
      url,
      pinned: true,
      active: true,
    })
  }
  Browser.storage.local.set({ pinnedTabId: tab.id })
  return { pinnedTabId: tab.id }
}

Browser.runtime.onConnect.addListener(async (port) => {
  port.onMessage.addListener(async (msg) => {
    console.debug('received msg', msg)
    try {
      await generateAnswers(port, msg.question)
    } catch (err: any) {
      // console.error(err)
      port.postMessage({ error: err.message })
    }
  })
})

Browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
  } else if (message.type === 'NEW_TAB') {
    return createTab(message.data.url)
  } else if (message.type === 'GO_BACK') {
    const tab = await Browser.storage.local.get('glarityTabId')

    if (tab.glarityTabId) {
      Browser.tabs.update(tab.glarityTabId, { active: true }).catch(() => {
        Browser.tabs.create({ url: 'about:newtab', active: true })
      })
    } else {
      Browser.tabs.create({ url: 'about:newtab', active: true })
    }
  }
})

