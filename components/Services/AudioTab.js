"use client";

import React from 'react';
import OptimizedImage from '../OptimizedImage';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function AudioTab(){
  const tracks = [
    { key: 'sd', title: 'Sound Design', body: 'Designing sound effects for media', h: 560, img: 'audio/sound-design' },
    { key: 'mp', title: 'Music Production', body: 'Composing, recording, mixing and mastering', h: 520, img: 'audio/music-production' },
    { key: 'vo', title: 'Voiceover & Dubbing', body: 'Recording and editing voice work', h: 420, img: 'audio/voiceover-dubbing' },
    { key: 'pp', title: 'Podcast Production', body: 'End-to-end podcast production', h: 480, img: 'audio/podcast-production' },
    { key: 'ar', title: 'Audio Restoration', body: 'Cleaning and remastering audio', h: 400, img: 'audio/audio-restoration' }
  ]

  // Create scroll reveal refs for each card with staggered delays
  const cardRefs = tracks.map((_, idx) => 
    useScrollReveal({ 
      duration: 0.7, 
      delay: idx * 0.12,
      rootMargin: '50px'
    })
  );

  return (
    <div className="audio-grid-wrapper">
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

        /* Grid layout: 3 cards top, 2 cards bottom */
        .audio-grid-wrapper {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3.5rem;
          width: 100%;
        }

        /* Mobile: single column */
        @media (max-width: 768px) {
          .audio-grid-wrapper {
            grid-template-columns: 1fr;
            gap: 3.5rem;
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 769px) and (max-width: 1023px) {
          .audio-grid-wrapper {
            grid-template-columns: repeat(2, 1fr);
            gap: 3.5rem;
          }
        }

        /* Large screens: 3 columns with centered bottom row */
        @media (min-width: 1024px) {
          .audio-grid-wrapper {
            grid-template-columns: repeat(6, 1fr);
            gap: 3.5rem;
          }

          /* Top 3 cards span 2 columns each */
          .audio-card:nth-child(1) {
            grid-column: 1 / 3;
          }

          .audio-card:nth-child(2) {
            grid-column: 3 / 5;
          }

          .audio-card:nth-child(3) {
            grid-column: 5 / 7;
          }

          /* Bottom 2 cards centered and span 2 columns each */
          .audio-card:nth-child(4) {
            grid-column: 2 / 4;
          }

          .audio-card:nth-child(5) {
            grid-column: 4 / 6;
          }
        }

        .audio-card { 
          display: flex;
          flex-direction: column;
          width: 100%; 
          height: 500px;
          border-radius: 0.5rem; 
          overflow: hidden;
          opacity: 0;
          transform: translateY(40px);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.18);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .audio-card.reveal {
          animation: slideInCard 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .audio-card:hover {
          box-shadow: 0 8px 32px 0 rgba(245, 200, 66, 0.2) !important;
          transform: translateY(-4px) scale(1.02);
          background: rgba(255, 255, 255, 0.08);
        }

        /* Image section - 65% of card height */
        .audio-card-image {
          height: 65%;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .audio-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .audio-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          transition: background-color 0.3s;
        }

        .audio-card:hover .audio-card-overlay {
          background: rgba(0, 0, 0, 0.35);
        }

        /* Content section - 35% of card height */
        .audio-card-content {
          height: 35%;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          background: transparent;
        }

        .audio-card-content h4 {
          color: #FFD700;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          margin-bottom: 0.5rem;
        }

        .audio-card-content p {
          color: #d1d5db;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }
      `}</style>

      {tracks.map((t, idx) => (
        <article
          key={t.key}
          ref={cardRefs[idx]}
          className="audio-card"
          tabIndex={0}
          role="button"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
            }
          }}
        >
          {/* Image section */}
          <div className="audio-card-image">
            {t.img ? (
              <>
                <OptimizedImage
                  name={t.img}
                  loading="lazy"
                  alt={t.title}
                  className="w-full h-full object-cover block"
                  width={400}
                />
                <div className="audio-card-overlay" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-black/6 to-black/12" aria-hidden="true" />
            )}
          </div>

          {/* Content section */}
          <div className="audio-card-content">
            <h4>{t.title}</h4>
            <p>{t.body}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
