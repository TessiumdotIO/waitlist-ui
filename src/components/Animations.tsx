
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
  once?: boolean;
};

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 600,
  className = '',
  direction = 'up',
  threshold = 0.1,
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  const getTransformValue = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translateY(20px)';
        case 'down':
          return 'translateY(-20px)';
        case 'left':
          return 'translateX(20px)';
        case 'right':
          return 'translateX(-20px)';
        default:
          return 'none';
      }
    }
    return 'none';
  };

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransformValue(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export const FloatingElement: React.FC<{ children: React.ReactNode; className?: string; amplitude?: number; duration?: number }> = ({
  children,
  className,
  amplitude = 10,
  duration = 6,
}) => {
  return (
    <div
      className={cn('transition-transform', className)}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
      }}
    >
      {children}
    </div>
  );
};

export const ShimmerButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-lg bg-primary px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const ParallaxSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  speed?: number;
}> = ({ children, className, speed = 0.5 }) => {
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const { top } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      if (top < windowHeight && top > -windowHeight) {
        const newOffset = (top - windowHeight) * speed;
        setOffset(newOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div 
      ref={sectionRef}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
