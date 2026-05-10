import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './Portfolio.css';
import SmoothScroll from './components/SmoothScroll';

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Scale down from 1 to 0.75
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  // Round corners from 0 to 40px
  const borderRadius = useTransform(scrollYProgress, [0, 1], ["0px", "40px"]);
  // Slight vertical lift
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  return (
    <div ref={containerRef} className="hero-wrapper">
      <motion.div 
        style={{ scale, borderRadius, y }}
        className="hero-content"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-title"
        >
          MONOLITH
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="hero-subtitle"
        >
          Senior Product Designer shaping the digital edge through brutalist aesthetics and fluid interactions.
        </motion.p>
      </motion.div>
    </div>
  );
};

const CurvedSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Animate the path 'd' attribute
  // Q (quadratic curve control point) moves from -100 to 0
  const pathY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  
  return (
    <div ref={sectionRef} className="curved-container">
      <svg className="curve-svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <motion.path 
          d={useTransform(pathY, y => `M0 100 Q 720 ${100 - y} 1440 100 V 100 H 0 Z`)}
          fill="white"
        />
      </svg>
      
      <div className="content-section">
        <h2>Selected Works</h2>
        <div className="project-grid">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 0.98 }}
              className="project-card"
            >
              <div style={{ padding: '20px' }}>
                <h3>Project 0{i}</h3>
                <p>Digital Experience & Interaction</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  return (
    <SmoothScroll>
      <div className="portfolio-container">
        {/* Background Revealed during Hero shrink */}
        <div className="revealed-bg">
          <div className="bg-pattern" />
          <h2 style={{ color: '#333', fontSize: '10rem', opacity: 0.2 }}>INSIGHT</h2>
        </div>

        <Hero />
        
        <div className="section-spacer" />
        
        <CurvedSection />
        
        <footer style={{ padding: '100px', textAlign: 'center', background: 'white' }}>
          <p>© 2026 Shannon Carabiner. Built with Framer Motion & Lenis.</p>
        </footer>
      </div>
    </SmoothScroll>
  );
};

export default Portfolio;
