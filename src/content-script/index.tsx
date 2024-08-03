import '@/assets/styles/base.scss'
import { getUserConfig } from '@/config'
import mount from '@/content-script/compenents/Mount'
import PageSummary from '@/content-script/compenents/PageSummary'
import { config } from '@/content-script/search-engine-configs'
import '@/content-script/styles.scss'
import { render } from 'preact'
import Browser from 'webextension-polyfill'
import getQuestion from './compenents/GetQuestion'
import { siteConfig as sietConfigFn } from './utils'

const siteConfig = sietConfigFn()

async function Run() {
  const userConfig = await getUserConfig()
  const siteRegex = new RegExp(
    Object.values(config)
      .map((v) => {
        return v.regex
      })
      .join('|'),
  )
  const container = document.createElement('section')
  container.className = 'glarity--summary'
  document.body.prepend(container)
  render(
    <PageSummary
      pageSummaryEnable={userConfig.pageSummaryEnable}
      pageSummaryWhitelist={userConfig.pageSummaryWhitelist}
      pageSummaryBlacklist={userConfig.pageSummaryBlacklist}
      siteRegex={siteRegex}
    />,
    container,
  )

  const questionData = await getQuestion()
  if (questionData) {
    mount(questionData)
  }

  Browser.runtime.onMessage.addListener((message, _, sendResponse) => {
    const { type } = message
    switch (type) {
      case 'GET_DOM': {
        sendResponse({ html: document.querySelector('html')?.outerHTML })
        break
      }
    }
  })
}

Run()

if (siteConfig?.watchRouteChange) {
  siteConfig.watchRouteChange(Run)
}
