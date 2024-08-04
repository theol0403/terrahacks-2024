import logo from '@/assets/img/logo.png'
import '@/content-script/styles.scss'
import classNames from 'classnames'
import { memo, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import useTypingEffect from './TypingAnimation'

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
  const [isDragging, setIsDragging] = useState(false)
  const dodoRef = useRef<HTMLDivElement | null>(null)
  const typedMessage = useTypingEffect(message, 30, talking) // Use the custom hook with a speed of 200ms

  useEffect(() => {
    const updatePosition = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const dodoWidth = dodoRef.current?.offsetWidth || 100
      const dodoHeight = dodoRef.current?.offsetHeight || 140
      setPosition({
        x: windowWidth - dodoWidth,
        y: windowHeight - dodoHeight,
      })
    }

    // Set initial position and add resize event listener
    updatePosition()
    // set position after 0.5s
    setTimeout(() => {
      updatePosition()
    }, 500)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('resize', updatePosition)
    }
  }, [])

  const handleStop = (e, data) => {
    setIsDragging(false)
    setFlying(true)
    const windowHeight = window.innerHeight
    const dodoHeight = dodoRef.current?.offsetHeight || 100

    const endY = windowHeight - dodoHeight

    setPosition({ x: data.x, y: endY })

    setTimeout(() => {
      setFlying(false)
    }, 1000)
  }

  const handleStart = () => {
    setIsDragging(true)
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

  const handleClick = () => {
    if (!isDragging) {
      setTalking(!talking)
    }
  }

  return (
    <Draggable onStart={handleStart} onStop={handleStop} position={position} disabled={flying}>
      <div
        ref={dodoRef}
        className={classNames('dodo-bird', {
          'dodo-bird--talking': talking,
          'dodo-bird--flying': flying,
        })}
        onClick={handleClick}
      >
        <img src={logo} alt="Dodo Bird" />
        {talking && (
          <div className="speech-bubble">
            <p>{typedMessage}</p>
          </div>
        )}
      </div>
    </Draggable>
  )
}

export default memo(DodoBird)
