import { useEffect, useState } from 'react'

function useTypingEffect(text: string, speed: number, restart: boolean) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const words = text.split(' ')
    let index = 0

    setDisplayedText('') // Reset the displayed text
    setIsComplete(false) // Reset the completion flag

    const interval = setInterval(() => {
      setDisplayedText((prev) => (prev ? `${prev} ${words[index]}` : words[index]))
      index++

      if (index >= words.length) {
        clearInterval(interval)
        setIsComplete(true) // Set the completion flag
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, restart]) // Add restart to the dependency array

  return { displayedText, isComplete }
}

export default useTypingEffect
