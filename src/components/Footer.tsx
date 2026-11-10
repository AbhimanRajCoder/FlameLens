import { Link } from 'react-router-dom';
import { OrbitalMark } from './OrbitalMark';
import { DISCLAIMER } from '../data/missions';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand" aria-label="FlameLens home">
              <OrbitalMark size={26} />
              <span className="brand-word">
                FLAME<span className="brand-lens">LENS</span>
              </span>
            </Link>
            <p className="footer-descriptor">NASA Microgravity Combustion Intelligence</p>
            <p className="footer-disclaimer">{DISCLAIMER}</p>
          </div>

          <nav className="footer-col" aria-label="Explore">
            <h3 className="footer-heading mono">Explore</h3>
            <a href="/#investigations">Investigation constellation</a>
            <a href="/#playground">Gravity playground</a>
            <a href="/#model-lab">Research tools</a>
            <a href="/#about">Mission contexts</a>
            <Link to="/sign-in">Sign in</Link>
          </nav>

          <nav className="footer-col" aria-label="NASA sources">
            <h3 className="footer-heading mono">NASA sources</h3>
            <a href="https://psi.nasa.gov/physci/repo" target="_blank" rel="noopener noreferrer">
              NASA PSI repository
            </a>
            <a href="https://ntrs.nasa.gov/citations/20250010653" target="_blank" rel="noopener noreferrer">
              LUCI · NASA NTRS
            </a>
            <a href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noopener noreferrer">
              NASA 3D resources
            </a>
            <a href="https://registry.opendata.aws/nasa-psi/" target="_blank" rel="noopener noreferrer">
              PSI open-data registry
            </a>
          </nav>

          <div className="footer-col">
            <h3 className="footer-heading mono">Provenance</h3>
            <p className="footer-note">
              Supplied NASA PSI tables are preserved unchanged. 3D models: NASA Science 3D Resources, used under NASA
              media/3D usage guidelines; attribution and checksums in the asset manifest.
            </p>
            <p className="footer-note">
              Sign-in guide astronaut:{' '}
              <a
                href="https://sketchfab.com/3d-models/animated-astronaut-character-in-space-suit-loop-8fe5c8d3365e4d87bb7bc253d53a64e1"
                target="_blank"
                rel="noopener noreferrer"
              >
                &ldquo;Animated Astronaut Character in Space Suit Loop&rdquo;
              </a>{' '}
              by{' '}
              <a href="https://sketchfab.com/LasquetiSpice" target="_blank" rel="noopener noreferrer">
                LasquetiSpice
              </a>
              , used under CC BY 4.0.
            </p>
            <p className="footer-note">
              Privacy policy and contact channels will be published with the dashboard release.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mono">FlameLens · independent research tool · not affiliated with or endorsed by NASA</p>
          <p className="mono">Sign-in milestone · dashboard in development</p>
        </div>
      </div>
    </footer>
  );
}