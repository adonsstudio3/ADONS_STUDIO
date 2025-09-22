"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../../hooks/use-outside-click";

export default function ProductionTab(){
  const cards = [
    {
      key: 'pre',
      title: 'Pre-Production',
      description: 'This phase lays the groundwork for the entire project.',
      src: '/Images/Pre production.png',
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
      src: '/Images/Production.png',
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
      src: '/Images/Post production.png',
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

  const [active, setActive] = useState(null);
  const id = useId();
  const ref = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    // Removed body scroll lock to allow background scrolling when modal is open

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10" />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active !== "boolean" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]" id={`production-modal-${active.key}`}> 
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.2,
                },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex absolute top-2 right-2 md:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}>
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              transition={{ 
                duration: 0.15,
                ease: [0.25, 0.1, 0.25, 1],
                layout: { 
                  duration: 0.15,
                  ease: [0.25, 0.1, 0.25, 1]
                }
              }}
              className="w-full max-w-[600px] h-auto max-h-[95vh] flex flex-col bg-white/10 backdrop-blur-[10px] sm:rounded-3xl overflow-hidden overflow-y-auto shadow-2xl border border-white/20">
              <motion.div 
                layoutId={`image-${active.title}-${id}`}
                transition={{ 
                  duration: 0.15,
                  ease: [0.25, 0.1, 0.25, 1]
                }}>
                <img
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-60 lg:h-60 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top" />
              </motion.div>

              <div className="flex-1 overflow-y-auto">
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      transition={{ 
                        duration: 0.15,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                      className="font-medium text-neutral-200 text-base">
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      transition={{ 
                        duration: 0.15,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                      className="text-neutral-400 text-base">
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.1,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    onClick={() => setActive(null)}
                    className="px-4 py-3 text-sm rounded-full font-bold bg-yellow-500 text-black">
                    Close
                  </motion.button>
                </div>
                <div className="pt-4 relative px-4 pb-6">
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ 
                      duration: 0.15,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: 0.02
                    }}
                    className="text-neutral-400 text-xs md:text-sm lg:text-base flex flex-col items-start gap-4">
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul
        className="max-w-full mx-auto w-full grid grid-cols-1 md:grid-cols-3 items-start gap-4">
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={card.title}
            onClick={() => setActive(card)}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ 
              scale: 1.02, 
              y: -6,
              transition: {
                duration: 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: {
                duration: 0.05,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            transition={{ 
              duration: 0.15,
              ease: [0.25, 0.1, 0.25, 1],
              delay: index * 0.02,
              layout: { 
                duration: 0.15,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            className="p-8 min-h-[520px] flex flex-col rounded-xl cursor-pointer bg-white/5 backdrop-blur-[8px] shadow-lg hover:shadow-2xl transition-all group overflow-hidden">
            <div className="flex gap-4 flex-col w-full">
              <motion.div 
                layoutId={`image-${card.title}-${id}`}
                transition={{ 
                  duration: 0.15,
                  ease: [0.25, 0.1, 0.25, 1]
                }}>
                <img
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title ? card.title + ' service image' : 'Service image'}
                  className="h-60 w-full rounded-lg object-cover object-top" />
              </motion.div>
              <div className="flex justify-center items-center flex-col flex-1 w-full">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  transition={{ 
                    duration: 0.15,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="font-medium text-yellow-400 text-center md:text-left text-2xl">
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  transition={{ 
                    duration: 0.15,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="text-neutral-300 text-center md:text-left text-lg mt-2">
                  {card.description}
                </motion.p>
                {/* Show More button for all cards */}
                <button
                  type="button"
                  aria-expanded={active === card}
                  aria-controls={`production-modal-${card.key}`}
                  aria-label={`Show more about ${card.title}`}
                  className="mt-auto px-6 py-2 rounded-2xl bg-white/20 backdrop-blur-[6px] border border-white/30 text-yellow-400 font-semibold shadow-lg hover:bg-white/30 transition-all text-base focus-visible:outline-yellow-400 focus-visible:outline-2 focus-visible:outline"
                  style={{ marginTop: '32px', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
                  onClick={() => setActive(card)}
                >
                  Show More
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
        rotate: -90,
      }}
      animate={{
        opacity: 1,
        rotate: 0,
      }}
      exit={{
        opacity: 0,
        rotate: 90,
        transition: {
          duration: 0.2,
        },
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
