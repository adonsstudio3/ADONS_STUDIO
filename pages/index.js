import Header from '../components/Header'
import Hero from '../components/Hero'
import Layout from '../components/Layout'
import About from '../components/About'
import HomeServices from '../components/HomeServices'
import ShowreelPlayer from '../components/ShowreelPlayer'
import Balatro from '../components/Balatro';
import SEOHead from '../components/SEOHead'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Home() {
  const ctaTitleRef = useScrollReveal({ duration: 0.8, delay: 0 })
  const ctaSubtitleRef = useScrollReveal({ duration: 0.8, delay: 0.2 })
  const ctaButtonRef = useScrollReveal({ duration: 0.8, delay: 0.4 })

  return (
    <Layout>
      <SEOHead page={{ type: 'home' }} />

      <Header />
      <main>
        {/* Hero Section - separated from content */}
        <Hero />
        
        {/* Content Section - separated from hero */}
        <section className="relative z-0">
          <About />
        </section>

        {/* Showreel Player Section */}
        <ShowreelPlayer />
        
        {/* We Keep Our Word Section */}
        <section className="relative overflow-hidden mb-0 pb-0">
          {/* Balatro Background */}
          <div className="absolute inset-0 z-0">
            <Balatro
              isRotate={false}
              mouseInteraction={false}
              pixelFilter={2000}
            />
          </div>
          
          <div className="relative z-10">
            <div className="text-center space-y-12 my-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              We Keep Our Word
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full">
              {/* On Time */}
              <div className="p-8 rounded-none bg-black/40 backdrop-blur-sm border-b md:border-b-0 border-r border-white/10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                  WE ARE ON TIME
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We take pride in delivering high-quality work on time, ensuring reliability, efficiency, and professionalism in every project we complete.
                </p>
              </div>
              
              {/* Satisfactory */}
              <div className="p-8 rounded-none bg-black/40 backdrop-blur-sm border-b md:border-b-0 border-r border-white/10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                  WE ARE SATISFACTORY
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We ensure exceptional quality and satisfaction in every project, delivering reliable, professional results tailored to meet our clients' needs with precision, creativity, and dedication to excellence in every detail.
                </p>
              </div>
              
              {/* Secured */}
              <div className="p-8 rounded-none bg-black/40 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                  WE KEEP YOU SECURED
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We prioritize privacy in every project, ensuring complete confidentiality and security for all client data, ideas, and materials, maintaining trust and discretion throughout every stage of development and collaboration.
                </p>
              </div>
            </div>
            
            <div className="mt-12">
              <a
                href="/portfolio"
                className="inline-block px-8 py-3 bg-brand text-black font-semibold rounded-lg hover:bg-opacity-90 transition-all"
              >
                View Our Projects
              </a>
            </div>
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="relative z-0">
          <HomeServices />
        </section>
        
        {/* CTA Section */}
        <section className="pt-16 pb-32 px-4 md:px-8 max-w-4xl mx-auto text-center -mt-12">
          <h2 ref={ctaTitleRef} className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p ref={ctaSubtitleRef} className="text-gray-400 text-xl mb-8">
            Let's collaborate and bring your vision to life.
          </p>
          <a
            ref={ctaButtonRef}
            href="/contact"
            className="inline-block px-8 py-3 bg-brand text-black font-semibold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Get in Touch
          </a>
        </section>
      </main>
      
    </Layout>
  )
}
