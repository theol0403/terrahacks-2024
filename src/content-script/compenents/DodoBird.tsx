import logo from '@/assets/img/logo.png'
import '@/content-script/styles.scss'
import classNames from 'classnames'
import { memo, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { animated, useSpring } from 'react-spring'

interface Props {
  animal: string
  message: string
  url: string
}

function DodoBird(props: Props) {
  const { animal, message, url } = props
  const [talking, setTalking] = useState(false)
  const dodoRef = useRef<HTMLDivElement>(null)

  const [{ y }, api] = useSpring(() => ({ y: 0 }))

  const handleStop = () => {
    if (dodoRef.current) {
      const windowHeight = window.innerHeight
      const dodoHeight = dodoRef.current.clientHeight
      const targetY = windowHeight - dodoHeight

      api.start({
        y: targetY,
        config: { tension: 200, friction: 10, mass: 1 },
      })
    }
  }

  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      event.preventDefault()
    }

    const node = dodoRef.current
    if (node) {
      node.addEventListener('dragstart', handleDragStart)
    }

    return () => {
      if (node) {
        node.removeEventListener('dragstart', handleDragStart)
      }
    }
  }, [])

  return (
    <Draggable onStop={handleStop}>
      <animated.div
        ref={dodoRef}
        className={classNames('dodo-bird', { 'dodo-bird--talking': talking })}
        onClick={() => setTalking(!talking)}
        style={{ y }}
      >
        <img src={logo} alt="Dodo Bird" />
        {talking && (
          <div className="speech-bubble">
            <p>{message}</p>
          </div>
        )}
      </animated.div>
    </Draggable>
  )
}

export default memo(DodoBird)
