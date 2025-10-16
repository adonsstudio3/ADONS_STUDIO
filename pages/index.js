import Header from '../components/Header'
import Hero from '../components/Hero'
import Contact from '../components/Contact'
import Layout from '../components/Layout'
import About from '../components/About'
import SEOHead from '../components/SEOHead'

export default function Home() {
  return (
    <Layout>
      <SEOHead page={{ type: 'home' }} />

      <Header />
      <main>
        <Hero />
  <About />

  {/* Yellow separator between About and Contact */}
  <div aria-hidden="true" className="mx-auto my-12 w-24 h-1 rounded-sm bg-yellow-400" style={{ opacity: 0.95 }}></div>

  <Contact />
      </main>
      
    </Layout>
  )
}
