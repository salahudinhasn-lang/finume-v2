
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/UI';
import { Logo } from '../components/Logo';
import { Mail, Lock, ArrowRight, Github, Linkedin, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const { login, t, language } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('CLIENT');
  
  const [email, setEmail] = useState('client1@example.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role === 'CLIENT') setEmail('client1@example.com');
    else if (role === 'EXPERT') setEmail('expert1@example.com');
    else setEmail('admin@finume.com');
  }, [role]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Parse query params for redirect logic
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');
    const planId = searchParams.get('planId');

    // Simulate network delay for effect
    setTimeout(() => {
        login(email, role);
        setIsLoading(false);
        if (role === 'CLIENT') {
          if (redirect) {
              navigate(redirect, { state: { action, serviceId, planId } });
          } else {
              navigate('/client');
          }
        } else if (role === 'EXPERT') {
          navigate('/expert');
        } else {
          navigate('/admin');
        }
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Left Column - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 text-white overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-gray-900 opacity-90 z-10"></div>
         {/* Background Image */}
         <img 
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80" 
            alt="Finance Office" 
            className="absolute inset-0 w-full h-full object-cover"
         />
         
         <div className="relative z-20 flex flex-col justify-between p-16 h-full">
             <div>
                 <Link to="/" className="inline-flex items-center gap-2 mb-8">
                    <Logo size={40} className="text-white" />
                    <span className="text-2xl font-bold tracking-tight">FINUME</span>
                 </Link>
             </div>
             
             <div className="space-y-8">
                 <h2 className="text-4xl font-extrabold leading-tight">
                     The Financial Operating System for <span className="text-primary-400">Growth</span>
                 </h2>
                 <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                     Join thousands of companies and certified experts managing compliance, tax, and bookkeeping in one secure platform.
                 </p>
                 
                 <div className="flex gap-4 pt-4">
                     <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex-1">
                         <div className="text-3xl font-bold text-white mb-1">500+</div>
                         <div className="text-xs text-primary-200 uppercase tracking-wider">Companies</div>
                     </div>
                     <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex-1">
                         <div className="text-3xl font-bold text-white mb-1">100%</div>
                         <div className="text-xs text-primary-200 uppercase tracking-wider">ZATCA Compliant</div>
                     </div>
                 </div>
             </div>

             <div className="flex items-center gap-3 text-sm text-gray-400">
                 <span>© 2024 Finume Platform</span>
                 <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                 <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                 <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                 <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
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

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('auth.welcomeBack')}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.signInToAccount')}
            </p>
          </div>

          <div className="mb-8">
             <div className="flex p-1 bg-gray-100 rounded-xl">
                {['CLIENT', 'EXPERT', 'ADMIN'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                      role === r
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t(`auth.${r.toLowerCase()}`)}
                  </button>
                ))}
             </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('auth.password')}
                  </label>
                  <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-500">
                    {t('auth.forgotPassword')}
                  </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-primary-500/20" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.signInButton')}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                <span className="sr-only">Sign in with Google</span>
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 20.45c4.6667 0 8.5833-3.2083 9.9583-7.5833H12.0003v-4.125h12.5c.1667 1.2917.25 2.6667.25 4.125 0 6.9167-4.8333 11.8333-11.75 11.8333-6.4583 0-11.7083-5.25-11.7083-11.7083S6.542 1.2917 12.0003 1.2917c3.1667 0 5.875 1.1667 7.9583 3.125l-3 3c-1.25-1.2083-2.9166-1.9167-4.9583-1.9167-4.125 0-7.5833 3.3333-7.5833 7.5s3.4583 7.5 7.5833 7.5z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                <span className="sr-only">Sign in with LinkedIn</span>
                <Linkedin size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
             <p className="text-sm text-gray-600">
                {t('auth.noAccount')} {' '}
                <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500">
                    {t('auth.registerNow')}
                </Link>
             </p>
          </div>

          <p className="text-xs text-center text-gray-400 mt-8 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
            {t('auth.demoNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
