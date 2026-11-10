import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function Dashboard() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <main id="main" className="auth-shell dashboard-shell">
      <div className="auth-panel dashboard-panel">
        <p className="section-label auth-label">Protected area</p>
        <h1 className="auth-heading">Mission console</h1>
        <p className="auth-copy">
          Signed in as <strong>{session?.user.email ?? session?.user.id ?? 'Explorer'}</strong>. Dashboard tooling is still
          being prepared for the next milestone.
        </p>
        <div className="auth-actions">
          <button type="button" className="btn btn-secondary" onClick={onSignOut}>
            Sign out
          </button>
          <a className="btn btn-primary" href="/">
            Return to observatory
          </a>
        </div>
        <p className="auth-footnote mono">FlameLens · authentication session active</p>
      </div>
    </main>
  );
}
