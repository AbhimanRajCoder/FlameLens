import { useMemo } from 'react';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle: boolean;
  cyan: boolean;
  delay: number;
  duration: number;
};

function makeStars(count: number, seed: number): Star[] {
  let state = seed;
  const rand = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };

  return Array.from({ length: count }, (_, id) => {
    const bright = rand() > 0.88;
    return {
      id,
      x: rand() * 100,
      y: rand() * 100,
      size: bright ? 1.5 + rand() * 1.15 : 0.7 + rand() * 0.7,
      opacity: bright ? 0.5 + rand() * 0.4 : 0.16 + rand() * 0.32,
      twinkle: rand() > 0.8,
      cyan: rand() > 0.78,
      delay: rand() * -14,
      duration: 6 + rand() * 8,
    };
  });
}

function StarLayer({ stars, className }: { stars: Star[]; className: string }) {
  return (
    <div className={className}>
      {stars.map((star) => (
        <span
          key={star.id}
          className={`ov-star${star.twinkle ? ' is-twinkle' : ''}${star.cyan ? ' is-cyan' : ''}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function OverviewStarfield() {
  const far = useMemo(() => makeStars(72, 17), []);
  const near = useMemo(() => makeStars(26, 83), []);

  return (
    <div className="ov-sky" aria-hidden="true">
      <div className="ov-sky-atmosphere" />
      <StarLayer stars={far} className="ov-sky-drift ov-sky-far" />
      <StarLayer stars={near} className="ov-sky-drift ov-sky-near" />
      <div className="ov-sky-vignette" />
    </div>
  );
}
