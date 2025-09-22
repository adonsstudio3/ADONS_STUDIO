import ImageCompareSlider from '../ImageCompareSlider';

export default function VisualsTab() {
  // Keyed before/after images for cards that support comparison
  const compareImages = {
    cg: { before: '/Images/visuals/3D-CGI-before.png', after: '/Images/visuals/3D-CGI-after.png' },
    rot: { before: '/Images/visuals/Rotoscope-before.png', after: '/Images/visuals/Rotoscope-after.png' },
    paint: { before: '/Images/visuals/Cleanup-before.jpg', after: '/Images/visuals/Cleanup-after.jpg' },
    anim: { before: '/Images/visuals/3D_2D-Animation-before.png', after: '/Images/visuals/3D_2D-Animation-after.png' },
  };

  // Cards now explicitly declare the mediaType to avoid brittle index-based logic
  const cards = [
    { key: 'cg', title: 'CGI / 3D', body: `We create stunning CGI, blending imagination with technology to deliver realistic visual effects, dynamic animations, and breathtaking digital environments for film, music videos, games assets, and commercials.`, mediaType: 'compare' },
    { key: 'rot', title: 'Rotoscope & Keying', body: `Rotoscoping and keying isolate subjects from backgrounds, enabling seamless compositing and integration of live-action footage with digital elements.`, mediaType: 'compare' },
    { key: 'paint', title: 'Paint & Cleanup', body: `Paint and cleanup remove unwanted objects, fix imperfections, and restore footage for seamless, polished visual effects and final compositions.`, mediaType: 'compare' },
    { key: 'anim', title: '3D & 2D Animation', body: `Producing animated content for ads, explainer videos, and films.`, mediaType: 'compare' },
    { key: 'edit', title: 'Video Editing', body: `Cutting, color grading, and post-production for videos and films.`, mediaType: 'image', img: '' },
    { key: 'motion', title: 'Motion Graphics', body: `Designing animated graphics for branding, social media, and videos.`, mediaType: 'video', videoSrc: '/Images/visuals/Cookies_motion_graphics.mp4' }
  ];

  return (
    <div className="visuals-horizontal-list">
      <style jsx>{`
        .visuals-horizontal-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .visuals-horizontal-card {
          display: flex;
          flex-direction: row;
          min-height: 380px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.18);
          transition: box-shadow 0.2s, transform 0.15s;
          cursor: pointer;
        }
        .visuals-horizontal-card:hover {
          box-shadow: 0 4px 32px 0 rgba(245,200,66,0.12);
          transform: scale(1.02);
        }
        .visuals-horizontal-card-image {
          flex: 1.4 1 0;
          min-width: 0;
          background: #111;
          display: flex;
          align-items: stretch;
        }
        .visuals-horizontal-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .visuals-horizontal-card-content {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3.2rem 2.5rem;
        }
        .visuals-horizontal-card-title {
          color: #F5C842;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .visuals-horizontal-card-body {
          color: #e5e5e5;
          font-size: 1.05rem;
          line-height: 1.6;
        }
        @media (max-width: 900px) {
          .visuals-horizontal-card-content { padding: 1.5rem 1rem; }
          .visuals-horizontal-card-title { font-size: 1.1rem; }
        }
        @media (max-width: 700px) {
          .visuals-horizontal-card { flex-direction: column; min-height: 0; }
          .visuals-horizontal-card-image, .visuals-horizontal-card-content { flex: unset; min-width: unset; }
          .visuals-horizontal-card-image { height: 220px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        }
      `}</style>
      {cards.map((c, idx) => {
        const isReversed = idx % 2 !== 0;
        return (
          <div key={c.key} className="visuals-horizontal-card" style={{ flexDirection: isReversed ? 'row-reverse' : 'row' }}>
            <div className="visuals-horizontal-card-image">
              {c.mediaType === 'compare' ? (
                <ImageCompareSlider
                  leftImg={compareImages[c.key]?.before}
                  rightImg={compareImages[c.key]?.after}
                  alt={c.title}
                  height={"100%"}
                />
              ) : c.mediaType === 'video' ? (
                <video
                  src={c.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
              ) : c.img ? (
                <img src={c.img} alt={c.title} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-black/6 to-black/12 flex items-center justify-center">
                  <div className="w-full h-full border border-white/8 rounded-md" />
                </div>
              )}
            </div>
            <div className="visuals-horizontal-card-content">
              <div>
                <div className="visuals-horizontal-card-title">{c.title}</div>
                <div className="visuals-horizontal-card-body">{c.body}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}
