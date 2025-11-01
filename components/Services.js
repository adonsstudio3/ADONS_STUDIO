import { useRef, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Services(){
  const titleRef = useScrollReveal({ duration: 0.8, delay: 0 })
  const subtitleRef = useScrollReveal({ duration: 0.8, delay: 0.2 })
  const serviceCardRefs = useRef([]);

  const services = [
    {icon:'✨', title:'Visual Effects', desc:'Photorealistic VFX for films, TV shows, and commercials', items:['Compositing','Green Screen','Digital Environments','Particle Effects']},
    {icon:'🎭', title:'3D Animation', desc:'Character animation and 3D modeling for any medium', items:['Character Rigging','3D Modeling','Motion Graphics','Product Visualization']},
    {icon:'🎬', title:'Post Production', desc:'Complete post-production services from edit to delivery', items:['Color Grading','Sound Design','Digital Intermediate','Mastering']},
    {icon:'🎪', title:'Virtual Production', desc:'Cutting-edge LED wall and real-time VFX solutions', items:['LED Wall Setup','Real-time Rendering','On-set Supervision','Previs Services']}
  ]

  // Apply scroll reveal to all service cards dynamically
  useEffect(() => {
    if (!serviceCardRefs.current || serviceCardRefs.current.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          entry.target.style.animationDelay = `${delay}s`;
          entry.target.classList.add('scroll-reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    serviceCardRefs.current.forEach((card, idx) => {
      if (card) {
        const staggerDelay = (idx % 4) * 0.1; // Stagger every 4 cards
        card.dataset.revealDelay = staggerDelay;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.8s ease-out ${staggerDelay}s, transform 0.8s ease-out ${staggerDelay}s`;
        observer.observe(card);
      }
    });

    return () => {
      serviceCardRefs.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [services]);

  return (
  <section id="services" className="py-10">
      <div className="max-w-6xl mx-auto px-6">
  <div className="text-center">
          <h2 ref={titleRef} className="text-3xl font-semibold mb-2">Our Services</h2>
          <p ref={subtitleRef} className="text-lg text-primary font-semibold mb-1">Where Vision Meets Execution</p>
          {/* Removed duplicate hero text as requested */}
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {services.map((s, idx) => (
            <div 
              key={s.title} 
              ref={(el) => {
                if (el) serviceCardRefs.current[idx] = el;
              }}
              className="service-card p-6 bg-gray-900/90 rounded shadow">
              <div className="service-icon text-3xl">{s.icon}</div>
              <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{s.desc}</p>
              <ul className="mt-3 text-sm text-gray-300 list-disc list-inside">
                {s.items.map(i=> <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
