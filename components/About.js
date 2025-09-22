export default function About(){
  return (
    <section id="about" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          {/* Centered banner image placed above the headings. File: public/Images/bw-banner.png */}
          <div className="mb-6">
            {/* Safe full-bleed to viewport edges without causing horizontal scroll */}
            {/* Uses calc negative margins so the element spans the viewport while respecting scrollbar width */}
            <div style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', width: '100vw', display: 'block' }}>
              {/* Responsive picture element: AVIF -> WebP -> PNG fallback. Optimized files in public/Images/optimized/bw-banner/ */}
              <picture>
                <source
                  type="image/avif"
                  srcSet={
                    '/Images/optimized/bw-banner/bw-banner-400.avif 400w, ' +
                    '/Images/optimized/bw-banner/bw-banner-800.avif 800w, ' +
                    '/Images/optimized/bw-banner/bw-banner-1200.avif 1200w, ' +
                    '/Images/optimized/bw-banner/bw-banner-1600.avif 1600w, ' +
                    '/Images/optimized/bw-banner/bw-banner-2400.avif 2400w, ' +
                    '/Images/optimized/bw-banner/bw-banner-3387.avif 3387w'
                  }
                  sizes="100vw"
                />
                <source
                  type="image/webp"
                  srcSet={
                    '/Images/optimized/bw-banner/bw-banner-400.webp 400w, ' +
                    '/Images/optimized/bw-banner/bw-banner-800.webp 800w, ' +
                    '/Images/optimized/bw-banner/bw-banner-1200.webp 1200w, ' +
                    '/Images/optimized/bw-banner/bw-banner-1600.webp 1600w, ' +
                    '/Images/optimized/bw-banner/bw-banner-2400.webp 2400w, ' +
                    '/Images/optimized/bw-banner/bw-banner-3387.webp 3387w'
                  }
                  sizes="100vw"
                />
                <img
                  src="/Images/bw-banner/bw-banner.png"
                  alt="ADONS banner full-bleed"
                  style={{ width: '100%', height: 'auto', display: 'block', maxWidth: 'none' }}
                  loading="eager"
                />
              </picture>
            </div>
          </div>
          <h2 className="font-semibold text-4xl md:text-5xl">About Our Studio</h2>
          <div className="w-20 h-1 bg-brand mx-auto mt-3"></div>
          <p className="mt-10 text-white italic text-xl md:text-2xl">
            <span className="text-brand" lang="sa">Pan̄casya śaktiḥ, ekasya kalā</span>
            <br />
            <span className="text-brand">(The power of five, the art of on̄e)</span>
          </p>
        </div>
  <div className="max-w-3xl mx-auto space-y-10 text-lg leading-relaxed text-white">

          <p><span style={{ color: '#FFD700', fontSize: '2.5em', lineHeight: '0.7', verticalAlign: 'bottom', display: 'inline-block', fontWeight: 'bold', fontFamily: 'inherit', marginRight: '2px' }}>O</span>ur story began in the most unexpected way, sometimes the best ideas come when you least expect them. Through a simple conversation between five friends from different cities, each with unique skills and expertise, what started as an informal discussion quickly transformed into a shared vision: to build something meaningful, innovative, and lasting. From that moment, ADONS was born - a creative studio built on passion, collaboration, and the relentless pursuit of excellence.</p>

          <p>Each member of our founding team brings a distinctive set of skills, experiences, and ideas, creating a diverse foundation that fuels our creativity and sets us apart. We believe that our differences are not only our greatest asset but also the key to delivering exceptional work that pushes boundaries and inspires others.</p>
          <p style={{ marginTop: '2.5em' }}>
            <picture style={{ float: 'left', marginRight: '44px', marginTop: '-12px', marginBottom: '12px', zIndex: 1, position: 'relative' }}>
              <source
                type="image/avif"
                srcSet={
                  '/Images/optimized/about/studio_1-400.avif 400w, ' +
                  '/Images/optimized/about/studio_1-800.avif 800w, ' +
                  '/Images/optimized/about/studio_1-1200.avif 1200w, ' +
                  '/Images/optimized/about/studio_1-1600.avif 1600w, ' +
                  '/Images/optimized/about/studio_1-2400.avif 2400w'
                }
                sizes="(max-width: 600px) 90vw, 420px"
              />
              <source
                type="image/webp"
                srcSet={
                  '/Images/optimized/about/studio_1-400.webp 400w, ' +
                  '/Images/optimized/about/studio_1-800.webp 800w, ' +
                  '/Images/optimized/about/studio_1-1200.webp 1200w, ' +
                  '/Images/optimized/about/studio_1-1600.webp 1600w, ' +
                  '/Images/optimized/about/studio_1-2400.webp 2400w'
                }
                sizes="(max-width: 600px) 90vw, 420px"
              />
              <img
                src="/Images/about/studio_1.JPG"
                alt="ADONS Studio - Team Collaboration"
                style={{
                  width: '420px',
                  maxWidth: '80vw',
                  height: 'auto',
                  borderRadius: '32px 80px 24px 60px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
                  transform: 'rotate(-4deg) scale(1.08)',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
              />
            </picture>
            <span style={{ display: 'block', marginBottom: '10px' }}>
              At ADONS, we see every challenge as an opportunity to learn, grow, and innovate.
            </span>
            <span style={{ display: 'block', marginTop: '10px' }}>
              We have faced obstacles along the way, but each hurdle has strengthened our commitment and sharpened our skills. We understand that creativity thrives on collaboration, and our team operates not just as colleagues but as a family of creators who support one another and are united by a common goal: to turn visions into reality. We pride ourselves on fostering an environment where ideas flow freely, creativity is nurtured, and fun is part of the process.
            </span>
          </p>

          <p>As a full-service production house, ADONS specializes in every aspect of filmmaking, from pre-production and planning to on-set production and post-production. Whether it’s developing compelling concepts, executing seamless shoots, or delivering stunning visual effects and finishing touches, our team is dedicated to bringing each project to life with precision and passion. Alongside this, ADONS brings stories to life with immersive sound design, original music compositions, voice-over recording, and precise mixing &amp; mastering. We work closely with our clients, understanding their vision and translating it into high-end, impactful film and video content that resonates and inspires. Innovation is at the heart of everything we do, and we are constantly exploring new techniques, technologies, and creative approaches to elevate each project.</p>

          <p style={{ marginTop: '2.5em' }}>
            <picture style={{ float: 'right', marginLeft: '44px', marginTop: '-12px', marginBottom: '12px', zIndex: 1, position: 'relative' }}>
              <source
                type="image/avif"
                srcSet={
                  '/Images/optimized/about/studio_2-400.avif 400w, ' +
                  '/Images/optimized/about/studio_2-800.avif 800w, ' +
                  '/Images/optimized/about/studio_2-1200.avif 1200w, ' +
                  '/Images/optimized/about/studio_2-1600.avif 1600w, ' +
                  '/Images/optimized/about/studio_2-2400.avif 2400w'
                }
                sizes="(max-width: 600px) 90vw, 420px"
              />
              <source
                type="image/webp"
                srcSet={
                  '/Images/optimized/about/studio_2-400.webp 400w, ' +
                  '/Images/optimized/about/studio_2-800.webp 800w, ' +
                  '/Images/optimized/about/studio_2-1200.webp 1200w, ' +
                  '/Images/optimized/about/studio_2-1600.webp 1600w, ' +
                  '/Images/optimized/about/studio_2-2400.webp 2400w'
                }
                sizes="(max-width: 600px) 90vw, 420px"
              />
              <img
                src="/Images/about/studio_2.JPG"
                alt="ADONS Studio - Creative Hub"
                style={{
                  width: '420px',
                  maxWidth: '80vw',
                  height: 'auto',
                  borderRadius: '60px 24px 80px 32px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
                  transform: 'rotate(3deg) scale(1.08)',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
              />
            </picture>
            <span style={{ display: 'block', marginBottom: '10px' }}>
              Today, ADONS stands as more than just a studio — we are a hub for creativity, a place where ideas are transformed into extraordinary realities.
            </span>
            <span style={{ display: 'block', marginTop: '10px' }}>
              Our journey is only just beginning, and we are excited about the endless possibilities that lie ahead. Together, with our clients and collaborators, we look forward to creating stories that move, inspire, and leave a lasting impact. At ADONS, we don't just make content; we craft experiences.
            </span>
          </p>

          <h3 
            className="mt-24 text-2xl font-semibold inline-block border-b-4 pb-1"
            style={{ borderBottomColor: 'var(--brand-gold)', color: '#fff' }}
          >
            We Keep our word
          </h3>
          <ul className="list-none ml-6 space-y-2">
            <li>
              <strong className="inline-block mt-2" style={{ color: 'var(--brand-gold)' }}>WE ARE ON TIME</strong>
              <div>We take pride in delivering high-quality work on time, ensuring reliability, efficiency, and professionalism in every project we complete.</div>
            </li>
            <li>
              <strong className="inline-block mt-6" style={{ color: 'var(--brand-gold)' }}>WE ARE SATISFACTORY</strong>
              <div>We ensure exceptional quality and satisfaction in every project, delivering reliable, professional results tailored to meet our clients' needs with precision, creativity, and dedication to excellence in every detail.</div>
            </li>
            <li>
              <strong className="inline-block mt-6" style={{ color: 'var(--brand-gold)' }}>WE KEEP YOU SECURED</strong>
              <div>We prioritize privacy in every project, ensuring complete confidentiality and security for all client data, ideas, and materials, maintaining trust and discretion throughout every stage of development and collaboration.</div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
