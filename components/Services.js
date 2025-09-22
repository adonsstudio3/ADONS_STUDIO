export default function Services(){
  const services = [
    {icon:'✨', title:'Visual Effects', desc:'Photorealistic VFX for films, TV shows, and commercials', items:['Compositing','Green Screen','Digital Environments','Particle Effects']},
    {icon:'🎭', title:'3D Animation', desc:'Character animation and 3D modeling for any medium', items:['Character Rigging','3D Modeling','Motion Graphics','Product Visualization']},
    {icon:'🎬', title:'Post Production', desc:'Complete post-production services from edit to delivery', items:['Color Grading','Sound Design','Digital Intermediate','Mastering']},
    {icon:'🎪', title:'Virtual Production', desc:'Cutting-edge LED wall and real-time VFX solutions', items:['LED Wall Setup','Real-time Rendering','On-set Supervision','Previs Services']}
  ]

  return (
  <section id="services" className="py-10">
      <div className="max-w-6xl mx-auto px-6">
  <div className="text-center">
          <h2 className="text-3xl font-semibold mb-2">Our Services</h2>
          <p className="text-lg text-primary font-semibold mb-1">Where Vision Meets Execution</p>
          {/* Removed duplicate hero text as requested */}
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {services.map(s=> (
            <div key={s.title} className="service-card p-6 bg-gray-900/90 rounded shadow">
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
