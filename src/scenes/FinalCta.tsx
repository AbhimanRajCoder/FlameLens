import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';

export function FinalCta() {
  return (
    <section className="chapter final-chapter" id="get-started" aria-labelledby="final-heading">
      <div className="final-orbit" aria-hidden="true">
        <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="600" cy="420" rx="560" ry="180" fill="none" stroke="var(--hairline)" />
          <ellipse cx="600" cy="460" rx="700" ry="230" fill="none" stroke="var(--hairline)" strokeOpacity="0.5" />
          <circle cx="180" cy="330" r="3" fill="var(--ice-400)" fillOpacity="0.7" />
          <circle cx="980" cy="290" r="2.4" fill="var(--amber-400)" fillOpacity="0.6" />
        </svg>
      </div>
      <div className="container final-inner">
        <Reveal>
          <p className="section-label">Scene 09 · Open the observatory</p>
          <h2 id="final-heading" className="final-heading">
            Turn combustion research into{' '}
            <em>mission-ready understanding.</em>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="lede final-lede">
            Discover the investigations, compare the conditions, and see exactly what the evidence supports — before
            you rely on it.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="hero-ctas final-ctas">
            <a href="#investigations" className="btn btn-primary">
              Explore NASA investigations
            </a>
            <Link to="/sign-in" className="btn btn-secondary">
              Sign in to FlameLens
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}