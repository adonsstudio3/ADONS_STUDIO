
import Layout from '../components/Layout';
import Header from '../components/Header';
import Contact from '../components/Contact';
import TypingText from '../components/TypingText';
import OptimizedImage from '../components/OptimizedImage';
import SEOHead from '../components/SEOHead';
import styles from '../styles/contact.module.css';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ContactPage(){
  const titleRef = useScrollReveal({ duration: 0.8, delay: 0.2 })
  const subtitleRef = useScrollReveal({ duration: 0.8, delay: 0.4 })

  return (
    <Layout>
      <SEOHead page={{ type: 'contact' }} />

      <Header />
      <main>
        {/* Full-page hero section - separated from content */}
        <section id="hero" className="relative h-screen w-full flex items-center justify-center" style={{ minHeight: '700px', background: 'linear-gradient(120deg, #1A141A 60%, #FFD700 100%)' }}>
          <OptimizedImage
            name="hero/contact"
            alt="Contact Hero"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              opacity: 0.55,
            }}
            width={1920}
          />
          <div style={{ position: 'relative', zIndex: 2, width: '100%', textAlign: 'center' }}>
            <h1 ref={titleRef} className="heroTitle">Let's Connect</h1>
            <p ref={subtitleRef} className="heroSubtitle">
              <TypingText text="Let's create something extraordinary together" className="text-yellow-400" showCaret={false} />
            </p>
          </div>
        </section>

        {/* Content section - separated from hero */}
        <section id="contact-content" className="relative z-0 w-full">
          <Contact />
        </section>
      </main>
      
    </Layout>
  )
}
