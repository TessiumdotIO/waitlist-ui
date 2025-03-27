
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxEffectProps {
  children: React.ReactNode;
  className?: string;
  baseVelocity?: number;
  mouseEffect?: boolean;
}

const ParallaxEffect: React.FC<ParallaxEffectProps> = ({
  children,
  className,
  baseVelocity = 0.2,
  mouseEffect = true,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mouseEffect) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * baseVelocity;
      const y = (e.clientY - rect.top - rect.height / 2) * baseVelocity;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [baseVelocity, mouseEffect]);

  return (
    <div 
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        style={{
          transform: mouseEffect 
            ? `translate(${-mousePosition.x / 30}px, ${-mousePosition.y / 30}px)` 
            : 'none',
          transition: 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ParallaxEffect;
