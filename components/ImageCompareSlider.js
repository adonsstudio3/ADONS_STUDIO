
import PropTypes from 'prop-types';

import React, { useRef, useState } from 'react';
export default function ImageCompareSlider({ leftImg, rightImg, alt, altBefore, altAfter, height = 320 }) {
  // Derive alt text if not provided
  const beforeAlt = altBefore || (alt ? `${alt} before` : 'Before image');
  const afterAlt = altAfter || (alt ? `${alt} after` : 'After image');

  ImageCompareSlider.propTypes = {
    leftImg: PropTypes.string.isRequired,
    rightImg: PropTypes.string.isRequired,
    alt: PropTypes.string,
    altBefore: PropTypes.string,
    altAfter: PropTypes.string,
    height: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  };
  const [value, setValue] = useState(50); // percent
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const dragLeft = `${value}%`;

  return (
    <div
      ref={containerRef}
      className="ics-container"
      style={{ height: typeof height === 'string' ? height : `${height}px` }}
    >
  <img src={rightImg} alt={afterAlt} className="ics-img ics-img-after" draggable={false} />
  <img src={leftImg} alt={beforeAlt} className="ics-img ics-img-before" draggable={false} style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }} />
      <input
        ref={sliderRef}
        className="ics-slider"
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        aria-label="Image comparison slider"
      />
      {/* Combined vertical line and drag button */}
      <div
        className="ics-drag-combo"
        style={{ left: dragLeft, transform: 'translate(-50%, -50%)' }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="ics-slider-line" />
        <div className="ics-drag">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ics-drag-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </div>
      </div>
      <style jsx>{`
        .ics-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          user-select: none;
        }
        .ics-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .ics-img-before {
          z-index: 2;
        }
        .ics-img-after {
          z-index: 1;
        }
        .ics-slider {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          z-index: 3;
          cursor: grab;
        }
        .ics-slider:active {
          cursor: grabbing;
        }
           .ics-drag {
             position: absolute;
             top: 50%;
             z-index: 4;
             height: 40px;
             width: 40px;
             border-radius: 50%;
             background: #000;
             border: 2px solid #666;
             display: flex;
             align-items: center;
             justify-content: center;
             color: #fff;
             box-shadow: 0 2px 8px 0 rgba(0,0,0,0.18);
           }
        .ics-drag-icon {
          width: 24px;
          height: 24px;
        }
        .ics-drag-combo {
          position: absolute;
          top: 50%;
          z-index: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }
        .ics-slider-line {
          width: 3px;
          height: 100vh;
          min-height: 100%;
          background: #222;
          opacity: 0.7;
          border-radius: 2px;
          margin-bottom: -20px;
        }
      `}</style>
    </div>
  );
}
