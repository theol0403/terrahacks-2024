import logoWhite from '@/assets/img/logo-white.png'
import logo from '@/assets/img/logo.png'
import { APP_TITLE, getUserConfig } from '@/config'
import ChatGPTQuery from '@/content-script/compenents/ChatGPTQuery'
import { getSummaryPrompt } from '@/content-script/prompt'
import { getPageSummaryComments, getPageSummaryContntent } from '@/content-script/utils'
import { commentSummaryPrompt, pageSummaryPrompt, pageSummaryPromptHighlight } from '@/utils/prompt'
import { isIOS } from '@/utils/utils'
import { XCircleFillIcon } from '@primer/octicons-react'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'preact/hooks'
import Browser from 'webextension-polyfill'

interface Props {
  pageSummaryWhitelist: string
  pageSummaryBlacklist: string
  siteRegex: RegExp
}

function PageSummary(props: Props) {
  const { pageSummaryWhitelist, pageSummaryBlacklist, siteRegex } = props
  const [showCard, setShowCard] = useState(false)
  const [supportSummary, setSupportSummary] = useState(true)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState<boolean>(false)

  const onSwitch = useCallback(() => {
    setShowCard((state) => {
      const cardState = !state

      if (cardState) {
        setQuestion('')
        setLoading(false)
      }

      return cardState
    })
  }, [])

  const onSummary = useCallback(async () => {
    setLoading(true)
    setSupportSummary(true)

    setQuestion('')

    const pageComments = await getPageSummaryComments()
    const pageContent = await getPageSummaryContntent()
    const article = pageComments ? pageComments : pageContent

    const title = article?.title || document.title || ''
    const description =
      article?.description ||
      document.querySelector('meta[name="description"]')?.getAttribute('content') ||
      ''
    const content = article?.content ? description + article?.content : title + description

    if (article?.content || description) {
      const language = window.navigator.language
      const userConfig = await getUserConfig()

      const promptContent = getSummaryPrompt(content.replace(/(<[^>]+>|\{[^}]+\})/g, ''))

      const prompt = pageComments?.content
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

      setQuestion(prompt)
      return
    }

    setSupportSummary(false)
  }, [])

  useEffect(() => {
    Browser.runtime.onMessage.addListener((message) => {
      const { type } = message
      if (type === 'OPEN_WEB_SUMMARY') {
        if (showCard) {
          return
        }

        setQuestion('')
        setShowCard(true)
        setLoading(false)
      }
    })
  }, [showCard])

  useEffect(() => {
    const hostname = location.hostname
    const blacklist = pageSummaryBlacklist.replace(/[\s\r\n]+/g, '')
    const whitelist = pageSummaryWhitelist.replace(/[\s\r\n]+/g, '')

    const inWhitelist = !whitelist
      ? !blacklist.includes(hostname)
      : !blacklist.includes(hostname) && pageSummaryWhitelist.includes(hostname)

    const show = (isIOS && inWhitelist) || (inWhitelist && !siteRegex?.test(hostname))

    setShow(show)
  }, [pageSummaryBlacklist, pageSummaryWhitelist, siteRegex])

  return (
    <>
      {showCard ? (
        <div className="glarity--card">
          <div className="glarity--card__head ">
            <div className="glarity--card__head--title">
              <a href="https://glarity.app" rel="noreferrer" target="_blank">
                <img src={logo} alt={APP_TITLE} /> {APP_TITLE}
              </a>{' '}
            </div>

            <div className="glarity--card__head--action">
              <button
                className={classNames('glarity--btn', 'glarity--btn__icon')}
                onClick={onSwitch}
              >
                <XCircleFillIcon />
              </button>
            </div>
          </div>

          <div className="glarity--card__content">
            {question ? (
              <div className="glarity--container">
                <div className="glarity--chatgpt">
                  <ChatGPTQuery question={question} />
                </div>
              </div>
            ) : (
              <div className="glarity--card__empty ">
                {!supportSummary ? (
                  'Sorry, the summary of this page is not supported.'
                ) : (
                  <button
                    className={classNames(
                      'glarity--btn',
                      'glarity--btn__primary',
                      // 'glarity--btn__large',
                      'glarity--btn__block',
                    )}
                    onClick={onSummary}
                    disabled={loading}
                  >
                    Summary
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        show && (
          <button
            onClick={onSwitch}
            className={classNames('glarity--btn', 'glarity--btn__launch', 'glarity--btn__primary')}
          >
            <img
              src={logoWhite}
              alt={APP_TITLE}
              className="glarity--w-5 glarity--h-5 glarity--rounded-sm"
            />
          </button>
        )
      )}
    </>
  )
}

export default PageSummary
