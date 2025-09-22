import Head from 'next/head'
import Header from '../components/Header'
import Hero from '../components/Hero'
// Services and Team removed from homepage per request
import Contact from '../components/Contact'
import Layout from '../components/Layout'
import About from '../components/About'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Adons Studio - Crafting Visual Masterpieces | VFX & Animation</title>
        <meta name="description" content="Adons Studio is a cutting-edge VFX studio transforming creative visions into stunning visual experiences for films, commercials, and digital media." />
      </Head>

      <Header />
      <main>
        <Hero />
        <About />
        <Contact />
      </main>
      
    </Layout>
  )
}
