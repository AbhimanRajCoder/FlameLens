import { type CSSProperties, type ReactNode } from 'react';
import { useInView } from '../lib/useInView';

export function Reveal({
  children,
  delay = 0,
  className = '',
  id,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'figure';
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '0px 0px -8% 0px', once: true });
  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
