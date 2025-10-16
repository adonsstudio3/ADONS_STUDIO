import { useState } from 'react'
import styles from './TeamPopup.module.css'
import OptimizedImage from './OptimizedImage'

// TeamImage: now using OptimizedImage for optimized delivery
function TeamImage({ name, alt, style }) {
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
      loading="lazy"
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
      role: 'CEO, Founding Member of ADONS Studio.',
      tagline: '"Where creativity meets mastery, the impossible becomes real."',
      bio:
        'Swapneel Choudhury, the visionary CEO of ADONS, is a creative force in the world of fantasy and visual effects. With four years of expertise in 2D, 3D, and VFx, he specializes in creative effects and simulation, turning imagination into reality. His keen eye for details, adaptability to trends, and commitment to innovation sets him apart. A strong leader and decision-maker, Swapneel excels at managing complex projects while inspiring those around him to push the boundaries of visual storytelling. His deep industry foundation and passion for cutting-edge visuals drive him to create groundbreaking and immersive experiences.',
      taglineMargin: '20rem',
      bioMargin: '-0.5rem'
    },
    {
      image: 'team/suman',
      name: 'SUMAN SOURAV',
      role: 'COO, Founding Member of ADONS Studio.',
      tagline: '"Leading with calmness, perfecting with precision."',
      bio:
        "Suman Sourav, the COO of ADONS, specializes in 3D design and holds expertise in managing operations smoothly. His skills allow him to create dynamic and visually impressive animations. With a deep understanding of VFx technology, he brings creativity and technical proficiency to his work. As a leader, he contributes to the growth and success of ADONS by managing projects efficiently. His knowledge of 3D enables him to design realistic and interactive visual content. Passionate about innovation, he constantly explores new techniques to enhance his work. His dedication and proficient nature make him a valuable asset in this industry.",
      taglineMargin: '20rem',
      bioMargin: '-0.5rem'
    },
    {
      image: 'team/sampanna',
      name: 'SAMPANNA MISHRA',
      role: 'CFO, Founding Member of ADONS Studio.',
      tagline: '"When it rains it pours."',
      bio: `At the forefront of ADONS's success is Sampanna Mishra, our CFO. She defines her aura with excellent confidence and authority. "Challenges are the most delicious thing on my plate." She comes from a blended background, holding strong experience in visual effects and musical essence. Her dedication, strategic vision and financial expertise are a boon for ADONS as she leads decision making and helps drive growth and stability.`,
      taglineMargin: '24rem',
      bioMargin: '-0.5rem'
    },
    {
      image: 'team/siddhant',
      name: 'SIDDHANT KHEDKAR',
      role: 'CMO, Founding Member of ADONS Studio.',
      tagline: '"Expert in executing swiftly the visual arts, audio ethos and packaging outcomes with influential finesses."',
      bio: "Introducing Siddhant Khedkar, the CMO of ADONS. He is a highly talented VFx artist with a specialization in sound design and artist management that truly sets him apart in the industry. His ability to create immersive audio and artist management experiences complements his visual effects work, which is nothing short of remarkable. He excels in brand positioning, market analysis, digital marketing, and leading creative teams to deliver impactful campaigns aligned with the studio's vision. Siddhant's attention to detail and passion for his craft shine through every project he takes on. His work is a testament to his skill, dedication, and artistry. He is a true master in his field, and his contributions to VFx, artist management, and sound design are nothing short of extraordinary.",
      forceRight: true,
      taglineMargin: '16rem',
      bioMargin: '-0.5rem'
    },
    {
      image: 'team/adarsh',
      name: 'ADARSH  MOHANTY',
      role: 'CTO, Founding Member of ADONS Studio.',
      tagline: '"Vision without execution is just hallucination."',
      bio: "Turning the table to Adarsh Mohanty, the CTO of ADONS, holding a Bachelor's degree in Visual Arts and a certificate in Advanced Visual Effects (AdVFx). With extensive experience as a storyboard artist, Adarsh brings both creative and field knowledge to his work. His skills of aligning product development with business goals, managing engineering teams, and implementing cutting-edge solutions are a great contribution to ADONS. His expertise also spans 2D animation, 3D environments, and VFx, allowing him to seamlessly merge art with technology. As the Chief Technology Officer at ADONS, his passion for visual storytelling drives innovation, ensuring that the company stays at the forefront of delivering high quality digital experiences.",
      forceRight: false,
      taglineMargin: '18rem',
      bioMargin: '-0.5rem'
    }
  ];

  const [popupIdx, setPopupIdx] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const memberNodes = members.map((m, idx) => {
    const isHovered = hoveredIdx === idx;
    return (
      <div
        key={m.name}
        className={`team-card group relative flex flex-col items-center justify-start mx-auto transition-all duration-300 hover:scale-[1.045] hover:shadow-2xl hover:border-gold`}
        style={{ width: '320px', height: '520px', maxWidth: '100%', cursor: 'pointer', borderRadius: '1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.18)', overflow: 'hidden', marginBottom: '2rem', transition: 'transform 0.22s cubic-bezier(.4,1.6,.6,1), box-shadow 0.22s, border-color 0.22s' }}
        onMouseEnter={() => setHoveredIdx(idx)}
        onMouseLeave={() => setHoveredIdx(null)}
        onClick={() => setPopupIdx(idx)}
        tabIndex={0}
      >
        {/* Image - now takes up more vertical space */}
  <div className="team-card-image" style={{ width: '100%', height: '84%', minHeight: 0, overflow: 'hidden', borderRadius: '1.5rem 1.5rem 0 0', position: 'relative', background: '#222', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
          {m.image ? (
              <TeamImage name={m.image} alt={m.name || 'Team member'} style={{ objectPosition: m.name === 'SAMPANNA MISHRA' ? 'center top' : 'center', borderBottom: 'none' }} />
          ) : (
            <div className="team-avatar w-36 h-36 rounded-full mb-4 flex-shrink-0" style={{ background: '#FFD700', margin: 'auto', borderBottom: 'none' }} aria-hidden />
          )}
        </div>
        {/* Name and Role below image - compact area */}
        <div style={{ width: '100%', padding: '0.5rem 1.2rem 0.5rem 1.2rem', textAlign: 'center', minHeight: '0' }}>
          <div className="font-semibold text-base md:text-lg text-gold mb-1" style={{ letterSpacing: '0.01em', lineHeight: 1.1 }}>{m.name}</div>
          <div className="text-[11px] md:text-xs" style={{ color: '#f5f5f5', lineHeight: 1, marginTop: '0.7rem' }}>{m.role}</div>
        </div>
      </div>
    );
  });

  return (
    <section id="team" className="pt-16 md:pt-24 pb-32">
      <style jsx>{`
        /* Mobile-specific team card styles */
        @media (max-width: 768px) {
          .team-card {
            width: 100% !important;
            max-width: 300px !important;
            margin: 0 auto 2rem auto !important;
          }
          
          .team-cards-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
          }
          
          .team-card-image {
            width: 100% !important;
          }
          
          .team-card .text-content {
            text-align: center !important;
            padding: 1rem !important;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8 team-cards-container">
          {memberNodes}
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
                  <TeamImage name={members[popupIdx].image} alt={members[popupIdx].name} style={{ objectPosition: members[popupIdx].name === 'SAMPANNA MISHRA' ? 'top' : 'center' }} />
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
                  <TeamImage name={members[popupIdx].image} alt={members[popupIdx].name} style={{ objectPosition: members[popupIdx].name === 'SAMPANNA MISHRA' ? 'top' : 'center' }} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
