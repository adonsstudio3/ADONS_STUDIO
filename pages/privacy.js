import Head from 'next/head'
import Link from 'next/link'
import PrivacyContent from '../components/PrivacyContent'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy & Analytics — Adons Studio</title>
        <meta name="description" content="Privacy information for Adons Studio: what data we collect and how we use analytics." />
      </Head>
      <main style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1rem', color: '#eee' }}>
        <h1 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Privacy & Analytics</h1>
        <PrivacyContent />
        <p style={{ marginTop: '2rem' }}>
          <Link href="/">← Back to home</Link>
        </p>
      </main>
    </>
  )
}
