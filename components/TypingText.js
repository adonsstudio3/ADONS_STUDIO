import { useEffect, useState } from 'react'

export default function TypingText({ text = '', speed = 60, className = '', onComplete = null, showCaret = true }){
  const [display, setDisplay] = useState('')
  const [idx, setIdx] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(()=>{
    setDisplay('')
    setIdx(0)
    setCompleted(false)
    let mounted = true
    const tick = () => {
      setIdx(i => {
        const next = i + 1
        setDisplay(text.slice(0, next))
        return next
      })
    }
    if (!text) return
    const interval = setInterval(()=>{
      if (!mounted) return
      setIdx(i => {
        if (i >= text.length) {
          clearInterval(interval)
          setCompleted(true)
          return i
        }
        const next = i + 1
        setDisplay(text.slice(0, next))
        return next
      })
    }, speed)
    return ()=>{
      mounted = false
      clearInterval(interval)
    }
  }, [text, speed])

  // Handle completion callback in separate effect to avoid render phase updates
  useEffect(() => {
    if (completed && typeof onComplete === 'function') {
      onComplete()
    }
  }, [completed, onComplete])

  return (
    <span className={className} aria-label={text}>
      {display}
      {showCaret ? <span className="ml-1 inline-block w-1 h-5 align-middle bg-yellow-400 animate-pulse" aria-hidden /> : null}
    </span>
  )
}
