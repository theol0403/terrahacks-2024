import { Answer } from '@/messaging'
import classNames from 'classnames'
import { debounce } from 'lodash-es'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { memo, useMemo } from 'react'
import Browser from 'webextension-polyfill'

import '@/content-script/styles.scss'
import DodoBird from './DodoBird'

export type QueryStatus = 'success' | 'error' | 'done' | undefined

interface Props {
  question: string
  onStatusChange?: (status: QueryStatus) => void
  currentTime?: number
}

function ChatGPTQuery(props: Props) {
  const { onStatusChange, currentTime, question } = props

  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<QueryStatus>()
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const requestGpt = useMemo(() => {
    console.log('question', question)

    return debounce(() => {
      setStatus(undefined)

      const port = Browser.runtime.connect()
      const listener = (msg: any) => {
        if (msg.text) {
          const text = msg.text || ''
          setAnswer({ ...msg, ...{ text } })
          setStatus('success')
        } else if (msg.error) {
          console.log(msg)
          setError(msg.error)
          setStatus('error')
        } else if (msg.event === 'DONE') {
          setStatus('done')
        }
      }
      port.onMessage.addListener(listener)
      port.postMessage({ question })
      return () => {
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }, 1000)
  }, [question])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  useEffect(() => {
    requestGpt()
  }, [question, currentTime, requestGpt])

  // retry error on focus
  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

  useEffect(() => {
    const wrap: HTMLDivElement | null = wrapRef.current
    if (!wrap) {
      return
    }

    if (answer) {
      wrap.scrollTo({
        top: 10000,
        behavior: 'smooth',
      })
    }
  }, [answer])

  if (answer?.text) {
    try {
      const prompt = JSON.parse(answer.text)
      console.log('answer', prompt)
      const { contain_endangered, endangered_species, fun_fact } = prompt as {
        contain_endangered: boolean
        endangered_species: string
        fun_fact: string
      }
      if (contain_endangered && fun_fact) {
        return (
          <DodoBird animal="Dodo Bird" message={fun_fact} url="https://www.openai.com/"></DodoBird>
        )
      }
    } catch (e) {
      // console.error('Failed to parse JSON', e)
    }
  }

  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE') {
    return (
      <p>
        {
          <>
            Please set OpenAI API Key in the{' '}
            <button
              className={classNames('glarity--btn', 'glarity--btn__primary', 'glarity--btn__small')}
              onClick={openOptionsPage}
            >
              extension options
            </button>
            .
          </>
        }
      </p>
    )
  }
  if (error) {
    return (
      <p>
        Failed to load response from ChatGPT:
        <span className="glarity--break-all glarity--block">{error}</span>
        <a
          href="javascript:void(0)"
          onClick={() => {
            setError('')
          }}
        >
          Retry
        </a>
        <br />
        If this keeps happening, change AI provider to OpenAI API in the{' '}
        <button
          className={classNames('glarity--btn', 'glarity--btn__primary', 'glarity--btn__small')}
          onClick={openOptionsPage}
        >
          extension options
        </button>
        .
      </p>
    )
  }

  return <></>
}

export default memo(ChatGPTQuery)
