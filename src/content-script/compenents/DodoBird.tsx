import logo from '@/assets/img/logo.png'
import '@/content-script/styles.scss'
import classNames from 'classnames'
import { memo, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'

interface Props {
  animal: string
  message: string
  url: string
}

function DodoBird(props: Props) {
  const { animal, message, url } = props
  const [talking, setTalking] = useState(false)
  const [flying, setFlying] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dodoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Set initial position at the bottom center
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const dodoWidth = dodoRef.current?.offsetWidth || 100
    const dodoHeight = dodoRef.current?.offsetHeight || 100
    setPosition({
      x: (windowWidth - dodoWidth) / 2,
      y: windowHeight - dodoHeight,
    })
  }, [])

  const handleStop = (e, data) => {
    setFlying(true)
    const windowHeight = window.innerHeight
    const dodoHeight = dodoRef.current?.offsetHeight || 100

    const endY = windowHeight - dodoHeight

    setPosition({ x: data.x, y: endY })

    setTimeout(() => {
      setFlying(false)
    }, 1000)
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
    <Draggable onStop={handleStop} position={position} disabled={flying}>
      <div
        ref={dodoRef}
        className={classNames('dodo-bird', {
          'dodo-bird--talking': talking,
          'dodo-bird--flying': flying,
        })}
        onClick={() => setTalking(!talking)}
      >
        <img src={logo} alt="Dodo Bird" />
        {talking && (
          <div className="speech-bubble">
            <p>{message}</p>
          </div>
        )}
      </div>
    </Draggable>
  )
}

export default memo(DodoBird)
