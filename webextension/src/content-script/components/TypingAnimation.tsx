import { useEffect, useState } from 'react'

function useTypingEffect(text: string, speed: number, restart: boolean) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  if (!restart) {
    setDisplayedText('') // Reset the displayed text
    setIsComplete(false) // Ensure completion flag is reset
  }

  useEffect(() => {
    const words = text.split(' ')
    let index = 0

    setDisplayedText('') // Reset the displayed text
    setIsComplete(false) // Ensure completion flag is reset

    const interval = setInterval(() => {
      setDisplayedText((prev) => (prev ? `${prev} ${words[index]}` : words[index]))
      index++

      if (index >= words.length && index != 0) {
        clearInterval(interval)
        setIsComplete(true) // Set the completion flag
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, restart]) // Add restart to the dependency array

  if (!restart) {
    setDisplayedText('') // Reset the displayed text
    setIsComplete(false) // Ensure completion flag is reset
  }

  return { displayedText, isComplete }
}

export default useTypingEffect
