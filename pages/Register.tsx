
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/UI';
import { Logo } from '../components/Logo';
import { Mail, Lock, User, Building, Check, Github, Linkedin, ShieldCheck, Star } from 'lucide-react';
import { Client } from '../types';

const RegisterPage = () => {
  const { addClient, login, t, language } = useAppContext();
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Parse query params for redirect logic
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');
    const planId = searchParams.get('planId');

    // Simulate API call
    setTimeout(() => {
      const newClient: Client = {
        id: `C-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        role: 'CLIENT',
        industry: 'Technology',
        totalSpent: 0,
        zatcaStatus: 'GREEN',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`
      };

      // 1. Add to Database
      addClient(newClient);

      // 2. Auto Login with new user object to avoid race condition
      login(newClient.email, 'CLIENT', newClient);

      setIsLoading(false);

      // 3. Redirect with State
      if (redirect) {
        navigate(redirect, { state: { action, serviceId, planId } });
      } else {
        navigate('/client');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* Left Column - Visuals & Trust */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-[#0B0F19] text-white overflow-hidden flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <Logo className="text-primary-500" />
            <span className="text-xl font-bold tracking-tight">FINUME</span>
          </Link>

          <h2 className="text-3xl font-extrabold leading-tight mb-6">
            {t('client.registerTitle')}
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {t('client.registerDesc')}
          </p>

          <ul className="space-y-4 mb-12">
            <li className="flex items-center gap-3 text-gray-300">
              <div className="bg-green-500/20 p-1.5 rounded-full text-green-400"><Check size={16} /></div>
              {t('client.zatcaReady')}
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <div className="bg-green-500/20 p-1.5 rounded-full text-green-400"><Check size={16} /></div>
              {t('client.dedicatedAccountant')}
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <div className="bg-green-500/20 p-1.5 rounded-full text-green-400"><Check size={16} /></div>
              {t('client.monthlyReports')}
            </li>
          </ul>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
          <div className="flex gap-1 text-yellow-400 mb-3">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <p className="text-gray-300 italic mb-4 text-sm leading-relaxed">
            {t('client.testimonial')}
          </p>
          <div className="flex items-center gap-3">
            <img src="https://api.dicebear.com/7.x/initials/svg?seed=OM" className="w-8 h-8 rounded-full border border-white/20" alt="User" />
            <div>
              <p className="text-sm font-bold text-white">{t('client.testimonialAuthor')}</p>
              <p className="text-xs text-gray-500">{t('client.testimonialRole')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo size={32} className="text-primary-600" />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{t('auth.createAccount')}</h2>
            <p className="text-sm text-gray-600">
              {t('auth.haveAccount')} <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500">{t('auth.signInAs')}</Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="companyName" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.companyName')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. Acme Corp LLC"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>

            <div className="flex items-start pt-2">
              <input id="terms" type="checkbox" required className="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer" />
              <label htmlFor="terms" className="ml-2 block text-xs text-gray-500 cursor-pointer">
                {t('client.termsAgreement')}
              </label>
            </div>

            <Button type="submit" className="w-full py-3.5 text-base shadow-lg shadow-primary-500/20 rounded-xl" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('client.getStarted')}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              {t('client.areYouExpert')} <Link to="/join-expert" className="font-bold text-gray-800 hover:text-primary-600 underline">{t('client.applyJoin')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
