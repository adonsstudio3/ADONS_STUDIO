'use client';

import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { usePublicShowreels } from '../hooks/usePublicShowreels';
import { useScrollReveal } from '../hooks/useScrollReveal';
import ScrollVelocity from './ScrollVelocity';

// Extract YouTube video ID from URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, // youtube.com or youtu.be
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

export default function ShowreelPlayer() {
  const containerRef = useRef(null);
  const titleRef = useScrollReveal({ duration: 0.8, delay: 0 });
  const playerRef = useScrollReveal({ duration: 0.8, delay: 0.2 });
  const descRef = useScrollReveal({ duration: 0.8, delay: 0.4 });
  const { featuredShowreel, loading } = usePublicShowreels();
  const [videoId, setVideoId] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  // Scroll-triggered stretch animation removed per user request
  useEffect(() => {
    if (featuredShowreel?.video_url) {
      const id = extractYouTubeId(featuredShowreel.video_url);
      console.log('🎬 ShowreelPlayer - Video URL:', featuredShowreel.video_url);
      console.log('🎬 ShowreelPlayer - Extracted ID:', id);
      setVideoId(id);
      if (id) {
        setThumbnailUrl(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      }
    } else {
      console.log('🎬 ShowreelPlayer - No featured showreel or URL:', { featuredShowreel });
    }
  }, [featuredShowreel]);

  // Scroll-triggered zoom effect removed per user request

  if (loading) {
    return (
      <section ref={containerRef} className="py-16 px-4 md:px-8 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="aspect-video bg-gray-900 rounded-lg animate-pulse" />
        </div>
      </section>
    );
  }

  if (!featuredShowreel) {
    return (
      <section className="py-4 px-0 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div className="relative w-full overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9', maxWidth: '1200px', borderRadius: '0.5rem', margin: '0 auto', background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </section>
    );
  }

  if (!videoId) {
    return (
      <section className="py-4 px-0 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div className="relative w-full overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9', maxWidth: '1200px', borderRadius: '0.5rem', margin: '0 auto', background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="py-4 px-0 w-full overflow-hidden">
      {/* Top Scroll Velocity Text */}
      <ScrollVelocity
        texts={['SHOWREEL']}
        velocity={60}
        className="text-white/80 drop-shadow-lg"
        parallaxClassName="relative py-6 px-4 md:px-6 lg:px-8 border-t border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div ref={playerRef}>
          <motion.div className="relative w-full overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9', maxWidth: '1200px', borderRadius: '0.5rem', margin: '0 auto' }}>
            {/* YouTube Embed - Always loads, thumbnail shows while loading */}
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&fs=1`}
              title={featuredShowreel?.title || 'Showreel'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              style={{ border: 'none' }}
            />
          </motion.div>
        </div>

        {/* Title and description below player */}
        {/* Only show title if it's not the auto-generated "Showreel - {videoId}" format */}
        {featuredShowreel?.title && !featuredShowreel.title.match(/^Showreel - [a-zA-Z0-9_-]{11}$/) && (
          <div ref={titleRef} className="mt-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {featuredShowreel.title}
            </h3>
            {featuredShowreel?.description && (
              <p ref={descRef} className="text-gray-400 text-lg">
                {featuredShowreel.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Scroll Velocity Text */}
      <ScrollVelocity
        texts={['SHOWREEL']}
        velocity={-60}
        className="text-white/80 drop-shadow-lg"
        parallaxClassName="relative py-6 px-4 md:px-6 lg:px-8 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </section>
  );
}
