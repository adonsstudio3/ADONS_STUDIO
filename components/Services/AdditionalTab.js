export default function AdditionalTab(){
  const blocks = [
    { key: 'ads', title: 'Corporate & Commercial Ads', body: 'High-quality ads and brand films.', img: '/Images/Firefly_Gemini Flash_Corporate and commercial ads.png' },
    { key: 'artist', title: 'Artist Management & Branding', body: 'Management, branding and artist services.', img: '/Images/Firefly_Gemini Flash_make a logo image for Artist Management & Branding 191598.png' },
    { key: 'event', title: 'Event Production', body: 'Events, live shows and conference production.', img: '/Images/Event production.webp' },
    { key: 'pod', title: 'Podcast Production', body: 'Concept to final podcast production.', img: '/Images/Podcast production_additional.jpeg' }
  ]

  return (
    <div className="grid-wrapper">
      <style jsx>{`
        /* Uniform large 2x2 tiles */
        .grid-wrapper { display: grid; grid-template-columns: 1fr; gap: 1rem; grid-auto-rows: 260px; }
        @media (min-width: 640px) { .grid-wrapper { grid-template-columns: repeat(4, 1fr); grid-auto-rows: 220px; } }
        @media (min-width: 1024px) { .grid-wrapper { grid-template-columns: repeat(4, 1fr); grid-auto-rows: 280px; } }
        .masonry-card { width: 100%; border-radius: 0.5rem; overflow: hidden; }
        /* force every tile to be 2x2 on larger screens */
        .tile { grid-column: 1 / -1; }
        @media (min-width: 640px) { .tile { grid-column: span 2; grid-row: span 2; } }
      `}</style>

    {blocks.map((b) => {
  const safeSrc = typeof b.img === 'string' ? encodeURI(b.img).replace(/&/g, '%26') : b.img
  return (
  <article key={b.key} className="masonry-card tile bg-white/5 backdrop-blur-sm shadow-sm transition-all duration-200 group overflow-hidden rounded hover:shadow-lg hover:scale-[1.03] hover:-translate-y-1" role="article" aria-labelledby={`additional-${b.key}-title`}>

          {b.img ? (
            <div className="relative h-[75%] p-3 flex items-stretch">
              <div className="relative w-full h-full border border-white/10 rounded-md overflow-hidden">
                <img src={safeSrc} alt={b.title} loading="lazy" width="640" height="420" className="object-cover w-full h-full block" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/28 transition-colors" />
              </div>
            </div>
          ) : (
            <div className="h-[75%] bg-gradient-to-br from-black/6 to-black/12 p-6 flex items-center justify-center">
              <div className="w-full h-full border border-white/8 rounded-md" />
            </div>
          )}

          <div className="h-[25%] p-6 flex items-start bg-transparent">
            <div>
              <h3 id={`additional-${b.key}-title`} className="text-yellow-400 text-2xl font-semibold">{b.title}</h3>
              <p className="text-gray-300 text-base leading-relaxed mt-2">{b.body}</p>
            </div>
          </div>
        </article>
      );
      })}
    </div>
  )
}
