import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        setError('Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        return;
      }
      const code = params.get('code');
      const tokenHash = params.get('token_hash');
      const type = params.get('type');
      const next = params.get('next') || '/dashboard';
      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (verifyError) throw verifyError;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error('Authentication link is invalid or has expired.');
        }
        if (!cancelled) navigate(next, { replace: true });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Authentication link failed.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, params]);

  return (
    <main id="main" className="auth-shell">
      <div className="auth-panel">
        <p className="section-label auth-label">Authentication</p>
        <h1 className="auth-heading">Completing sign-in</h1>
        {error ? (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        ) : (
          <p className="auth-copy">Verifying your secure link…</p>
        )}
        <div className="auth-actions">
          <Link to="/sign-in" className="auth-link">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
