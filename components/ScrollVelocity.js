'use client';

export const ScrollVelocity = ({
  texts = [],
  velocity = 100,
  className = '',
  parallaxClassName,
  parallaxStyle,
}) => {
  return (
    <section>
      <style jsx>{`
        @keyframes scrollText {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scrollTextReverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .velocity-container {
          position: relative;
          overflow: hidden;
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .velocity-text {
          position: relative;
          width: 200%;
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: 8px;
          text-transform: uppercase;
          white-space: nowrap;
          animation: scrollText 40s linear infinite;
          pointer-events: none;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .velocity-text.reverse {
          animation: scrollTextReverse 40s linear infinite;
        }

        .velocity-text:hover {
          animation-play-state: paused;
        }

        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .velocity-text {
            animation: none;
            white-space: normal;
            width: 100%;
            word-wrap: break-word;
          }
        }

        @media (max-width: 768px) {
          .velocity-text {
            font-size: 1.5rem;
            letter-spacing: 4px;
          }
        }
      `}</style>

      {texts.map((text, index) => {
        const isReverse = velocity < 0;
        return (
          <div
            key={index}
            className={`${parallaxClassName} velocity-container`}
            style={parallaxStyle}
          >
            <div
              className={`velocity-text ${className} ${isReverse ? '' : 'reverse'}`}
            >
              {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} • {text} •
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default ScrollVelocity;
