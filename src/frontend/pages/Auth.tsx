
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/UI';
import { Logo } from '../components/Logo';
import { Mail, Lock, ArrowRight, Github, Linkedin, CheckCircle, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const { login, t, language, setSession } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('CLIENT');

  const [email, setEmail] = useState('client1@example.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const roleRef = React.useRef(role);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    // Load Google Script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  useEffect(() => {
    if (googleLoaded && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: "640269627410-dur5hrb3s95v4v7frnmvapc4fkgaronq.apps.googleusercontent.com",
        callback: handleGoogleResponse
      });
    }
  }, [googleLoaded]);

  // Handle LinkedIn Callback
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // now like 'linkedin_auth:CLIENT'

    if (code && state?.startsWith('linkedin_auth')) {
      const [, roleParam] = state.split(':');
      handleLinkedinCallback(code, roleParam);
    }
  }, [location.search]);

  const handleGoogleResponse = async (response: any) => {
    console.log("Google Response", response);
    const currentRole = roleRef.current;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: response.credential,
          role: currentRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('finume_user', JSON.stringify(data.user));
        localStorage.setItem('finume_token', data.token);
        setSession(data.user, data.token);
        const targetPath = data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'EXPERT' ? '/expert' : '/client';
        navigate(targetPath);
      } else {
        alert(t(data.error || 'Login failed'));
      }
    } catch (error: any) {
      console.error(error);
      alert('Google Login Error: ' + (error.message || JSON.stringify(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedinCallback = async (code: string, roleParam?: string) => {
    setIsLoading(true);
    try {
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      const res = await fetch('/api/auth/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirectUri: "https://finume-v2.vercel.app/login", // Must match the one sent in auth request
          role: roleParam || 'CLIENT'
        })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('finume_user', JSON.stringify(data.user));
        localStorage.setItem('finume_token', data.token);
        setSession(data.user, data.token);
        const targetPath = data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'EXPERT' ? '/expert' : '/client';
        navigate(targetPath);
      } else {
        alert(data.error || 'LinkedIn Login Failed');
      }
    } catch (error: any) {
      console.error(error);
      alert('LinkedIn Login Error: ' + (error.message || JSON.stringify(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogle = () => {
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt();
    } else {
      console.error("Google script not loaded");
      alert("Google Sign-In is not ready yet. Please check your internet connection or ad-blockers on this device.");
    }
  };

  const triggerLinkedin = () => {
    const clientId = '77nmudsqcg5t0i';
    // Use stable production URL to match LinkedIn Whitelist
    const stableOrigin = "https://finume-v2.vercel.app";
    const redirectUri = encodeURIComponent(stableOrigin + '/login');
    const scope = encodeURIComponent('openid profile email');
    // Encode role in state
    const state = `linkedin_auth:${role}`;
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
  };

  // Forgot Password Logic
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [isMock, setIsMock] = useState(false);
  const [mockResetLink, setMockResetLink] = useState<string | null>(null);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetStatus('IDLE');
    setIsMock(false);
    setMockResetLink(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        setResetStatus('SUCCESS');
        if (data.mock) {
          setIsMock(true);
          setMockResetLink(data.resetLink);
        }
      } else {
        setResetStatus('ERROR');
        alert(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error(error);
      setResetStatus('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Pass 'undefined' for newUser (3rd arg) to reach password (4th arg)
      const user = await login(email, role, undefined, password);

      if (user) {
        // Navigation Logic
        const searchParams = new URLSearchParams(location.search);
        const redirect = searchParams.get('redirect');

        if (user.role === 'CLIENT') {
          if (redirect) {
            const action = searchParams.get('action');
            const serviceId = searchParams.get('serviceId');
            const planId = searchParams.get('planId');
            const billing = searchParams.get('billing');
            navigate(redirect, { state: { action, serviceId, planId, billing } });
          } else {
            navigate('/client');
          }
        } else if (user.role === 'EXPERT') {
          navigate('/expert');
        } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          navigate('/admin');
        }
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* Left Column - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F172A] text-white overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-blob animation-delay-4000"></div>
        </div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 flex flex-col justify-between p-16 h-full">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl group-hover:bg-white/20 transition-colors border border-white/10">
                <Logo size={32} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">FINUME</span>
            </Link>
          </div>

          <div className="space-y-8 relative">
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Financials</span>
            </h2>
            <p className="text-lg text-blue-100/80 max-w-md leading-relaxed">
              The all-in-one platform for companies and certified experts to manage compliance, tax, and growth with zero friction.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="text-green-400" size={18} />
                  </div>
                  <span className="text-sm font-medium text-blue-100">Trusted</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-xs text-blue-200/60 uppercase tracking-wider font-semibold">Companies</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <ShieldCheck className="text-purple-400" size={18} />
                  </div>
                  <span className="text-sm font-medium text-blue-100">Secure</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-xs text-blue-200/60 uppercase tracking-wider font-semibold">ZATCA Ready</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-blue-200/40 font-medium">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        {/* Mobile Header Logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo size={32} className="text-primary-600" />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {isForgotPassword ? (
            // FORGOT PASSWORD VIEW
            <>
              <div className="text-center lg:text-left rtl:lg:text-right mb-10">
                <button onClick={() => setIsForgotPassword(false)} className="text-sm text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1 group">
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Login
                </button>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Enter your email address to receive a password reset link.
                </p>
              </div>

              {resetStatus === 'SUCCESS' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                    <Mail size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Check your inbox</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We have sent a password reset link to <strong>{email}</strong>.
                  </p>
                  {isMock && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-left">
                      <p className="text-sm text-yellow-700 mb-2">
                        <strong>Development Mode:</strong> Email sending is mocked.
                      </p>
                      {mockResetLink ? (
                        <a
                          href={mockResetLink}
                          className="inline-block px-3 py-2 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg border border-yellow-200 hover:bg-yellow-200 transition-colors"
                        >
                          Open Reset Link (Dev Only)
                        </a>
                      ) : (
                        <p className="text-sm text-yellow-700">Check server console for link.</p>
                      )}
                    </div>
                  )}
                  <Button onClick={() => setIsForgotPassword(false)} variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleForgotPasswordSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                      {t('auth.email')}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" aria-hidden="true" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all shadow-sm"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full py-3.5 text-base shadow-lg shadow-primary-500/20 rounded-xl hover:shadow-primary-500/30 transition-shadow" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        {t('common.sending')}
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2 group">
                        Send Reset Link <ArrowRight size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </>
          ) : (
            // LOGIN VIEW
            <>
              <div className="text-center lg:text-left rtl:lg:text-right mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('auth.welcomeBack')}</h2>
                <p className="mt-2 text-sm text-gray-500">
                  {t('auth.signInToAccount')}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex p-1 bg-gray-100/80 rounded-xl border border-gray-200">
                  {['CLIENT', 'EXPERT', 'ADMIN'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 ${role === r
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                      {t(`auth.${r.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                    {t('auth.email')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" aria-hidden="true" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all shadow-sm"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 ml-1">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase">
                      {t('auth.password')}
                    </label>
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-medium text-primary-600 hover:text-primary-500">
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full py-3.5 text-base shadow-lg shadow-primary-500/20 rounded-xl hover:shadow-primary-500/30 transition-shadow" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      {t('common.loading')}
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2 group">
                      {t('auth.signInButton')} <ArrowRight size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400 font-medium">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={triggerGoogle}
                    className="flex items-center justify-center w-24 h-16 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
                    title={t('auth.google')}
                  >
                    <svg className="h-7 w-7" aria-hidden="true" viewBox="0 0 24 24">
                      <path
                        d="M12.0003 20.45c4.6667 0 8.5833-3.2083 9.9583-7.5833H12.0003v-4.125h12.5c.1667 1.2917.25 2.6667.25 4.125 0 6.9167-4.8333 11.8333-11.75 11.8333-6.4583 0-11.7083-5.25-11.7083-11.7083S6.542 1.2917 12.0003 1.2917c3.1667 0 5.875 1.1667 7.9583 3.125l-3 3c-1.25-1.2083-2.9166-1.9167-4.9583-1.9167-4.125 0-7.5833 3.3333-7.5833 7.5s3.4583 7.5 7.5833 7.5z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={triggerLinkedin}
                    className="flex items-center justify-center w-24 h-16 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
                    title={t('auth.linkedin')}
                  >
                    <Linkedin size={28} className="text-[#0077b5]" />
                  </button>
                </div>
              </div>

              <div className="mt-10 text-center">
                <p className="text-sm text-gray-500">
                  {t('auth.noAccount')} {' '}
                  {role === 'EXPERT' ? (
                    <Link to="/join-expert" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                      Join as Expert
                    </Link>
                  ) : (
                    <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                      {t('auth.registerNow')}
                    </Link>
                  )}
                </p>
              </div>

              <p className="text-xs text-center text-gray-400 mt-8 leading-relaxed bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                {t('auth.demoNote')}
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
