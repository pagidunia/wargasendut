'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Stage = 'step1' | 'step2' | 'loading' | 'success';

const MAX_ATTEMPTS = 5;
const REDIRECT_SECONDS = 3;

export default function MasukPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('step1');

  // Step 1
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Step 2
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [trustDevice, setTrustDevice] = useState(true);
  const [logingIn, setLoggingIn] = useState(false);

  // Success
  const [redirectIn, setRedirectIn] = useState(REDIRECT_SECONDS);

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stage === 'step1') usernameInputRef.current?.focus();
    if (stage === 'step2') passwordInputRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (stage !== 'success') return;
    setRedirectIn(REDIRECT_SECONDS);
    const tick = setInterval(() => {
      setRedirectIn((n) => n - 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [stage]);

  useEffect(() => {
    if (stage === 'success' && redirectIn <= 0) {
      router.push('/');
    }
  }, [redirectIn, stage, router]);

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError('Username wajib diisi.');
      return;
    }

    setCheckingUsername(true);
    setUsernameError(null);

    try {
      const res = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUsernameError(data.error);
        setCheckingUsername(false);
        return;
      }

      setDisplayName(data.displayName);
      setPassword('');
      setPasswordError(null);
      setAttempts(0);
      setStage('step2');
    } catch (error) {
      setUsernameError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setCheckingUsername(false);
    }
  }

  function handleBackToStep1() {
    setStage('step1');
    setPassword('');
    setPasswordError(null);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setPasswordError('Kata sandi wajib diisi.');
      return;
    }

    setLoggingIn(true);
    setPasswordError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error);
        if (data.attempts !== undefined) {
          setAttempts(data.attempts);
        }
        setLoggingIn(false);
        return;
      }

      setStage('success');
    } catch (error) {
      setPasswordError('Terjadi kesalahan. Coba lagi.');
      setLoggingIn(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo">WS</div>
        <h1>Warga Sendut</h1>
        <p>RT 02 / RW 02</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          {stage === 'step1' && (
            <form onSubmit={handleStep1} noValidate>
              <div className="stepper">
                <div className="step-dot active">1</div>
                <div className="step-line"></div>
                <div className="step-dot">2</div>
              </div>

              <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>
                {usernameError ? 'Coba lagi ya' : 'Masuk ke dashboard'}
              </h2>
              <p style={{ marginTop: 0, color: 'var(--text-soft)' }}>
                {usernameError ? '' : 'Mulai dengan username-mu.'}
              </p>

              <div className="form-group">
                <label className="form-label">Username warga</label>
                <input
                  ref={usernameInputRef}
                  type="text"
                  className={`form-input ${usernameError ? 'error' : ''}`}
                  placeholder="misal: pak_rt_07"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase());
                    if (usernameError) setUsernameError(null);
                  }}
                  disabled={checkingUsername}
                />
                {usernameError ? (
                  <div className="form-error">⚠ {usernameError}</div>
                ) : (
                  <div className="form-helper">Didaftarkan oleh pengurus RT.</div>
                )}
              </div>

              {usernameError && (
                <div className="alert alert-info">
                  <span>💡</span>
                  <span>Baru pindah ke Sendut? Hubungi pengurus RT untuk membuat akun.</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={checkingUsername}
              >
                {checkingUsername ? (
                  <>
                    <span className="spinner"></span>
                    Mengecek...
                  </>
                ) : (
                  <>Lanjut →</>
                )}
              </button>

              {!usernameError && (
                <>
                  <div className="divider">atau</div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-soft)' }}>
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => alert('Hubungi pengurus RT 07 untuk membuat akun.')}
                    >
                      Minta akses
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {stage === 'step2' && (
            <form onSubmit={handleStep2} noValidate>
              <div className="stepper">
                <div className="step-dot done">✓</div>
                <div className="step-line done"></div>
                <div className="step-dot active">2</div>
              </div>

              <div className="pill">
                <div className="avatar"></div>
                <span style={{ fontWeight: 600 }}>{username}</span>
                <span style={{ marginLeft: 'auto' }}>
                  <button type="button" className="btn-ghost" onClick={handleBackToStep1}>
                    ganti
                  </button>
                </span>
              </div>

              <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>
                {passwordError ? 'Coba lagi ya' : `Hai, ${displayName} 👋`}
              </h2>
              <p style={{ marginTop: 0, color: 'var(--text-soft)' }}>
                {passwordError ? '' : 'Masukkan kata sandi untuk masuk.'}
              </p>

              <div className="form-group">
                <label className="form-label">Kata sandi</label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${passwordError ? 'error' : ''}`}
                    placeholder="ketik sandi…"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    disabled={logingIn}
                    style={{ paddingRight: 60 }}
                  />
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      fontSize: 12,
                    }}
                  >
                    {showPassword ? 'sembunyikan' : 'lihat'}
                  </button>
                </div>
                {passwordError && <div className="form-error">⚠ {passwordError}</div>}
              </div>

              {attempts >= 3 && (
                <div className="alert alert-error">
                  🔒 Setelah {MAX_ATTEMPTS}x salah, akun terkunci 15 menit.
                </div>
              )}

              <label className="check-row">
                <div
                  className={`checkbox ${trustDevice ? 'checked' : ''}`}
                  onClick={() => setTrustDevice(!trustDevice)}
                >
                  {trustDevice ? '✓' : ''}
                </div>
                <span onClick={() => setTrustDevice(!trustDevice)} style={{ flex: 1 }}>
                  Percaya perangkat ini
                </span>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => alert('Reset sandi lewat pengurus RT 07.')}
                  style={{ fontSize: 13 }}
                >
                  Lupa sandi?
                </button>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: '0.4' }}
                  onClick={handleBackToStep1}
                >
                  ←
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={logingIn}
                  style={{ flex: 1 }}
                >
                  {logingIn ? (
                    <>
                      <span className="spinner"></span>
                      Masuk...
                    </>
                  ) : (
                    <>Masuk →</>
                  )}
                </button>
              </div>
            </form>
          )}

          {stage === 'loading' && (
            <div style={{ textAlign: 'center' }}>
              <div className="stepper" style={{ justifyContent: 'center' }}>
                <div className="step-dot done">✓</div>
                <div className="step-line done"></div>
                <div className="step-dot done">✓</div>
              </div>

              <div style={{ padding: '24px 0' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: '0 auto 16px',
                    border: '3px solid var(--primary)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.9s linear infinite',
                  }}
                />
                <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Sebentar ya…</h2>
                <p style={{ marginTop: 0, color: 'var(--text-soft)' }}>Mencocokkan data warga.</p>
              </div>

              <div className="alert alert-info">
                <span>🔒</span>
                <span>Koneksi aman dan terenkripsi.</span>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div className="success-icon">✓</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>
                Selamat datang<br />
                {displayName}!
              </h2>
              <div className="alert alert-success" style={{ justifyContent: 'center' }}>
                Mengarahkan dalam {redirectIn} detik…
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => router.push('/')}
                style={{ marginTop: 8 }}
              >
                Langsung ke dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
