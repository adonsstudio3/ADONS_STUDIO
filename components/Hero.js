import { useEffect, useRef, useState } from 'react'

export default function Hero(){
  const videoRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const autoplayTimer = useRef(null)
  const hoverRef = useRef(false)
  const recoveryAttemptsRef = useRef(0)
  const [showArrows, setShowArrows] = useState(false)
  const hideArrowsTimer = useRef(null)
  // Typewriter animation state for the current slide title
  const [typedTitle, setTypedTitle] = useState('')
  const [descVisible, setDescVisible] = useState(false)
  const typingTimerRef = useRef(null)
  const descTimerRef = useRef(null)

  // swipe support refs
  const pointerDownRef = useRef(false)
  const pointerStartX = useRef(0)
  const pointerStartY = useRef(0)
  const pointerMovedRef = useRef(false)

  const clearHideTimer = () => { if (hideArrowsTimer.current) { clearTimeout(hideArrowsTimer.current); hideArrowsTimer.current = null } }
  const scheduleHideArrows = (delay = 900) => { clearHideTimer(); hideArrowsTimer.current = setTimeout(()=> setShowArrows(false), delay) }
  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const edgeThreshold = Math.min(120, rect.width * 0.15)
    if (x <= edgeThreshold || (rect.width - x) <= edgeThreshold) {
      setShowArrows(true)
      clearHideTimer()
    } else {
      scheduleHideArrows(900)
    }
  }
  const handlePointerLeave = ()=> scheduleHideArrows(600)
  useEffect(()=> () => clearHideTimer(), [])

  // Pointer-based swipe handlers (works for touch and mouse with pointer events)
  const onPointerDown = (e) => {
    // only primary pointers
    if (e && e.isPrimary === false) return
    pointerDownRef.current = true
    pointerStartX.current = e.clientX
    pointerStartY.current = e.clientY
    pointerMovedRef.current = false
    // show arrows when user touches/drags
    setShowArrows(true)
    clearHideTimer()
  }

  const onPointerMoveSwipe = (e) => {
    if (!pointerDownRef.current) return
    const dx = e.clientX - pointerStartX.current
    const dy = e.clientY - pointerStartY.current
    if (Math.abs(dx) > 8) pointerMovedRef.current = true
    // if user moves far horizontally we can reveal arrows
    const edgeThreshold = Math.min(120, window.innerWidth * 0.15)
    if (Math.abs(dx) > 10 && (Math.abs(dx) > Math.abs(dy))) setShowArrows(true)
    // don't prevent default so page can still scroll vertically when appropriate
  }

  const onPointerUp = (e) => {
    if (!pointerDownRef.current) return
    pointerDownRef.current = false
    const dx = e.clientX - pointerStartX.current
    const dy = e.clientY - pointerStartY.current
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const swipeThreshold = 60 // px
    // horizontal swipe and more horizontal than vertical
    if (absDx > swipeThreshold && absDx > absDy * 1.5) {
      if (dx < 0) {
        // swipe left -> next
        setCurrent(i => (i + 1) % playlist.length)
      } else {
        // swipe right -> prev
        setCurrent(i => (i - 1 + playlist.length) % playlist.length)
      }
    }
    // schedule hide arrows after interaction
    scheduleHideArrows(800)
  }

  const onPointerCancel = (e) => {
    pointerDownRef.current = false
    scheduleHideArrows(600)
  }

  // Playlist with per-slide interval (ms)
  const playlist = [
    { id: 'clip-1', title: 'Firefly Temple', src: '/videos/firefly-temple.mp4', interval: 10000 },
    { id: 'clip-2', title: 'Firefly SUV', src: '/videos/firefly-suv.mp4', interval: 2000 },
  { id: 'clip-3', title: 'Firefly Girl', src: '/videos/firefly-girl.mp4', interval: 5000 },
  { id: 'clip-3b', title: 'Firefly Girl II', src: '/videos/firefly-girl-ii.mp4', interval: 5000 },
  { id: 'clip-4', title: 'Firefly Hologram', src: '/videos/firefly-holo.mp4', interval: 5000 },
  { id: 'clip-5', title: 'Firefly Music', src: '/videos/firefly-music.mp4', interval: 5000 },
  { id: 'clip-6', title: 'Firefly Dog Noises', src: '/videos/Firefly-dog_noises.mp4', interval: 5000 },
  { id: 'clip-7', title: 'Firefly Whale Sound', src: '/videos/Firefly-whale_sound.mp4', interval: 6000 },
  { id: 'clip-8', title: 'Firefly Turtle', src: '/videos/firefly-turtle.mp4', interval: 5000 },
  { id: 'clip-9', title: 'Firefly Moonflower', src: '/videos/firefly-moonflower .mp4', interval: 5000 }
  ]

  // load current video src without touching muted to avoid reloads on mute toggle
  useEffect(()=>{
    const v = videoRef.current
    if (!v) return
  recoveryAttemptsRef.current = 0
  const originalSrc = playlist[current].src
  // encode URI to handle filenames with spaces or special characters
  v.src = encodeURI(originalSrc)
  // let the browser manage buffering; try to play immediately
  if (playing) v.play().then(()=> setPlaying(true)).catch(()=> setPlaying(false))

    // attach temporary handlers to recover from stalls on this clip
    let stalled = false
    const attemptRecover = (forceReload = false) => {
      if (!v) return
      // avoid infinite retries
      if (recoveryAttemptsRef.current > 2 && !forceReload) return
      recoveryAttemptsRef.current += 1
      // try to resume playback first
      v.play().catch(()=>{
        // last resort: reload and try play once
        if (forceReload || recoveryAttemptsRef.current > 1) {
          try { v.load(); v.play().catch(()=>{}) } catch(e) { console.warn('recover load failed', e) }
        }
      })
    }

    const onWaiting = () => { stalled = true; console.warn('video waiting, attempting recover'); attemptRecover(false) }
    const onStalled = () => { stalled = true; console.warn('video stalled, attempting recover (force)'); attemptRecover(true) }
    const onError = (e) => { console.error('video error', e); attemptRecover(true) }
    const onEnded = () => { 
      // move to next clip immediately when current finishes
      setCurrent(i => (i + 1) % playlist.length)
      // ensure we try to play the next one
      setTimeout(()=>{
        try { v.play().catch(()=>{}) } catch(e){}
      }, 50)
    }

  v.addEventListener('waiting', onWaiting)
  v.addEventListener('stalled', onStalled)
  v.addEventListener('error', onError)
  v.addEventListener('ended', onEnded)

    return () => {
  v.removeEventListener('waiting', onWaiting)
  v.removeEventListener('stalled', onStalled)
  v.removeEventListener('error', onError)
  v.removeEventListener('ended', onEnded)
    }
  }, [current])

  // initial play attempt (muted to satisfy autoplay policies)
  useEffect(()=>{
    const v = videoRef.current
    if (!v) return
    v.muted = muted
    v.play().then(()=> setPlaying(true)).catch(()=> setPlaying(false))
  }, [])

  // only update muted property when toggled
  useEffect(()=>{
    const v = videoRef.current
    if (!v) return
    v.muted = muted
  }, [muted])

  // ensure we only mark playing after enough buffer
  useEffect(()=>{
    const v = videoRef.current
    if (!v) return
    const onCanPlayThrough = () => {
      recoveryAttemptsRef.current = 0
      if (!v.paused) setPlaying(true)
    }
    v.addEventListener('canplaythrough', onCanPlayThrough)
    return () => v.removeEventListener('canplaythrough', onCanPlayThrough)
  }, [])

  // autoplay handler based on per-slide interval
  useEffect(()=>{
    const startTimer = ()=>{
      clearTimeout(autoplayTimer.current)
      if (!playing) return
      const interval = playlist[current]?.interval ?? 5000
      autoplayTimer.current = setTimeout(()=>{
        if (!hoverRef.current) setCurrent(i => (i + 1) % playlist.length)
      }, interval)
    }
    startTimer()
    return ()=> clearTimeout(autoplayTimer.current)
  }, [current, playing])

  // Typewriter effect for the slide title and fade-in for description
  useEffect(()=>{
    // reset
    setTypedTitle('')
    setDescVisible(false)
    if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null }
    if (descTimerRef.current) { clearTimeout(descTimerRef.current); descTimerRef.current = null }

    const full = (playlist[current]?.title) || ''
    let i = 0
    const speed = 40 // ms per char
    const startDelay = 80

    const typeNext = () => {
      if (i <= full.length) {
        setTypedTitle(full.slice(0, i))
        i += 1
        typingTimerRef.current = setTimeout(typeNext, speed)
      } else {
        // show description shortly after typing completes
        descTimerRef.current = setTimeout(()=> setDescVisible(true), 180)
      }
    }

    typingTimerRef.current = setTimeout(typeNext, startDelay)

    return ()=>{
      if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null }
      if (descTimerRef.current) { clearTimeout(descTimerRef.current); descTimerRef.current = null }
    }
  }, [current])

  const prev = ()=> setCurrent(i => (i - 1 + playlist.length) % playlist.length)
  const next = ()=> setCurrent(i => (i + 1) % playlist.length)
  const goTo = (i)=> { setCurrent(i); setPlaying(true) }
  const toggleMute = ()=> setMuted(m => !m)
  const togglePlaying = async ()=>{
    const v = videoRef.current
    if (!v) return
    if (v.paused) { try { await v.play(); setPlaying(true) } catch { setPlaying(false) } }
    else { v.pause(); setPlaying(false) }
  }

  return (
    <section id="hero" className="relative h-screen overflow-hidden" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}
      onPointerDown={onPointerDown} onPointerMove={onPointerMoveSwipe} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}>
      <video ref={videoRef} className="hero-full-video" playsInline muted={muted} />

  <div className="carousel carousel-dark slide absolute inset-0 flex items-end">

        <div className="w-full pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                {/* Prev/Next moved to left/right middle overlays */}
              </div>
            </div>

            <div className="carousel-caption mt-4 text-center text-gray-200">
              <h5 className="text-lg font-semibold typewriter">{typedTitle}</h5>
              <p className={`text-sm hero-desc-fade ${descVisible ? 'show' : ''}`}>Project showcase clip</p>
            </div>

            {/* moved indicators below caption/content - restored circular dots */}
            <div className="carousel-indicators mt-6 flex items-center justify-center gap-3">
              {playlist.map((p,i)=> (
                <button
                  key={p.src}
                  className={`video-dot ${i === current ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to clip ${i + 1}`}
                  aria-current={i === current ? 'true' : undefined}
                >
                  <span className="sr-only">{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-4">
          <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className={`mute-toggle ${muted? '' : 'unmuted'}`}>
            {muted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-volume-mute" viewBox="0 0 16 16" aria-hidden>
                <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-volume-down" viewBox="0 0 16 16" aria-hidden>
                <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11M12.025 8a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>
              </svg>
            )}
          </button>
        </div>

  {/* Left / Right overlay controls - centered vertically */}
  <button onClick={prev} className={`absolute left-4 top-1/2 transform -translate-y-1/2 btn btn--ghost carousel-control-prev z-20 ${showArrows ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-label="Previous">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chevron-double-left" viewBox="0 0 16 16" aria-hidden>
            <path fillRule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
            <path fillRule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
          </svg>
        </button>
  <button onClick={next} className={`absolute right-4 top-1/2 transform -translate-y-1/2 btn btn--ghost carousel-control-next z-20 ${showArrows ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-label="Next">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chevron-double-right" viewBox="0 0 16 16" aria-hidden>
            <path fillRule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
            <path fillRule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </button>

      </div>
    </section>
  )
}
