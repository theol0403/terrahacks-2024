import beans from '@/assets/img/beans.png'
// import chips from '@/assets/img/chips.png'
import standing from '@/assets/img/logo.png'
import water from '@/assets/img/water.png'
import '@/content-script/styles.scss'
import classNames from 'classnames'
import { memo, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import useTypingEffect from './TypingAnimation'

interface Props {
  animal: string
  message: string
  url: string
  garbage: boolean
}

function DodoBird(props: Props) {
  const { animal, message, url, garbage } = props
  const [talking, setTalking] = useState(false)
  const [flying, setFlying] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [pickingUpTrash, setPickingUpTrash] = useState(false)
  const [trash, setTrash] = useState<{ id: number; x: number; y: number; src: string }[]>([])
  const dodoRef = useRef<HTMLDivElement | null>(null)
  const { displayedText: typedMessage, isComplete } = useTypingEffect(message, 30, talking)
  const defaultGif = standing
  const talkingGif =
    'https://cdn.discordapp.com/attachments/1256733655724724224/1269447662386544690/ezgif.com-animated-gif-maker.gif?ex=66b018c3&is=66aec743&hm=f239890ed228235a6eac5779efd6bc94861cfd5b67ca4baa9e5436f67c2b5faa&'
  const flyingGif =
    'https://cdn.discordapp.com/attachments/1256733655724724224/1269449640793870446/ezgif.com-animated-gif-maker_2.gif?ex=66b01a9b&is=66aec91b&hm=200219b3793819ac3bf012db106b14b14990bb7b3ac51e044a76df6df52fcbfd&'
  const talkFlyingGif =
    'https://cdn.discordapp.com/attachments/1256733655724724224/1269449233900241129/ezgif.com-animated-gif-maker_1.gif?ex=66b01a3a&is=66aec8ba&hm=ccf20c97f1ec32e1207bf54b15981e2191a876217904d7670463de6454c12ab7&'
  const trashGif =
    'https://cdn.discordapp.com/attachments/1256733655724724224/1269538505030238281/Garbage_Pickup_DODO.png?ex=66b06d5e&is=66af1bde&hm=30183c405fdac9cd3d6dd77da06fbb72452f99d372c0e428844a785ee5a7800d&'

  let currentGif = defaultGif
  if (pickingUpTrash) {
    currentGif = trashGif
  } else if (talking && (flying || isDragging)) {
    currentGif = talkFlyingGif
  } else if (talking) {
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
    flyToBottom(data.x)
  }

  const handleStart = () => {
    setIsDragging(true)
  }

  const flyToBottom = (x: number) => {
    const windowHeight = window.innerHeight
    const dodoHeight = dodoRef.current?.offsetHeight || 100
    const endY = windowHeight - dodoHeight
    setFlying(true)
    setPosition({ x, y: endY })
    setTimeout(() => {
      setFlying(false)
    }, 1500)
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

  const handleTrashClick = (id: number) => {
    const trashItem = trash.find((item) => item.id === id)
    if (trashItem) {
      setPosition({ x: trashItem.x - 10, y: trashItem.y - 40 })
      setFlying(true)
      setTalking(false)
      setTimeout(() => {
        setPickingUpTrash(true)
        setTimeout(() => {
          setTrash((prevTrash) => prevTrash.filter((item) => item.id !== id))
          setPickingUpTrash(false)
          flyToBottom(trashItem.x - 10)
        }, 500)
      }, 1500)
    }
  }

  const spawnTrash = () => {
    if (trash.length < 3) {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const trashImages = [beans, water]
      const trashPiece = {
        id: Date.now(),
        x: Math.random() * windowWidth,
        y: Math.random() * windowHeight,
        src: trashImages[Math.floor(Math.random() * trashImages.length)],
      }
      setTrash((prevTrash) => {
        if (prevTrash.length < 3) {
          return [...prevTrash, trashPiece]
        }
        return prevTrash
      })
    }
  }

  useEffect(() => {
    if (garbage) {
      const intervalId = setInterval(spawnTrash, 10000)
      spawnTrash()
      return () => clearInterval(intervalId)
    }
  }, [garbage])

  return (
    <div>
      <Draggable onStart={handleStart} onStop={handleStop} position={position} disabled={flying}>
        <div
          ref={dodoRef}
          className={classNames('dodo-bird', {
            'dodo-bird--talking': talking,
            'dodo-bird--flying': flying,
            'dodo-bird--dragging': isDragging,
            'dodo-bird--picking-up': pickingUpTrash,
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
      {trash.map((item) => (
        <div
          key={item.id}
          className="trash-piece"
          style={{ position: 'absolute', left: item.x, top: item.y }}
          onClick={() => handleTrashClick(item.id)}
        >
          <img src={item.src} alt="Trash" />
        </div>
      ))}
    </div>
  )
}

export default memo(DodoBird)
