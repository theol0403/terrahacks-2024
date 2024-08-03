import { getUserConfig } from '@/config'
import ChatGPTQuery from '@/content-script/compenents/ChatGPTQuery'
import { getSummaryPrompt } from '@/content-script/prompt'
import { getPageSummaryContntent } from '@/content-script/utils'
import { pageSummaryPrompt, pageSummaryPromptHighlight } from '@/utils/prompt'
import { useEffect, useState } from 'preact/hooks'

interface Props {
  pageSummaryWhitelist: string
  pageSummaryBlacklist: string
}

function PageSummary(props: Props) {
  const { pageSummaryWhitelist, pageSummaryBlacklist } = props
  const [question, setQuestion] = useState('')

  useEffect(() => {
    const hostname = location.hostname
    const blacklist = pageSummaryBlacklist.replace(/[\s\r\n]+/g, '')
    const whitelist = pageSummaryWhitelist.replace(/[\s\r\n]+/g, '')

    const inWhitelist = !whitelist
      ? !blacklist.includes(hostname)
      : !blacklist.includes(hostname) && pageSummaryWhitelist.includes(hostname)

    async function buildQuestion() {
      const pageContent = await getPageSummaryContntent()

      const title = pageContent?.title || document.title || ''
      const description =
        pageContent?.description ||
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        ''
      const content = pageContent?.content
        ? description + pageContent?.content
        : title + description

      if (!inWhitelist) {
        console.log('Not showing summary because of blacklist or whitelist')
      }

      if (inWhitelist && (pageContent?.content || description)) {
        const language = window.navigator.language
        const userConfig = await getUserConfig()

        const promptContent = getSummaryPrompt(content.replace(/(<[^>]+>|\{[^}]+\})/g, ''))

        return pageSummaryPrompt({
          content: promptContent,
          language: language,
          prompt: userConfig.promptPage ? userConfig.promptPage : pageSummaryPromptHighlight,
        })
      } else {
        console.log('Summary not supported because no content or description')
        return ''
      }
    }

    buildQuestion().then((prompt) => {
      setQuestion(prompt)
    })
  }, [pageSummaryBlacklist, pageSummaryWhitelist])

  if (question) return <ChatGPTQuery question={question} />
}

export default PageSummary
