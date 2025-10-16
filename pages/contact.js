
import Layout from '../components/Layout';
import Header from '../components/Header';
import Contact from '../components/Contact';
import TypingText from '../components/TypingText';
import OptimizedImage from '../components/OptimizedImage';
import SEOHead from '../components/SEOHead';
import styles from '../styles/contact.module.css';

export default function ContactPage(){
  return (
    <Layout>
      <SEOHead page={{ type: 'contact' }} />

      <Header />
      <main>
        {/* Full-page hero section */}
        <section className={styles.heroSection}>
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
          <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <h1 className="heroTitle">Contact Us</h1>
            <p className="heroSubtitle">
              <TypingText text="Let's create something extraordinary together" className="text-yellow-400" showCaret={false} />
            </p>
          </div>
        </section>

        <Contact />
      </main>
      
    </Layout>
  )
}
