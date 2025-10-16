"use client";

import React from 'react';
import OptimizedImage from '../OptimizedImage';

export default function AudioTab(){
  const tracks = [
    { key: 'sd', title: 'Sound Design', body: 'Designing sound effects for media', h: 560, img: 'audio/sound-design' },
    { key: 'mp', title: 'Music Production', body: 'Composing, recording, mixing and mastering', h: 520, img: 'audio/music-production' },
    { key: 'vo', title: 'Voiceover & Dubbing', body: 'Recording and editing voice work', h: 420, img: 'audio/voiceover-dubbing' },
    { key: 'pp', title: 'Podcast Production', body: 'End-to-end podcast production', h: 480, img: 'audio/podcast-production' },
    { key: 'ar', title: 'Audio Restoration', body: 'Cleaning and remastering audio', h: 400, img: 'audio/audio-restoration' }
  ]

  return (
    <div className="masonry-wrapper">
      <style jsx>{`
        /* Mobile-first default: stack vertically on mobile */
        .masonry-wrapper {
          -webkit-column-count: 2;
          -moz-column-count: 2;
          column-count: 2;
          -webkit-column-gap: 0.75rem;
          -moz-column-gap: 0.75rem;
          column-gap: 0.75rem;
        }

        /* Mobile: single column vertical stack */
        @media (max-width: 768px) {
          .masonry-wrapper {
            -webkit-column-count: 1;
            -moz-column-count: 1;
            column-count: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .masonry-card {
            width: 100% !important;
            height: auto !important;
            min-height: 400px;
            break-inside: auto;
            margin: 0;
          }
        }

        /* Larger screens: increase to 3 columns */
        @media (min-width: 1024px) {
          .masonry-wrapper {
            -webkit-column-count: 3;
            -moz-column-count: 3;
            column-count: 3;
            -webkit-column-gap: 1rem;
            -moz-column-gap: 1rem;
            column-gap: 1rem;
          }
            .masonry-card p {
              font-size: 1.15rem;
            }
        }

        .masonry-card { display: inline-block; width: 100%; margin: 0 0 0.75rem; break-inside: avoid; border-radius: 0.5rem; overflow: hidden; }
      `}</style>

      {tracks.map((t) => (
        <article
          key={t.key}
          className="masonry-card bg-white/5 backdrop-blur-sm shadow-sm transition-all duration-200 group overflow-hidden rounded hover:shadow-lg hover:scale-[1.03] hover:-translate-y-1 focus-visible:shadow-lg focus-visible:scale-[1.03] focus-visible:-translate-y-1"
          style={{height: `${t.h}px`}}
          tabIndex={0}
          role="button"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // If these cards are meant to be interactive, trigger the intended action here
              // For now, just visually indicate focus/activation
            }
          }}
        >

          {/* Image-dominant top area (approx 68% height) with visible border */}
          {t.img ? (
            <div className="relative h-[68%] p-3 flex items-stretch">
              <div className="relative w-full h-full border border-white/10 rounded-md overflow-hidden">
                <OptimizedImage
                  name={t.img}
                  loading="lazy"
                  alt={
                    t.title && t.description
                      ? `${t.title} - ${t.description}`
                      : t.title
                        ? `${t.title} image`
                        : 'Service image'
                  }
                  className="object-cover w-full h-full block"
                  style={{ width: '100%', height: '100%' }}
                  width={400}
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/30 transition-colors" />
              </div>
            </div>
          ) : (
            <div className="h-[68%] bg-gradient-to-br from-black/6 to-black/12 p-6 flex items-center justify-center" aria-hidden="true">
              <div className="w-full h-full border border-white/8 rounded-md" />
            </div>
          )}

          {/* Small content area at bottom */}
          <div className="h-[32%] p-5 flex items-start bg-transparent">
            <div>
              <h4 className="text-yellow-400 text-xl font-semibold">{t.title}</h4>
              <p className="text-gray-300 text-sm leading-relaxed mt-1">{t.body}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
