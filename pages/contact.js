
import Head from 'next/head';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Contact from '../components/Contact';
import TypingText from '../components/TypingText';
import styles from '../styles/contact.module.css';

export default function ContactPage(){
  return (
    <Layout>
      <Head>
        <title>Contact — Adons Studio</title>
        <meta name="description" content="Contact Adons Studio for projects and inquiries." />
      </Head>

      <Header />
      <main>
        {/* Full-page hero section */}
        <section className={styles.heroSection}>
          <img
            src="/Images/hero/Contact_Hero_Demo.jpg"
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
            onError={(e) => {
              // Guard against repeated errors
              if (!e.currentTarget.dataset.fallbackAttempted) {
                e.currentTarget.dataset.fallbackAttempted = 'true';
                e.currentTarget.src = '/Images/hero/Contact_Hero_Fallback.jpg';
              } else {
                // If fallback also fails, hide the image
                e.currentTarget.style.display = 'none';
              }
            }}
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
