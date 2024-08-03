import logo from '@/assets/img/logo.png'
import { APP_TITLE, getUserConfig } from '@/config'
import ChatGPTQuery from '@/content-script/compenents/ChatGPTQuery'
import { getSummaryPrompt } from '@/content-script/prompt'
import { getPageSummaryComments, getPageSummaryContntent } from '@/content-script/utils'
import { commentSummaryPrompt, pageSummaryPrompt, pageSummaryPromptHighlight } from '@/utils/prompt'
import { useEffect, useState } from 'preact/hooks'

interface Props {
  pageSummaryWhitelist: string
  pageSummaryBlacklist: string
  siteRegex: RegExp
}

function PageSummary(props: Props) {
  const { pageSummaryWhitelist, pageSummaryBlacklist, siteRegex } = props
  const [question, setQuestion] = useState('')

  useEffect(() => {
    const hostname = location.hostname
    const blacklist = pageSummaryBlacklist.replace(/[\s\r\n]+/g, '')
    const whitelist = pageSummaryWhitelist.replace(/[\s\r\n]+/g, '')

    const inWhitelist = !whitelist
      ? !blacklist.includes(hostname)
      : !blacklist.includes(hostname) && pageSummaryWhitelist.includes(hostname)

    const show = inWhitelist && !siteRegex?.test(hostname)

    async function buildQuestion() {
      const pageComments = await getPageSummaryComments()
      const pageContent = await getPageSummaryContntent()
      const article = pageComments ? pageComments : pageContent

      const title = article?.title || document.title || ''
      const description =
        article?.description ||
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        ''
      const content = article?.content ? description + article?.content : title + description

      if (!show) {
        console.log('Not showing summary because of blacklist or whitelist')
      }

      if (show && (article?.content || description)) {
        const language = window.navigator.language
        const userConfig = await getUserConfig()

        const promptContent = getSummaryPrompt(content.replace(/(<[^>]+>|\{[^}]+\})/g, ''))

        return pageComments?.content
          ? commentSummaryPrompt({
              content: promptContent,
              language: language,
              prompt: userConfig.promptComment
                ? userConfig.promptComment
                : pageSummaryPromptHighlight,
              rate: article?.['rate'],
            })
          : pageSummaryPrompt({
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
  }, [pageSummaryBlacklist, pageSummaryWhitelist, siteRegex])

  if (question)
    return (
      <div className="glarity--card">
        <div className="glarity--card__head ">
          <div className="glarity--card__head--title">
            <a href="https://glarity.app" rel="noreferrer" target="_blank">
              <img src={logo} alt={APP_TITLE} /> {APP_TITLE}
            </a>{' '}
          </div>
        </div>

        <div className="glarity--card__content">
          <div className="glarity--container">
            <div className="glarity--chatgpt">
              <ChatGPTQuery question={question} />
            </div>
          </div>
        </div>
      </div>
    )
}

export default PageSummary
