import logo from '@/assets/img/logo.png'
import classNames from 'classnames'
import { useState } from 'preact/hooks'
import { memo } from 'react'

import '@/content-script/styles.scss'

interface Props {
  animal: string
  message: string
  url: string
}

function DodoBird(props: Props) {
  const { animal, message, url } = props

  const [talking, setTalking] = useState(false)

  return (
    <div
      className={classNames('dodo-bird', { 'dodo-bird--talking': talking })}
      onClick={() => setTalking(!talking)}
    >
      <img src={logo} alt="Dodo Bird" />
      {talking && (
        <div className="speech-bubble">
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}

export default memo(DodoBird)
