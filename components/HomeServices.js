import { useState, useEffect, useRef } from 'react'
import ProductionTab from './Services/ProductionTab'
import VisualsTab from './Services/VisualsTab'
import AudioTab from './Services/AudioTab'
import AdditionalTab from './Services/AdditionalTab'
import ScrollVelocity from './ScrollVelocity'
import { useScrollReveal } from '../hooks/useScrollReveal'

const services = [
  { name: 'Visuals', Component: VisualsTab },
  { name: 'Production', Component: ProductionTab },
  { name: 'Audio', Component: AudioTab },
  { name: 'Additional', Component: AdditionalTab }
]

export default function HomeServices(){
  const contentRef = useRef(null)
  const titleRef = useScrollReveal({ duration: 0.8, delay: 0 })
  const subtitleRef = useScrollReveal({ duration: 0.8, delay: 0.2 })

  return (
    <section id="services" ref={contentRef} className="w-full py-20">
      {/* Top Moving Text */}
      <ScrollVelocity
        texts={['SERVICES']}
        velocity={60}
        className="text-white/80 drop-shadow-lg"
        parallaxClassName="relative py-6 px-4 md:px-6 lg:px-8 border-t border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Display each service as a separate section */}
        <div className="space-y-8">
          {services.map((service, idx) => {
            const serviceRef = useScrollReveal({ duration: 0.8, delay: 0.1 * (idx + 1) })
            return (
              <div ref={serviceRef} key={service.name} className="pt-16 first:pt-8">
                {/* <h3 className="text-3xl font-bold text-white mb-12 text-center">{service.name}</h3> */}
                <div className="text-gray-200">
                  <service.Component />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Moving Text */}
      <ScrollVelocity
        texts={['SERVICES']}
        velocity={-60}
        className="text-white/80 drop-shadow-lg"
        parallaxClassName="relative py-6 px-4 md:px-6 lg:px-8 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent mt-20"
      />
    </section>
  )
}
