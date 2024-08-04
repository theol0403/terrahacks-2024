import { getUserConfig } from '@/config'
import PageSummary from '@/content-script/components/PageSummary'
import '@/content-script/styles.scss'
import { render } from 'preact'

async function Run() {
  const userConfig = await getUserConfig()
  const container = document.createElement('section')
  container.className = 'dodo-bird-container'
  document.body.prepend(container)
  render(
    <PageSummary
      pageSummaryWhitelist={userConfig.pageSummaryWhitelist}
      pageSummaryBlacklist={userConfig.pageSummaryBlacklist}
    />,
    container,
  )
}

Run()
