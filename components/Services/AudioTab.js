"use client";

import React from 'react';

export default function AudioTab(){
  const tracks = [
    { key: 'sd', title: 'Sound Design', body: 'Designing sound effects for media', h: 560, img: '/Images/Sound design.jpg' },
    { key: 'mp', title: 'Music Production', body: 'Composing, recording, mixing and mastering', h: 520, img: '/Images/Music production.jpg' },
    { key: 'vo', title: 'Voiceover & Dubbing', body: 'Recording and editing voice work', h: 420, img: '/Images/voice-over and dubbing.png' },
    { key: 'pp', title: 'Podcast Production', body: 'End-to-end podcast production', h: 480, img: '/Images/podcast Production.jpg' },
    { key: 'ar', title: 'Audio Restoration', body: 'Cleaning and remastering audio', h: 400, img: '/Images/Audio restoration.webp' }
  ]

  return (
    <div className="masonry-wrapper">
      <style jsx>{`
        /* Mobile-first default */
        .masonry-wrapper {
          -webkit-column-count: 2;
          -moz-column-count: 2;
          column-count: 2;
          -webkit-column-gap: 0.75rem;
          -moz-column-gap: 0.75rem;
          column-gap: 0.75rem;
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
                <img
                  src={t.img}
                  loading="lazy"
                  alt={
                    t.title && t.description
                      ? `${t.title} - ${t.description}`
                      : t.title
                        ? `${t.title} image`
                        : 'Service image'
                  }
                  className="object-cover w-full h-full block"
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
