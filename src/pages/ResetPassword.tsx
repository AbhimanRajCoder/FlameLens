import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { updatePassword } from '../lib/auth';
import { useAuth } from '../lib/AuthContext';

export function ResetPassword() {
  const { session, loading, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    try {
      await updatePassword(password);
      await signOut();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <main id="main" className="auth-shell">
        <p className="auth-copy">Checking reset session…</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main id="main" className="auth-shell">
        <div className="auth-panel">
          <p className="section-label auth-label">Reset password</p>
          <h1 className="auth-heading">Reset link unavailable</h1>
          <p className="auth-copy">This password reset link is invalid or has expired. Request a new one to continue.</p>
          <div className="auth-actions">
            <Link to="/forgot-password" className="auth-link">
              Request a new reset link
            </Link>
            <Link to="/sign-in" className="auth-link">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main id="main" className="auth-shell">
        <div className="auth-panel">
          <p className="section-label auth-label">Reset password</p>
          <h1 className="auth-heading">Password updated</h1>
          <p className="auth-message auth-message-success" role="status">
            Your password has been updated. Sign in with your new password.
          </p>
          <div className="auth-actions">
            <Link to="/sign-in" className="auth-link">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="auth-shell">
      <div className="auth-panel">
        <p className="section-label auth-label">Reset password</p>
        <h1 className="auth-heading">Choose a new password</h1>
        <p className="auth-copy">Enter a new password for your FlameLens account.</p>
        {error ? (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        ) : null}
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span className="field-label">New password</span>
            <input
              className="field-input"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Confirm password</span>
            <input
              className="field-input"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>
            {pending ? 'Updating password…' : 'Update password'}
          </button>
        </form>
        <div className="auth-actions">
          <Link to="/sign-in" className="auth-link">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
