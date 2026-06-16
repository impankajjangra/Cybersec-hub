import { useEffect, useRef } from 'react';

export default function useScrollReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current || document;
    const selectors = '.fade-up, .zigzag-left, .zigzag-right, .zigzag-up';
    const elements = container.querySelectorAll(selectors);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger delay based on position
            const delay = parseFloat(entry.target.style.transitionDelay || '0');
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay * 1000);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return containerRef;
}