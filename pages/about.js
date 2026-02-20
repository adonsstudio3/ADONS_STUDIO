import Layout from '../components/Layout'
import Header from '../components/Header'
import SEOHead from '../components/SEOHead'
import { useState, useEffect, useRef } from 'react'
import OptimizedImage from '../components/OptimizedImage'
import TypingText from '../components/TypingText'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Team from '../components/Team'

export default function AboutPage() {
  const [contentVisible, setContentVisible] = useState(false)
  const contentRef = useRef(null)
  const heroRef = useRef(null)

  const titleRef = useScrollReveal({ duration: 0.8, delay: 0.2 })
  const subtitleRef = useScrollReveal({ duration: 0.8, delay: 0.4 })
  const section1Ref = useScrollReveal({ duration: 0.8, delay: 0 })
  const section2Ref = useScrollReveal({ duration: 0.8, delay: 0.2 })
  const section3Ref = useScrollReveal({ duration: 0.8, delay: 0 })
  const promiseRef = useScrollReveal({ duration: 0.8, delay: 0.2 })

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

  // Parallax effect on hero image
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    if (typeof window === 'undefined') return
    if (window.innerWidth < 768) return

    let ticking = false
    const speed = 0.12

    const update = () => {
      const rect = el.getBoundingClientRect()
      const scroll = -rect.top * speed
      el.style.transform = `translateY(${scroll}px)`
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Header />
      <Layout>
        <SEOHead
          title="About ADONS | Creative Studio"
          description="Learn about ADONS - a creative studio specializing in production, visuals, and audio. Discover our story, mission, and the team behind our work."
          canonicalUrl="https://www.adons.studio/about"
          ogImage="/og-image.jpg"
        />

        {/* Hero Section - separated from content */}
        <section id="hero" className="relative h-screen w-full">
          <OptimizedImage
            name="hero/services"
            alt="ADONS About Hero"
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.5, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            width={1920}
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="heroTitle">Our Story</h1>
            <div className="heroSubtitle">
              <TypingText
                text="Crafting excellence through creativity, innovation, and collaboration"
                className="text-yellow-400"
                showCaret={false}
              />
            </div>
          </div>
        </section>

        {/* Main Content - separated from hero */}
        <main ref={contentRef} className="relative z-0">
          {/* About Section */}
          <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
            <style jsx>{`
            @media (max-width: 768px) {
              .about-image-left picture,
              .about-image-right picture {
                float: none !important;
                margin: 0 auto 2rem !important;
                width: 100% !important;
                max-width: 100% !important;
                text-align: center;
                display: block !important;
              }

              .about-image-left picture img,
              .about-image-right picture img {
                width: 100% !important;
                height: auto !important;
                max-width: none !important;
              }

              .about-text-content {
                clear: both;
              }

              .about-paragraph-with-image {
                clear: both;
              }
            }
          `}</style>
            <div className="space-y-10 text-lg leading-relaxed" style={{ color: '#FFFFFF' }}>
              <p ref={section1Ref}><span style={{ color: '#FFFFFF', fontSize: '2.5em', lineHeight: '0.7', verticalAlign: 'bottom', display: 'inline-block', fontWeight: 'bold', fontFamily: 'inherit', marginRight: '2px' }}>O</span>ur story began in the most unexpected way, sometimes the best ideas come when you least expect them. Through a simple conversation between five friends from different cities, each with unique skills and expertise, what started as an informal discussion quickly transformed into a shared vision: to build something meaningful, innovative, and lasting. From that moment, ADONS was born - a creative studio built on passion, collaboration, and the relentless pursuit of excellence.</p>

              <p ref={section1Ref}>Each member of our founding team brings a distinctive set of skills, experiences, and ideas, creating a diverse foundation that fuels our creativity and sets us apart. We believe that our differences are not only our greatest asset but also the key to delivering exceptional work that pushes boundaries and inspires others.</p>

              <p ref={section2Ref} className="about-paragraph-with-image" style={{ marginTop: '2.5em' }}>
                <picture className="about-image-left" style={{ float: 'left', marginRight: '44px', marginTop: '0', marginBottom: '12px', zIndex: 1, position: 'relative' }}>
                  <OptimizedImage
                    name="about/studio_1"
                    alt="ADONS Studio - Team Collaboration"
                    style={{
                      width: '420px',
                      maxWidth: '80vw',
                      height: 'auto',
                      borderRadius: '32px 80px 24px 60px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
                      transform: 'rotate(-4deg) scale(1.08)',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="lazy"
                    width={420}
                  />
                </picture>
                <span style={{ display: 'block', marginBottom: '10px' }}>
                  At ADONS, we see every challenge as an opportunity to learn, grow, and innovate.
                </span>
                <span style={{ display: 'block', marginTop: '10px' }}>
                  We have faced obstacles along the way, but each hurdle has strengthened our commitment and sharpened our skills. We understand that creativity thrives on collaboration, and our team operates not just as colleagues but as a family of creators who support one another and are united by a common goal: to turn visions into reality. We pride ourselves on fostering an environment where ideas flow freely, creativity is nurtured, and fun is part of the process.
                </span>
              </p>

              <p ref={section3Ref}>As a full-service production house, ADONS specializes in every aspect of filmmaking, from pre-production and planning to on-set production and post-production. Whether it's developing compelling concepts, executing seamless shoots, or delivering stunning visual effects and finishing touches, our team is dedicated to bringing each project to life with precision and passion. Alongside this, ADONS brings stories to life with immersive sound design, original music compositions, voice-over recording, and precise mixing &amp; mastering. We work closely with our clients, understanding their vision and translating it into high-end, impactful film and video content that resonates and inspires. Innovation is at the heart of everything we do, and we are constantly exploring new techniques, technologies, and creative approaches to elevate each project.</p>

              <p ref={section3Ref} className="about-paragraph-with-image" style={{ marginTop: '2.5em' }}>
                <picture className="about-image-right" style={{ float: 'right', marginLeft: '44px', marginTop: '0', marginBottom: '12px', zIndex: 1, position: 'relative' }}>
                  <OptimizedImage
                    name="about/studio_2"
                    alt="ADONS Studio - Creative Hub"
                    style={{
                      width: '420px',
                      maxWidth: '80vw',
                      height: 'auto',
                      borderRadius: '60px 24px 80px 32px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
                      transform: 'rotate(3deg) scale(1.08)',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="lazy"
                    width={420}
                  />
                </picture>
                <span style={{ display: 'block', marginBottom: '10px' }}>
                  Today, ADONS stands as more than just a studio — we are a hub for creativity, a place where ideas are transformed into extraordinary realities.
                </span>
                <span style={{ display: 'block', marginTop: '10px' }}>
                  Our journey is only just beginning, and we are excited about the endless possibilities that lie ahead. Together, with our clients and collaborators, we look forward to creating stories that move, inspire, and leave a lasting impact. At ADONS, we don't just make content; we craft experiences.
                </span>
              </p>

            </div>
          </section>

          {/* Team Section */}
          <Team />
        </main>
      </Layout>
    </>
  )
}
