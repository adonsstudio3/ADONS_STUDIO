import OptimizedImage from './OptimizedImage';
import Link from 'next/link';
import { useScrollReveal } from '../hooks/useScrollReveal';
import Lottie from 'lottie-react';
import animationData from '../public/lottie/about_section.json';
import Balatro from './Balatro';

export default function About(){
  const titleRef = useScrollReveal({ duration: 0.8, delay: 0 })
  const contentRef = useScrollReveal({ duration: 0.8, delay: 0.2 })
  const buttonRef = useScrollReveal({ duration: 0.8, delay: 0.4 })
  const animationRef = useScrollReveal({ duration: 0.8, delay: 0.3 })
  
  return (
    <section id="about" className="relative overflow-hidden mb-0 pb-0">
      {/* Balatro Background */}
      <div className="absolute inset-0 z-0">
        <Balatro
          isRotate={false}
          mouseInteraction={false}
          pixelFilter={2000}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex items-center gap-12 bg-black/40 p-8 rounded-lg backdrop-blur-sm my-20">
          {/* Text Content */}
          <div className="flex-1 space-y-6 text-lg leading-relaxed text-white">
            <p ref={contentRef}>ADONS is a creative studio dedicated to pushing the boundaries of visual storytelling. We bring together experts in production, visuals, and audio to deliver comprehensive creative solutions.</p>
            
            <p ref={contentRef}>From concept to execution, we craft experiences that resonate, inspire, and leave a lasting impact.</p>
            
            <Link href="/about">
              <button ref={buttonRef} className="mt-6 px-8 py-3 bg-brand text-black font-semibold rounded-lg" style={{backgroundColor: '#FFD700'}}>
                Learn Our Story
              </button>
            </Link>
          </div>
          
          {/* Lottie Animation */}
          <div ref={animationRef} className="flex-1 hidden md:flex justify-center items-center">
            <Lottie 
              animationData={animationData} 
              loop={true}
              style={{ height: '450px', width: '450px' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
