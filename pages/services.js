import Layout from '../components/Layout'
import Header from '../components/Header'
import SEOHead from '../components/SEOHead'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import TypingText from '../components/TypingText'
import OptimizedImage from '../components/OptimizedImage'
import ProductionTab from '../components/Services/ProductionTab'
import VisualsTab from '../components/Services/VisualsTab'
import AudioTab from '../components/Services/AudioTab'
import AdditionalTab from '../components/Services/AdditionalTab'

const tabs = ['Production', 'Visuals', 'Audio', 'Additional']

export default function ServicesPage(){
  const [active, setActive] = useState('Production')
  const [showSubtitle, setShowSubtitle] = useState(false)
  const contentRef = useRef(null)
  const [contentVisible, setContentVisible] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setContentVisible(true)
            obs.disconnect()
          }
        })
      },
      { root: null, rootMargin: '0px 0px -120px 0px', threshold: 0.05 }
    )
    obs.observe(contentRef.current)
    return () => obs.disconnect()
  }, [])

  // tiny parallax effect on the hero image (translateY), disabled on small screens
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    if (typeof window === 'undefined') return
    // disable on small viewports to avoid jank
    if (window.innerWidth < 768) return

    let ticking = false
    const speed = 0.12 // small multiplier, tweakable

    const update = () => {
      const rect = el.getBoundingClientRect()
      const img = el.querySelector('img')
      if (!img) return
      // move image opposite to scroll for a subtle parallax
      const move = -rect.top * speed
      img.style.transform = `translateY(${move}px)`
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        update()
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // initial position
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      const img = el.querySelector('img')
      if (img) img.style.transform = ''
    }
  }, [])

  return (
    <Layout>
      <SEOHead page={{ type: 'services' }} />

      <Header />
      <main>
        {/* Hero with user-provided image */}
        <section id="hero" className="relative h-screen w-full bg-black">
          <OptimizedImage
            name="hero/services"
            alt="ADONS Services Hero"
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.5, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            width={1920}
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="heroTitle">Our Services</h1>
            <div className="heroSubtitle">
              {/* typed line then reveal a short subtitle */}
              <TypingText
                text="Where Vision Meets Execution"
                className="text-yellow-400"
                onComplete={() => setShowSubtitle(true)}
                showCaret={false}
              />
            </div>
          </div>
        </section>

        {/* separator removed per request */}

        <section ref={contentRef} className={`pt-10 md:pt-16 pb-32 transform transition-all duration-700 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="max-w-6xl mx-auto px-6">
            {/* heading moved to hero; removed duplicate */}

            {/* Tabbed navbar */}
            <nav className="flex items-center justify-center mb-6">
              <div className="inline-flex bg-[rgba(255,255,255,0.03)] rounded-lg p-1">
                {tabs.map(t => (
                  <button
                    key={t}
                    onClick={() => setActive(t)}
                    className={`px-4 py-2 text-sm md:text-base font-medium rounded-md focus:outline-none ${active===t ? 'bg-yellow-400 text-black' : 'text-gray-300'}`}
                    aria-pressed={active===t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </nav>

            <div className="max-w-6xl mx-auto">
              {/* Services content converted to React components */}
              <div className="text-gray-200">
                {active === 'Production' && (
                  <ProductionTab />
                )}

                {active === 'Visuals' && (
                  <VisualsTab />
                )}

                {active === 'Audio' && (
                  <AudioTab />
                )}

                {active === 'Additional' && (
                  <AdditionalTab />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}


