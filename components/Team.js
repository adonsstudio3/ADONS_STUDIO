import { useState } from 'react'
import styles from './TeamPopup.module.css'
import OptimizedImage from './OptimizedImage'
import { useScrollReveal } from '../hooks/useScrollReveal'

// TeamImage: now using OptimizedImage for optimized delivery
function TeamImage({ name, alt, style, priority = false }) {
  // prefer className for sizing so CSS/tailwind rules apply and avoid inline-style conflicts
  const objPos = style && style.objectPosition ? { objectPosition: style.objectPosition } : {};
  return (
    <OptimizedImage
      name={name}
      alt={alt}
      className="w-full h-full object-cover block"
      // Force height:100% and display:block to avoid sizing conflicts in card containers
      style={{ height: '100%', display: 'block', ...objPos }}
      width={500}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
    />
  );
}

export default function Team(){
  // Team members: populate this array with real team data (name, role, bio, image)
  // First image provided by user: public/Images/SWAPU.jpg
  const members = [
    {
      image: 'team/swapneel',
      name: 'SWAPNEEL CHOUDHURY',
      role: 'CEO',
      tagline: '"Where creativity meets mastery, the impossible becomes real."',
      bio:
        'Swapneel Choudhury, the visionary CEO of ADONS, is a creative force in the world of fantasy and visual effects. With four years of expertise in 2D, 3D, and VFx, he specializes in creative effects and simulation, turning imagination into reality. His keen eye for details, adaptability to trends, and commitment to innovation sets him apart. A strong leader and decision-maker, Swapneel excels at managing complex projects while inspiring those around him to push the boundaries of visual storytelling. His deep industry foundation and passion for cutting-edge visuals drive him to create groundbreaking and immersive experiences.',
      taglineMargin: '20rem',
      bioMargin: '-0.5rem'
    },
    {
      image: 'team/sampanna',
      name: 'SAMPANNA MISHRA',
      role: 'CFO',
      tagline: '"When it rains it pours."',
      bio: `At the forefront of ADONS's success is Sampanna Mishra, our CFO. She defines her aura with excellent confidence and authority. "Challenges are the most delicious thing on my plate." She comes from a blended background, holding strong experience in visual effects and musical essence. Her dedication, strategic vision and financial expertise are a boon for ADONS as she leads decision making and helps drive growth and stability.`,
      taglineMargin: '24rem',
      bioMargin: '-0.5rem'
    },
    {
      image: 'team/siddhant',
      name: 'SIDDHANT KHEDKAR',
      role: 'CMO',
      tagline: '"Expert in executing swiftly the visual arts, audio ethos and packaging outcomes with influential finesses."',
      bio: "Introducing Siddhant Khedkar, the CMO of ADONS. He is a highly talented VFx artist with a specialization in sound design and artist management that truly sets him apart in the industry. His ability to create immersive audio and artist management experiences complements his visual effects work, which is nothing short of remarkable. He excels in brand positioning, market analysis, digital marketing, and leading creative teams to deliver impactful campaigns aligned with the studio's vision. Siddhant's attention to detail and passion for his craft shine through every project he takes on. His work is a testament to his skill, dedication, and artistry. He is a true master in his field, and his contributions to VFx, artist management, and sound design are nothing short of extraordinary.",
      forceRight: true,
      taglineMargin: '16rem',
      bioMargin: '-0.5rem'
    },
    {
      image: 'team/adarsh',
      name: 'ADARSH  MOHANTY',
      role: 'CTO',
      tagline: '"Vision without execution is just hallucination."',
      bio: "Turning the table to Adarsh Mohanty, the CTO of ADONS, holding a Bachelor's degree in Visual Arts and a certificate in Advanced Visual Effects (AdVFx). With extensive experience as a storyboard artist, Adarsh brings both creative and field knowledge to his work. His skills of aligning product development with business goals, managing engineering teams, and implementing cutting-edge solutions are a great contribution to ADONS. His expertise also spans 2D animation, 3D environments, and VFx, allowing him to seamlessly merge art with technology. As the Chief Technology Officer at ADONS, his passion for visual storytelling drives innovation, ensuring that the company stays at the forefront of delivering high quality digital experiences.",
      forceRight: false,
      taglineMargin: '18rem',
      bioMargin: '-0.5rem'
    }
  ];

  const [popupIdx, setPopupIdx] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Scroll reveal refs - disabled for static cards
  const card0Ref = null
  const card1Ref = null
  const card2Ref = null
  const card3Ref = null
  const cardRefs = [card0Ref, card1Ref, card2Ref, card3Ref]

  // Scroll reveal refs for team section borders - disabled for static cards
  const borderTopRef = null
  const borderBottomRef = null

  const memberNodes = members.map((m, idx) => {
    const isHovered = hoveredIdx === idx;
    return (
      <div ref={cardRefs[idx]} key={m.name}
        className={`team-card group relative flex flex-col items-center justify-start flex-1 min-w-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
        style={{ height: '70vh', cursor: 'pointer', borderRadius: '0', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)', background: '#1A141A', border: 'none', overflow: 'hidden', transition: 'transform 0.22s cubic-bezier(.4,1.6,.6,1), box-shadow 0.22s' }}
        onMouseEnter={() => setHoveredIdx(idx)}
        onMouseLeave={() => setHoveredIdx(null)}
        onClick={() => setPopupIdx(idx)}
        tabIndex={0}
      >
        {/* Full Image Container */}
        <div className="team-card-image" style={{ width: '100%', height: '100%', position: 'relative', background: '#222', display: 'flex', alignItems: 'stretch', justifyContent: 'center', overflow: 'hidden' }}>
          {m.image ? (
              <TeamImage name={m.image} alt={m.name || 'Team member'} style={{ objectPosition: m.name === 'SAMPANNA MISHRA' ? 'center top' : 'center' }} priority={idx < 2} />
          ) : (
            <div className="team-avatar w-36 h-36 rounded-full flex-shrink-0" style={{ background: '#FFD700', margin: 'auto' }} aria-hidden />
          )}
          
          {/* Overlay - appears on hover */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            padding: '1.5rem',
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            textAlign: 'center',
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s ease-out',
            zIndex: 10
          }}>
            <div style={{ color: '#FFD700', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              {m.name}
            </div>
            <div style={{ color: '#f5f5f5', fontSize: '0.875rem', fontWeight: '400', lineHeight: 1.3 }}>
              {m.role}
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <section id="team" className="pt-16 md:pt-24 pb-20">
      <style jsx>{`
        @keyframes teamScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 1px));
          }
        }

        .team-section-container {
          position: relative;
          overflow: hidden;
        }

        @keyframes textScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(50%);
          }
        }

        @keyframes textScrollReverse {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .team-border-text {
          position: absolute;
          left: 0;
          width: 200%;
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: 8px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.8);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          white-space: nowrap;
          animation: textScroll 40s linear infinite;
          pointer-events: none;
          z-index: 0;
          will-change: transform;
        }

        .team-border-top {
          top: 0;
          height: 80px;
          display: flex;
          align-items: center;
          overflow: hidden;
          margin-bottom: 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0 1rem;
        }

        .team-border-bottom {
          bottom: 0;
          height: 80px;
          display: flex;
          align-items: center;
          overflow: hidden;
          margin-top: 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0 1rem;
        }

        .team-carousel-container {
          overflow: hidden;
          width: 100%;
          height: 70vh;
          position: relative;
          z-index: 10;
        }

        .team-carousel-wrapper {
          display: flex;
          gap: 1rem;
          animation: none;
          height: 100%;
          width: 100%;
          padding: 0 0.5rem;
        }

        .team-carousel-item {
          flex: 0 0 calc(25% - 0.75rem);
          height: 100%;
          display: flex;
          align-items: stretch;
        }

        .team-carousel-wrapper:hover {
          animation-play-state: paused;
        }

        .team-border-text:hover {
          animation-play-state: paused;
        }

        /* Mobile-specific team card styles */
        @media (max-width: 768px) {
          .team-border-text {
            font-size: 1.2rem;
            letter-spacing: 4px;
            animation: textScroll 40s linear infinite;
          }

          .team-border-top,
          .team-border-bottom {
            height: 50px;
            margin: 1rem 0;
          }

          .team-carousel-container {
            height: auto;
          }

          .team-carousel-wrapper {
            flex-direction: column;
            animation: none;
          }

          .team-carousel-item {
            flex: 0 0 auto;
            width: 100% !important;
            max-width: 300px;
            margin: 0 auto 2rem auto;
          }

          .team-carousel-item:nth-child(n+5) {
            display: none;
          }

          .team-card {
            width: 100% !important;
            max-width: 300px !important;
            margin: 0 auto !important;
          }

          .team-card-image {
            width: 100% !important;
          }
        }
      `}</style>

      <div className="team-section-container">
        {/* Top Border */}
        <div ref={borderTopRef} className="team-border-top">
          <div className="team-border-text">
            MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • 
          </div>
        </div>

        {/* Carousel */}
        <div className="team-carousel-container">
          <div className="team-carousel-wrapper">
            {memberNodes.map((node, idx) => (
              <div key={`carousel-${idx}`} className="team-carousel-item">
                {node}
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {memberNodes.map((node, idx) => (
              <div key={`carousel-dup-${idx}`} className="team-carousel-item">
                {node}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Border */}
        <div ref={borderBottomRef} className="team-border-bottom">
          <div className="team-border-text" style={{ animation: 'textScrollReverse 40s linear infinite' }}>
            MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM • MEET OUR TEAM •
          </div>
        </div>
      </div>
      {/* Popup Modal */}
      {popupIdx !== null && (
        <div className={styles.popupOverlay} onClick={() => setPopupIdx(null)}>
          <div className={styles.popupCard} onClick={e => e.stopPropagation()} tabIndex={0}>
            <button className={styles.popupCloseBtn} onClick={() => setPopupIdx(null)} aria-label="Close profile">&times;</button>
            {/* Alternate layout: even indices (0,2,4...) = image left, odd indices (1,3,5...) = image right */}
            {popupIdx % 2 === 0 ? (
              <>
                {/* Image on left - use direct <img> */}
                <div className={styles.popupImageSide}>
                  <TeamImage name={members[popupIdx].image} alt={members[popupIdx].name} style={{ objectPosition: members[popupIdx].name === 'SAMPANNA MISHRA' ? 'top' : 'center' }} priority={true} />
                </div>
                {/* Text on right */}
                <div className={styles.popupTextSide}>
                  <div className={styles.popupName}>{members[popupIdx].name}</div>
                  <div className={styles.popupRole}>{members[popupIdx].role}</div>
                  <div className={styles.popupTagline}>{members[popupIdx].tagline}</div>
                  <div className={styles.popupBio}>{members[popupIdx].bio}</div>
                </div>
              </>
            ) : (
              <>
                {/* Text on left */}
                <div className={styles.popupTextSideLeft}>
                  <div className={styles.popupName}>{members[popupIdx].name}</div>
                  <div className={styles.popupRole}>{members[popupIdx].role}</div>
                  <div className={styles.popupTagline}>{members[popupIdx].tagline}</div>
                  <div className={styles.popupBio}>{members[popupIdx].bio}</div>
                </div>
                {/* Image on right - use direct <img> */}
                <div className={styles.popupImageSideRight}>
                  <TeamImage name={members[popupIdx].image} alt={members[popupIdx].name} style={{ objectPosition: members[popupIdx].name === 'SAMPANNA MISHRA' ? 'top' : 'center' }} priority={true} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
