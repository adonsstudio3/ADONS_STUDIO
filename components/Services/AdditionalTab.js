import OptimizedImage from '../OptimizedImage';

export default function AdditionalTab(){
  const blocks = [
    { key: 'ads', title: 'Corporate & Commercial Ads', body: 'High-quality ads and brand films.', img: 'additional/corporate-commercial' },
    { key: 'artist', title: 'Artist Management & Branding', body: 'Management, branding and artist services.', img: 'additional/artist-management-branding' },
    { key: 'event', title: 'Event Production', body: 'Events, live shows and conference production.', img: 'additional/event-production' },
    { key: 'pod', title: 'Podcast Production', body: 'Concept to final podcast production.', img: 'additional/podcast-production-2' }
  ]

  return (
    <div className="grid-wrapper">
      <style jsx>{`
        /* Mobile: single column stack */
        .grid-wrapper { 
          display: grid; 
          grid-template-columns: 1fr; 
          gap: 1.5rem; 
          grid-auto-rows: 400px; 
        }
        
        /* Tablet: 2x2 grid */
        @media (min-width: 640px) and (max-width: 768px) { 
          .grid-wrapper { 
            grid-template-columns: repeat(2, 1fr); 
            grid-auto-rows: 300px; 
          } 
        }
        
        /* Desktop: keep current 4-column layout */
        @media (min-width: 769px) { 
          .grid-wrapper { 
            grid-template-columns: repeat(4, 1fr); 
            grid-auto-rows: 280px; 
          } 
            .masonry-card p {
              font-size: 1.15rem;
            }
        }
        
        .masonry-card { 
          width: 100%; 
          border-radius: 0.5rem; 
          overflow: hidden; 
        }
        
        /* Mobile: full width cards */
        .tile { 
          grid-column: 1 / -1; 
        }
        
        /* Desktop: 2x2 tiles */
        @media (min-width: 769px) { 
          .tile { 
            grid-column: span 2; 
            grid-row: span 2; 
          } 
        }
      `}</style>

    {blocks.map((b) => {
  return (
  <article key={b.key} className="masonry-card tile bg-white/5 backdrop-blur-sm shadow-sm transition-all duration-200 group overflow-hidden rounded hover:shadow-lg hover:scale-[1.03] hover:-translate-y-1" role="article" aria-labelledby={`additional-${b.key}-title`}>

          {b.img ? (
            <div className="relative h-[65%] p-3 flex items-stretch">
              <div className="relative w-full h-full border border-white/10 rounded-md overflow-hidden">
                <OptimizedImage name={b.img} alt={b.title} loading="lazy" width={640} className="object-cover w-full h-full block" style={{ width: '100%', height: '100%' }} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/28 transition-colors" />
              </div>
            </div>
          ) : (
            <div className="h-[65%] bg-gradient-to-br from-black/6 to-black/12 p-6 flex items-center justify-center">
              <div className="w-full h-full border border-white/8 rounded-md" />
            </div>
          )}

          <div className="h-[35%] p-4 flex items-start bg-transparent overflow-hidden">
            <div className="w-full">
              <h3 id={`additional-${b.key}-title`} className="text-yellow-400 text-xl font-semibold mb-2 leading-tight">{b.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis'
              }}>{b.body}</p>
            </div>
          </div>
        </article>
      );
      })}
    </div>
  )
}
