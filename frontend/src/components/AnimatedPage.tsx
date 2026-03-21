import { ReactNode } from 'react';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Global HOC for smooth page transitions.
 * Uses lightweight CSS animations for maximum production build stability and performance.
 */
export default function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <div className={`w-full animate-page-entry ${className}`}>
      {children}
    </div>
  );
}
