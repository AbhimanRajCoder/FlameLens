import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OrbitalMark } from '../components/OrbitalMark';
import { SignInAstronaut } from '../components/SignInAstronaut';
import { Starfield } from '../components/Starfield';
import { useAuth } from '../lib/AuthContext';
import { useReducedMotion } from '../lib/useReducedMotion';

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function modeFromPath(pathname: string): AuthMode {
  if (pathname === '/sign-up') return 'sign-up';
  if (pathname === '/forgot-password') return 'forgot-password';
  return 'sign-in';
}

export function AuthShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = modeFromPath(location.pathname);
  const reduced = useReducedMotion();
  const { configured, signIn, signUp, requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const next = new URLSearchParams(location.search).get('next') || '/dashboard';

  const heading =
    mode === 'sign-up' ? 'Join the observatory' : mode === 'forgot-password' ? 'Reset your access' : 'Welcome back to FlameLens';
  const copy =
    mode === 'sign-up'
      ? 'Create an Explorer account to prepare mission workspaces, investigation notes and future dashboard tools.'
      : mode === 'forgot-password'
        ? 'Enter your account email and we will send a reset link.'
        : 'Sign in to continue to protected FlameLens mission tools.';
  const submitLabel = pending
    ? mode === 'sign-up'
      ? 'Creating account…'
      : mode === 'forgot-password'
        ? 'Sending reset…'
        : 'Signing in…'
    : mode === 'sign-up'
      ? 'Create account'
      : mode === 'forgot-password'
        ? 'Send reset link'
        : 'Sign in';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!configured) {
      setError('Authentication is not configured in this build. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase Auth.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (mode !== 'forgot-password') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (mode === 'sign-up' && password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setPending(true);
    try {
      if (mode === 'forgot-password') {
        await requestPasswordReset(email.trim());
        setNotice('If an account exists for that email, a password reset message has been sent.');
      } else if (mode === 'sign-up') {
        const result = await signUp(email.trim(), password);
        if (result.needsEmailConfirmation) {
          setNotice('Account created. Check your email to confirm your address before signing in.');
        } else {
          navigate(next, { replace: true });
        }
      } else {
        await signIn(email.trim(), password);
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <main id="main" className={`auth-shell auth-scene${reduced ? ' auth-static' : ''}`}>
      <Starfield />
      <div className="auth-orbits" aria-hidden="true">
        <svg viewBox="0 0 800 800">
          <ellipse cx="400" cy="400" rx="330" ry="130" fill="none" stroke="var(--hairline)" transform="rotate(-18 400 400)" />
          <ellipse cx="400" cy="400" rx="260" ry="260" fill="none" stroke="var(--hairline)" strokeOpacity="0.5" strokeDasharray="2 8" />
          <circle cx="640" cy="286" r="3" fill="var(--ice-400)" fillOpacity="0.7" />
        </svg>
        <span className="auth-orbit-sweep" />
      </div>

      <div className="auth-layout">
        <section className="auth-astro" aria-label="FlameLens sign-in guide">
          <SignInAstronaut reduced={reduced} />
          <div className="auth-dialogue" aria-live="polite">
            <span className="auth-dialogue-avatar" aria-hidden="true">
              <OrbitalMark size={16} />
            </span>
            <p className="auth-greeting">Hii, Explorer!</p>
          </div>
        </section>

        <div className="auth-panel auth-panel-enter">
          <OrbitalMark size={44} />
          <p className="section-label auth-label">
            {mode === 'sign-up' ? 'Create account' : mode === 'forgot-password' ? 'Account recovery' : 'Sign in'}
          </p>
          <h1 className="auth-heading">{heading}</h1>
          <p className="auth-copy">{copy}</p>

          {notice ? (
            <p className="auth-message auth-message-success" role="status">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="auth-message auth-message-error" role="alert">
              {error}
            </p>
          ) : null}
          {!configured ? (
            <p className="auth-message auth-message-warn">
              Authentication is not configured in this build. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable
              Supabase Auth.
            </p>
          ) : null}

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <label className="field">
              <span className="field-label">Email</span>
              <input
                className="field-input"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {mode !== 'forgot-password' ? (
              <label className="field">
                <span className="field-label">Password</span>
                <span className="field-control">
                  <input
                    className="field-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>
            ) : null}

            {mode === 'sign-up' ? (
              <label className="field">
                <span className="field-label">Confirm password</span>
                <input
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            ) : null}

            <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>
              {submitLabel}
            </button>
          </form>

          <div className="auth-actions">
            {mode === 'sign-in' ? (
              <>
                <Link to="/sign-up" className="auth-link">
                  New here? Create an account
                </Link>
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </>
            ) : null}
            {mode === 'sign-up' ? (
              <Link to="/sign-in" className="auth-link">
                Already have an account? Sign in
              </Link>
            ) : null}
            {mode === 'forgot-password' ? (
              <Link to="/sign-in" className="auth-link">
                Back to sign in
              </Link>
            ) : null}
          </div>

          <p className="auth-footnote mono">
            FlameLens · NASA Microgravity Combustion Intelligence · research decision support only
          </p>
        </div>
      </div>
    </main>
  );
}
