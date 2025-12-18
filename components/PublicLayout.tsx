
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from './UI';
import { useAppContext } from '../context/AppContext';
import { Logo } from './Logo';
import { Globe, Twitter, Linkedin, Instagram, Mail, Phone, Menu, X, ChevronRight } from 'lucide-react';

const PublicLayout = () => {
  const { language, setLanguage, t } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    // SEO Configuration
    const seoConfig: Record<string, { en: { title: string; description: string }; ar: { title: string; description: string } }> = {
      '/': {
        en: {
          title: 'Finume | Financial Operating System for SMEs',
          description: 'The all-in-one financial operating system for Saudi SMEs. Bookkeeping, ZATCA e-invoicing, and certified financial experts.'
        },
        ar: {
          title: 'Finume | منظومتك المالية المتكاملة',
          description: 'نظام التشغيل المالي المتكامل للمنشآت السعودية. مسك دفاتر، فوترة إلكترونية متوافقة مع الزكاة، وخبراء ماليين معتمدين.'
        }
      },
      '/services': {
        en: {
          title: 'Services | Finume',
          description: 'Explore our financial services: bookkeeping, CFO advisory, and tax compliance solutions tailored for Saudi businesses.'
        },
        ar: {
          title: 'خدماتنا | Finume',
          description: 'اكتشف حلولنا المالية: مسك الدفاتر، الاستشارات المالية، وحلول التوافق الضريبي المصممة خصيصاً للمنشآت السعودية.'
        }
      },
      '/experts': {
        en: {
          title: 'Experts | Finume',
          description: 'Connect with certified financial experts and accountants in Saudi Arabia. Verified professionals to help grow your business.'
        },
        ar: {
          title: 'الخبراء | Finume',
          description: 'تواصل مع نخبة من الخبراء الماليين والمحاسبين المعتمدين في المملكة. محترفون موثوقون لمساعدة نمو أعمالك.'
        }
      },
      '/pricing': {
        en: {
          title: 'Pricing | Finume',
          description: 'Transparent pricing plans for all business sizes. Choose the package that fits your financial management needs.'
        },
        ar: {
          title: 'الباقات | Finume',
          description: 'خطط أسعار شفافة تناسب جميع أحجام الأعمال. اختر الباقة التي تناسب احتياجات إدارتك المالية.'
        }
      },
      '/about': {
        en: {
          title: 'About Us | Finume',
          description: 'Learn about Finume mission to empower Saudi SMEs with intelligent financial tools and expert guidance.'
        },
        ar: {
          title: 'عن فينيومي | Finume',
          description: 'تعرف على مهمة فينيومي في تمكين المنشآت السعودية بأدوات مالية ذكية وتوجيه من الخبراء.'
        }
      },
      '/login': {
        en: {
          title: 'Login | Finume',
          description: 'Access your financial dashboard. Secure login for business owners and financial experts.'
        },
        ar: {
          title: 'تسجيل الدخول | Finume',
          description: 'مرحباً بك في لوحة التحكم المالية. تسجيل دخول آمن لأصحاب الأعمال والخبراء الماليين.'
        }
      },
      '/register': {
        en: {
          title: 'Get Started | Finume',
          description: 'Create your Finume account today. Join thousands of Saudi businesses streamlining their finances.'
        },
        ar: {
          title: 'انضم إلينا | Finume',
          description: 'أنشئ حسابك في فينيومي اليوم. انضم لآلاف المنشآت السعودية التي تدير ماليتها بذكاء.'
        }
      }
    };

    // Default SEO
    const currentConfig = seoConfig[location.pathname] || seoConfig['/'];
    const { title, description } = currentConfig[language as 'en' | 'ar'];

    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

  }, [language, location.pathname]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.experts'), path: '/experts' },
    { name: t('nav.pricing'), path: '/pricing' },
    { name: t('nav.about'), path: '/about' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${language === 'ar' ? 'font-sans' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 border-b border-white/10 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
              <Link to="/" className="flex items-center gap-2 group">
                <Logo size={32} className="text-primary-600 transition-transform group-hover:scale-110" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">{language === 'ar' ? 'فينومي' : 'FINUME'}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1"
              >
                <Globe size={18} />
                <span className="text-xs font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
              </button>

              <div className="h-6 w-px bg-gray-200 mx-1"></div>

              <Link to="/login">
                <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300 text-gray-700">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-4">
              <button onClick={toggleLanguage} className="text-gray-500">
                <span className="text-xs font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">{t('nav.login')}</Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-primary-600">{t('nav.getStarted')}</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-grow pt-20">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="bg-[#0B0F19] text-slate-300 border-t border-slate-800 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 opacity-50"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

        <div className="max-w-7xl mx-auto pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Top Section: CTA & Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 border-b border-slate-800 pb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <Logo size={24} className="text-primary-400" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">{language === 'ar' ? 'فينومي' : 'FINUME'}</span>
              </div>
              <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                {t('pol.footerDesc')}
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-white font-bold mb-2">{t('pol.subscribeTitle')}</h3>
              <p className="text-slate-400 text-sm mb-4">{t('pol.subscribeDesc')}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('pol.enterEmail')}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors">
                  {t('pol.subscribeBtn')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

            {/* Column 1 */}
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6 flex items-center gap-2">
                {t('pol.platform')}
              </h3>
              <ul className="space-y-4">
                <li><Link to="/experts" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={12} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" /> {t('nav.experts')}</Link></li>
                <li><Link to="/services" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={12} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" /> {t('nav.services')}</Link></li>
                <li><Link to="/pricing" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"><ChevronRight size={12} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" /> {t('nav.pricing')}</Link></li>
                <li><Link to="/join-expert" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">{t('pol.becomeExpert')}</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">{t('pol.company')}</h3>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-slate-400 hover:text-white transition-colors">{t('nav.about')}</Link></li>
                <li><Link to="/careers" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  {t('footer.careers')}
                  <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">{t('pol.hiring')}</span>
                </Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">{t('pol.resources')}</h3>
              <ul className="space-y-4">
                <li><Link to="/qa" className="text-slate-400 hover:text-white transition-colors">{t('pol.helpCenter')}</Link></li>
                <li><Link to="/compliance" className="text-slate-400 hover:text-white transition-colors">{t('pol.zatcaGuide')}</Link></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">{t('pol.apiDocs')}</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">{t('pol.legal')}</h3>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <p className="text-sm text-slate-500">{t('footer.rights')}</p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter size={18} /></a>
                <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin size={18} /></a>
                <a href="#" className="text-slate-500 hover:text-white transition-colors"><Instagram size={18} /></a>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Mail size={16} className="text-primary-500" /> support@finume.com
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Phone size={16} className="text-primary-500" /> +966 54 000 0000
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
