import { GeistProvider, Loading, Spinner } from '@geist-ui/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Browser from 'webextension-polyfill'
// import useSWRImmutable from 'swr/immutable'
import logo from '@/assets/img/logo-48.png'
import { APP_TITLE, getUserConfig, Theme } from '@/config'
import getQuestion from '@/content-script/compenents/GetQuestion'
import { SearchEngine } from '@/content-script/search-engine-configs'
import { copyTranscript, getConverTranscript } from '@/content-script/utils'
import { detectSystemColorScheme } from '@/utils/utils'
import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  GearIcon,
  SyncIcon,
} from '@primer/octicons-react'
import { queryParam } from 'gb-url'
import ChatGPTCard from './ChatGPTCard'
import { QueryStatus } from './ChatGPTQuery'

interface Props {
  question: string | null
  transcript?: unknown
  siteConfig: SearchEngine
  langOptionsWithLink?: unknown
  currentTime?: number
}

function ChatGPTContainer(props: Props) {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>()
  const [copied, setCopied] = useState(false)
  const [transcriptShow, setTranscriptShow] = useState(false)
  const [selectedOption, setSelectedOption] = useState(0)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(Theme.Auto)
  const [questionProps, setQuestionProps] = useState<Props>({ ...props })
  const [currentTranscript, setCurrentTranscript] = useState(props.transcript)

  const themeType = useMemo(() => {
    if (theme === Theme.Auto) {
      return detectSystemColorScheme()
    }
    return theme
  }, [theme])

  const handleChange = async (event) => {
    const val = event.target.value || ''
    const videoId = queryParam('v', window.location.href || '')

    if (val < 0 || !videoId) {
      return
    }

    setSelectedOption(val)

    const transcriptList = await getConverTranscript({
      langOptionsWithLink: questionProps.langOptionsWithLink,
      videoId,
      index: val,
    })

    setTranscriptShow(true)

    setCurrentTranscript(transcriptList)
  }

  const copytSubtitle = () => {
    const videoId = queryParam('v', window.location.href)
    copyTranscript(videoId, currentTranscript)
    setCopied(true)
  }

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  const onRefresh = useCallback(async () => {
    if (loading) {
      return
    }

    setLoading(true)

    let questionData = (await getQuestion()) as Props

    if (!questionData) {
      setLoading(false)
      return
    }
    questionData = Object.assign(questionData, { currentTime: Date.now() })

    setQuestionProps({ ...props, ...questionData })

    setQueryStatus(undefined)
  }, [props, loading])

  const onPlay = useCallback(async (starttime = 0) => {
    const videoElm = document.querySelector(
      '#movie_player > div.html5-video-container > video',
    ) as HTMLVideoElement
    if (!videoElm) {
      return
    }

    videoElm.currentTime = starttime
    videoElm.play()
  }, [])

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [copied])

  useEffect(() => {
    setQuestionProps({ ...props })

    if (props.transcript) {
      setCurrentTranscript([...props.transcript])
    }
  }, [props])

  useEffect(() => {
    if (queryStatus) {
      setLoading(false)
    }
  }, [queryStatus])

  useEffect(() => {
    getUserConfig().then((config) => setTheme(config.theme))
  }, [])

  const switchtranscriptShow = () => {
    setTranscriptShow((state) => !state)
  }

  return (
    <>
      <GeistProvider themeType={themeType}>
        <>
          <div className="glarity--chatgpt">
            <div className="glarity--header">
              <div>
                <a
                  href="https://glarity.app"
                  rel="noreferrer"
                  target="_blank"
                  className="glarity--header__logo"
                >
                  <img src={logo} alt={APP_TITLE} />
                  {APP_TITLE}
                </a>
                <a href="javascript:;" className="glarity--header__logo" onClick={openOptionsPage}>
                  <GearIcon size={14} />
                </a>

                {loading ? (
                  <span className="glarity--header__logo">
                    <Spinner className="glarity--icon--loading" />
                  </span>
                ) : (
                  <a href="javascript:;" className="glarity--header__logo" onClick={onRefresh}>
                    <SyncIcon size={14} />
                  </a>
                )}
              </div>

              <div className="glarity--chatgpt__action"></div>
            </div>

            <div className="glarity--main">
              <div className="glarity--main__container">
                {questionProps.question ? (
                  <>
                    {
                      <>
                        {loading && (
                          <div className="glarity--main__loading">
                            <Loading />
                          </div>
                        )}
                        <ChatGPTCard
                          question={questionProps.question}
                          onStatusChange={setQueryStatus}
                          currentTime={questionProps.currentTime}
                        />
                      </>
                    }
                  </>
                ) : questionProps.siteConfig?.name === 'youtube' ? (
                  <>
                    <p>No Transcription Available... </p>
                    <p>
                      Try{' '}
                      <a
                        href="https://huggingface.co/spaces/jeffistyping/Youtube-Whisperer"
                        rel="noreferrer"
                        target="_blank"
                      >
                        Youtube Whisperer
                      </a>{' '}
                      to transcribe!
                    </p>
                  </>
                ) : (
                  <p>
                    <AlertIcon size={14} /> No results.
                  </p>
                )}
              </div>
            </div>

            {questionProps.question && currentTranscript && (
              <div className="glarity--main">
                <div className="glarity--main__header">
                  <div className="glarity--main__header--title">Transcript</div>
                  <div className="glarity--main__header--action">
                    <a href="javascript:;" onClick={copytSubtitle}>
                      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    </a>

                    <a href="javascript:;" onClick={switchtranscriptShow}>
                      {transcriptShow ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                    </a>
                  </div>
                </div>

                <div
                  className="glarity--main__container glarity--main__container--subtitle"
                  style={{
                    display: transcriptShow ? 'block' : 'none',
                  }}
                >
                  {currentTranscript.map((v, i) => {
                    const { time, text } = v

                    return (
                      <div className="glarity--subtitle" key={i}>
                        <div
                          className="subtitle--time"
                          onClick={() => {
                            onPlay(v.start || 0)
                          }}
                        >
                          {time}
                        </div>
                        <div
                          className="subtitle--text"
                          dangerouslySetInnerHTML={{ __html: text }}
                        ></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      </GeistProvider>
    </>
  )
}

export default ChatGPTContainer
