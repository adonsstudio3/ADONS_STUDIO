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

  // Hero sections state - start empty, load from database
  const [heroSections, setHeroSections] = useState([])
  const [loading, setLoading] = useState(true)

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
        setCurrent(i => (i + 1) % (playlist.length || 1))
      } else {
        // swipe right -> prev
        setCurrent(i => (i - 1 + (playlist.length || 1)) % (playlist.length || 1))
      }
    }
    // schedule hide arrows after interaction
    scheduleHideArrows(800)
  }

  const onPointerCancel = (e) => {
    pointerDownRef.current = false
    scheduleHideArrows(600)
  }

  // Fetch hero sections from API
  const fetchHeroSections = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching hero sections...')
      
      const response = await fetch(`/api/hero-sections`, {
        // Allow browser to cache for 30 seconds
        cache: 'default',
        headers: {
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      console.log('📥 Hero sections response:', data)
      
      if (data.cached) {
        console.log('✅ Loaded from cache');
      }
        
        // Convert database hero sections to playlist format
        const dbHeroSections = data.hero_sections && data.hero_sections.length > 0 
          ? data.hero_sections
              .filter(section => section.is_active)
              .map(section => ({
                id: section.id,
                title: section.title,
                src: section.background_value,
                interval: 0, // Use video's natural duration
                type: section.background_type || 'image'
              }))
          : [];
        
        console.log('🎬 Final playlist:', dbHeroSections)
        setHeroSections(dbHeroSections)
      } catch (error) {
        console.error('Failed to fetch hero sections:', error)
        // Show empty state on error
        setHeroSections([])
      } finally {
        setLoading(false)
      }
    }
  
  useEffect(() => {
    fetchHeroSections()
    
    // Listen for admin data refresh events
    const handleAdminRefresh = () => {
      console.log('🔄 Hero component refreshing due to admin changes...');
      fetchHeroSections();
    };
    
    window.addEventListener('admin-data-refresh', handleAdminRefresh);
    
    return () => {
      window.removeEventListener('admin-data-refresh', handleAdminRefresh);
    };
  }, [])

  // Use heroSections as playlist
  const playlist = heroSections

  // load current video src without touching muted to avoid reloads on mute toggle
  useEffect(()=>{
    const v = videoRef.current
    const currentItem = playlist[current]
    if (!v || !playlist.length || !currentItem) return
    
    // Only load video source for video content
    const isVideo = currentItem.type === 'video' || (currentItem.src && (currentItem.src.includes('.mp4') || currentItem.src.includes('.webm') || currentItem.src.includes('.ogg')));
    if (!isVideo) return
    
    recoveryAttemptsRef.current = 0
    const originalSrc = currentItem.src
    
    // Set video source - handle both Supabase URLs and local paths
    console.log('🎥 Loading video:', originalSrc)
    
    // Don't encode if it's already a full URL (Supabase)
    if (originalSrc.startsWith('http')) {
      v.src = originalSrc
    } else {
      // encode URI to handle filenames with spaces or special characters for local paths
      v.src = encodeURI(originalSrc)
    }
    
    // Set loop attribute directly on video element for single video
    v.loop = playlist.length === 1
    
    console.log('🔁 Loop enabled:', v.loop, 'Playlist length:', playlist.length)
    
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
      // If only one video, it should loop naturally via the loop attribute
      // But if loop fails, manually restart
      if (playlist.length === 1) {
        console.log('🔁 Single video ended, restarting...')
        setTimeout(()=>{
          try {
            const video = videoRef.current
            if (video) {
              video.currentTime = 0
              video.play().then(()=> setPlaying(true)).catch(()=> setPlaying(false))
            }
          } catch(e){ console.error('Manual loop failed', e) }
        }, 50)
      } else {
        // Advance to next clip for multi-video playlist
        setCurrent(i => (i + 1) % (playlist.length || 1))
        setTimeout(()=>{
          try {
            const video = videoRef.current
            if (video) {
              video.play().then(()=> setPlaying(true)).catch(()=> setPlaying(false))
            }
          } catch(e){}
        }, 50)
      }
    }

    if (v) {
      v.addEventListener('waiting', onWaiting)
      v.addEventListener('stalled', onStalled)
      v.addEventListener('error', onError)
      v.addEventListener('ended', onEnded)
    }

    return () => {
      if (v) {
        v.removeEventListener('waiting', onWaiting)
        v.removeEventListener('stalled', onStalled)
        v.removeEventListener('error', onError)
        v.removeEventListener('ended', onEnded)
      }
    }
  }, [current, playlist.length])

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
      const interval = playlist[current]?.interval
      // if interval is 0 or not provided, don't schedule auto-advance; rely on ended event
      if (!interval || interval === 0) return
      autoplayTimer.current = setTimeout(()=>{
        if (!hoverRef.current) setCurrent(i => (i + 1) % (playlist.length || 1))
      }, interval)
    }
    startTimer()
    return ()=> clearTimeout(autoplayTimer.current)
  }, [current, playing])

  // Typewriter effect for the slide title and fade-in for description
  useEffect(()=>{
    // Don't start typing animation until playlist is loaded
    if (!playlist.length || loading) return;
    
    // reset
    setTypedTitle('')
    setDescVisible(false)
    if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null }
    if (descTimerRef.current) { clearTimeout(descTimerRef.current); descTimerRef.current = null }

    const full = (playlist[current]?.title) || ''
    console.log('🎭 Starting typing animation for:', full);
    let i = 0
    const speed = 50 // ms per char (typing speed)
    const startDelay = 2000 // 1 second delay before typing starts

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
  }, [current, loading, playlist.length])

  const prev = ()=> setCurrent(i => (i - 1 + (playlist.length || 1)) % (playlist.length || 1))
  const next = ()=> setCurrent(i => (i + 1) % (playlist.length || 1))
  const goTo = (i)=> { setCurrent(i); setPlaying(true) }
  const toggleMute = ()=> setMuted(m => !m)
  const togglePlaying = async ()=>{
    const v = videoRef.current
    if (!v) return
    if (v.paused) { try { await v.play(); setPlaying(true) } catch { setPlaying(false) } }
    else { v.pause(); setPlaying(false) }
  }

  if (loading && !heroSections.length) {
    return (
      <section id="hero" className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        {/* Loading spinner - clean and simple like project cards */}
        <div className="relative z-10 text-center px-4">
          <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm mt-4">Loading...</p>
        </div>
      </section>
    )
  }

  if (!playlist.length) {
    return (
      <section id="hero" className="relative h-screen overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">No hero content available</p>
        </div>
      </section>
    )
  }

  const currentItem = playlist[current];
  const isVideo = currentItem?.type === 'video' || (currentItem?.src && (currentItem.src.includes('.mp4') || currentItem.src.includes('.webm') || currentItem.src.includes('.ogg')));

  return (
    <section id="hero" className="relative h-screen overflow-hidden" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}
      onPointerDown={onPointerDown} onPointerMove={onPointerMoveSwipe} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}>
    
    {/* Video for video content */}
    {isVideo && (
      <video
        ref={videoRef}
        className="hero-full-video absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        playsInline
        autoPlay
        loop={playlist.length === 1}
        preload="metadata"
        muted={muted}
      />
    )}
    
    {/* Image for image content */}
    {!isVideo && currentItem?.src && (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${currentItem.src})` }}
      />
    )}
    
    {/* Overlay for better text visibility */}
    <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none" />

  <div className="carousel carousel-dark slide absolute inset-0 flex items-end">

        <div className="w-full pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                {/* Prev/Next moved to left/right middle overlays */}
              </div>
            </div>

            <div className="carousel-caption mt-4 text-center text-gray-200">
              <h5 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold typewriter px-4 leading-tight">{typedTitle}</h5>
            </div>

            {/* moved indicators below caption/content - restored circular dots */}
            {/* <div className="carousel-indicators mt-6 flex items-center justify-center gap-3">
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
            </div> */}
          </div>
        </div>

        {/* Only show mute button for videos */}
        {isVideo && (
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
        )}

  {/* Left / Right overlay controls - centered vertically - COMMENTED OUT */}
  {/* <button onClick={prev} className={`absolute left-4 top-1/2 transform -translate-y-1/2 btn btn--ghost carousel-control-prev z-20 ${showArrows ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-label="Previous">
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
        </button> */}

      </div>
    </section>
  )
}
