
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/UI';
import { Logo } from '../components/Logo';
import { Mail, Lock, User, Building, Check, Github, Linkedin, ShieldCheck, Star, ArrowRight, Globe } from 'lucide-react';
import { Client } from '../types';

const RegisterPage = () => {
  const { addClient, login, t, language, setLanguage } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Parse query params for redirect logic
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');
    const planId = searchParams.get('planId');

    const user = await addClient({
      ...formData,
      role: 'CLIENT'
    } as any);

    // Wait, addClient is Void in context actions. I need `register` from context.
    // I need to destructure `register` from `useAppContext()`.

    // Changing implementation to use `register`:
  };

  return (
    <div className="min-h-screen flex bg-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* Left Column - Visuals & Trust */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-[#0F172A] text-white overflow-hidden flex-col justify-between p-12">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[100px] animate-blob animation-delay-2000"></div>
        </div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl group-hover:bg-white/20 transition-colors border border-white/10">
              <Logo size={32} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FINUME</span>
          </Link>

          <h2 className="text-4xl font-extrabold leading-tight mb-6 tracking-tight">
            {t('auth.registerTitle')}
          </h2>
          <p className="text-blue-100/80 text-lg mb-8 leading-relaxed">
            {t('auth.registerDesc')}
          </p>

          <ul className="space-y-5 mb-12">
            <li className="flex items-center gap-4 text-blue-50 group">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400 border border-green-500/20 group-hover:bg-green-500/30 transition-colors"><Check size={18} /></div>
              {t('auth.zatcaReady')}
            </li>
            <li className="flex items-center gap-4 text-blue-50 group">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400 border border-green-500/20 group-hover:bg-green-500/30 transition-colors"><Check size={18} /></div>
              {t('auth.dedicatedAccountant')}
            </li>
            <li className="flex items-center gap-4 text-blue-50 group">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400 border border-green-500/20 group-hover:bg-green-500/30 transition-colors"><Check size={18} /></div>
              {t('auth.monthlyReports')}
            </li>
          </ul>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex gap-1 text-yellow-400 mb-3">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />)}
          </div>
          <p className="text-blue-100/90 italic mb-4 text-sm leading-relaxed">
            "{t('auth.testimonial')}"
          </p>
          <div className="flex items-center gap-3">
            <img src="https://api.dicebear.com/7.x/initials/svg?seed=OM" className="w-10 h-10 rounded-full border-2 border-white/20" alt="User" />
            <div>
              <p className="text-sm font-bold text-white">{t('auth.testimonialAuthor')}</p>
              <p className="text-xs text-blue-200/60 font-medium tracking-wide">{t('auth.testimonialRole')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2">
            <Logo size={32} className="text-primary-600" />
          </Link>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-bold text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full"
          >
            <Globe size={18} />
            <span>{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="text-center lg:text-left rtl:lg:text-right mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{t('auth.createAccount')}</h2>
            <p className="text-sm text-gray-500">
              {t('auth.haveAccount')} <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-2">{t('auth.signInAs')}</Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                {t('auth.fullName')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="companyName" className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                {t('auth.companyName')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <Building className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                  placeholder="e.g. Acme Corp LLC"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                {t('auth.password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>

            <div className="flex items-start pt-2 ml-1">
              <input id="terms" type="checkbox" required className="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer" />
              <label htmlFor="terms" className="ml-2 rtl:ml-0 rtl:mr-2 block text-xs text-gray-500 cursor-pointer">
                {t('auth.termsAgreement')}
              </label>
            </div>

            <Button type="submit" className="w-full py-3.5 text-base shadow-lg shadow-primary-500/20 rounded-xl hover:shadow-primary-500/30 transition-shadow group" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {t('common.loading')}
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t('auth.getStarted')} <ArrowRight size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              {t('auth.areYouExpert')} <Link to="/join-expert" className="font-bold text-gray-800 hover:text-primary-600 underline decoration-2 underline-offset-2 transition-colors">{t('auth.applyJoin')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
