import { useEffect, useState } from 'react'

function useTypingEffect(text: string, speed: number, restart: boolean) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    const words = text.split(' ')
    let index = 0

    setDisplayedText('') // Reset the displayed text

    const interval = setInterval(() => {
      setDisplayedText((prev) => (prev ? `${prev} ${words[index]}` : words[index]))
      index++

      if (index >= words.length) {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, restart]) // Add restart to the dependency array

  return displayedText
}

export default useTypingEffect
