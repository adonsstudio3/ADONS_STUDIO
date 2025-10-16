import Layout from '../components/Layout'
import Header from '../components/Header'
import Team from '../components/Team'
import OptimizedImage from '../components/OptimizedImage'
import SEOHead from '../components/SEOHead'
import { useEffect, useState, useRef, useCallback } from 'react'

// keep constant outside component so it doesn't recreate on every render
const subtitleFull = "The creative minds behind Adons Studio";

export default function TeamPage(){
  // Typing animation for subtitle (stable, no timer leaks)
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const timerRef = useRef(null);
  const indexRef = useRef(0);

  const typeSubtitle = useCallback(() => {
    // clear any existing timer before scheduling next
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const run = () => {
      if (indexRef.current <= subtitleFull.length) {
        setTypedSubtitle(subtitleFull.slice(0, indexRef.current));
        indexRef.current += 1;
        timerRef.current = setTimeout(run, 40);
      }
    };

    // reset index and start
    indexRef.current = 0;
    setTypedSubtitle('');
    run();
  }, []);

  useEffect(() => {
    typeSubtitle();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      indexRef.current = 0;
    };
  }, [typeSubtitle]);

  return (
    <Layout>
      <SEOHead page={{ type: 'team' }} />

      <Header />
      {/* Full-page hero section */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: '700px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(120deg, #0a0a0a 60%, #FFD700 100%)',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: 0.55,
        }}>
          <OptimizedImage
            name="hero/team"
            alt="Team Hero"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            width={1920}
            priority
          />
        </div>
        <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <h1 className="heroTitle">Meet Our Team</h1>
          <p className="heroSubtitle">{typedSubtitle}</p>
        </div>
      </section>
      <main>
        <Team />
      </main>
    </Layout>
  )
}
