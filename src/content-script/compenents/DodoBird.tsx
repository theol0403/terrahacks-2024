import standing from '@/assets/img/logo.png'
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
  const [flying, setFlying] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dodoRef = useRef<HTMLDivElement | null>(null)
  const { displayedText: typedMessage, isComplete } = useTypingEffect(message, 30, talking)
  // Define GIF URLs
  const defaultGif = standing
  const talkingGif =
    'https://cdn.discordapp.com/attachments/1256733655724724224/1269447662386544690/ezgif.com-animated-gif-maker.gif?ex=66b018c3&is=66aec743&hm=f239890ed228235a6eac5779efd6bc94861cfd5b67ca4baa9e5436f67c2b5faa&'
  const flyingGif =
    'https://cdn.discordapp.com/attachments/1256733655724724224/1269449640793870446/ezgif.com-animated-gif-maker_2.gif?ex=66b01a9b&is=66aec91b&hm=200219b3793819ac3bf012db106b14b14990bb7b3ac51e044a76df6df52fcbfd&'
  // Determine which GIF to display
  let currentGif = defaultGif
  if (talking) {
    currentGif = talkingGif
  } else if (flying || isDragging) {
    currentGif = flyingGif
  }

  useEffect(() => {
    const updatePosition = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const dodoWidth = dodoRef.current?.offsetWidth || 100
      const dodoHeight = dodoRef.current?.offsetHeight || 140
      setPosition({
        x: windowWidth - dodoWidth - 100,
        y: windowHeight - dodoHeight,
      })
    }

    // Set initial position and add resize event listener
    updatePosition()
    setTimeout(() => {
      updatePosition()
    }, 100)
    setTimeout(() => {
      setFlying(false)
    }, 2000)
    setTimeout(() => {
      setTalking(true)
    }, 3000)
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
    }, 1500)
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
          'dodo-bird--dragging': isDragging,
        })}
        onClick={handleClick}
      >
        <img src={currentGif} alt="Dodo Bird" />
        {talking && (
          <div className="speech-bubble">
            <p>{typedMessage}</p>
            <button
              className={classNames('open-new-tab-button', { show: isComplete })}
              onClick={() => {
                window.open(url, '_blank')
              }}
            >
              Play!
            </button>
          </div>
        )}
      </div>
    </Draggable>
  )
}

export default memo(DodoBird)
