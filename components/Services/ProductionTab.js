"use client";

import React from "react";
import OptimizedImage from "../OptimizedImage";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function ProductionTab(){
  const cards = [
    {
      key: 'pre',
      title: 'Pre-Production',
      description: 'This phase lays the groundwork for the entire project.',
      src: 'production/pre-production',
      content: () => {
        return (
          <div>
            <h4 className="text-white font-semibold mb-2">Our Services:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><span className="text-yellow-400 font-semibold">Concept Development</span> – Refining the idea, theme, and vision.</li>
              <li><span className="text-yellow-400 font-semibold">Scriptwriting</span> – Writing the script, screenplay, or storyboard.</li>
              <li><span className="text-yellow-400 font-semibold">Budgeting</span> – Estimating costs and allocating resources.</li>
              <li><span className="text-yellow-400 font-semibold">Storyboarding</span> – Creating visual representations of scenes.</li>
              <li><span className="text-yellow-400 font-semibold">Casting</span> – Selecting actors or voice artists.</li>
              <li><span className="text-yellow-400 font-semibold">Location Scouting</span> – Finding the perfect places for filming.</li>
              <li><span className="text-yellow-400 font-semibold">Production Scheduling</span> – Planning shoot dates and logistics.</li>
              <li><span className="text-yellow-400 font-semibold">Set & Costume Design</span> – Designing the look and feel of the project.</li>
              <li><span className="text-yellow-400 font-semibold">Equipment Planning</span> – Choosing the right cameras, lighting, and gear.</li>
            </ul>
          </div>
        );
      }
    },
    {
      key: 'main',
      title: 'Production',
      description: 'This is where the project is physically created.',
      src: 'production/production',
      content: () => {
        return (
          <div>
            <h4 className="text-white font-semibold mb-2">Our Services:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><span className="text-yellow-400 font-semibold">Cinematography</span> – Capturing high-quality visuals.</li>
              <li><span className="text-yellow-400 font-semibold">Direction</span> – Guiding actors and the creative team.</li>
              <li><span className="text-yellow-400 font-semibold">Lighting Setup</span> – Ensuring the perfect mood and atmosphere.</li>
              <li><span className="text-yellow-400 font-semibold">Sound Recording</span> – Capturing clean audio on set.</li>
              <li><span className="text-yellow-400 font-semibold">Special Effects (SFX/VFX Setup)</span> – Setting up for CGI or practical effects.</li>
              <li><span className="text-yellow-400 font-semibold">Drone & Aerial Filming</span> – Capturing stunning aerial shots if required.</li>
            </ul>
          </div>
        );
      }
    },
    {
      key: 'post',
      title: 'Post-Production',
      description: 'After shooting, all elements are refined and assembled.',
      src: 'production/post-production',
      content: () => {
        return (
          <div>
            <h4 className="text-white font-semibold mb-2">Our Services:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><span className="text-yellow-400 font-semibold">Video Editing</span> – Cutting and assembling the footage.</li>
              <li><span className="text-yellow-400 font-semibold">Color Grading & Correction</span> – Enhancing visuals for the perfect look.</li>
              <li><span className="text-yellow-400 font-semibold">Visual Effects (VFX)</span> – Adding CGI, simulations, or enhancements.</li>
              <li><span className="text-yellow-400 font-semibold">Motion Graphics</span> – Creating dynamic animations or text elements.</li>
              <li><span className="text-yellow-400 font-semibold">Sound Design & Foley</span> – Enhancing audio quality and adding effects.</li>
              <li><span className="text-yellow-400 font-semibold">Music Composition & Scoring</span> – Customizing background music.</li>
              <li><span className="text-yellow-400 font-semibold">Voiceover & Dubbing</span> – Recording additional dialogue if needed.</li>
              <li><span className="text-yellow-400 font-semibold">Final Render & Mastering</span> – Exporting the project in the best format.</li>
            </ul>
          </div>
        );
      }
    }
  ];

  // Create scroll reveal refs for each card with staggered delays
  const cardRefs = cards.map((_, idx) => 
    useScrollReveal({ 
      duration: 0.7, 
      delay: idx * 0.12,
      rootMargin: '50px'
    })
  );

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
      <style jsx>{`
        @keyframes slideInCard {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .production-card {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.18);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(40px);
        }

        .production-card.reveal {
          animation: slideInCard 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .production-card:hover {
          box-shadow: 0 8px 32px 0 rgba(245,200,66,0.2);
          transform: translateY(-4px) scale(1.02);
          background: rgba(255,255,255,0.15);
        }


      `}</style>
      {cards.map((card, idx) => (
        <div
          key={card.key}
          ref={cardRefs[idx]}
          className="production-card overflow-hidden rounded-none"
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
            <OptimizedImage
              width={600}
              name={card.src}
              alt={card.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Content below */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(0,0,0,0.3)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ color: '#FFD700', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
              {card.title}
            </h3>
            <p style={{ color: '#e5e5e5', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {card.description}
            </p>
            <div style={{ color: '#fff', fontSize: '0.8rem', lineHeight: 1.5 }}>
              {card.content()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
