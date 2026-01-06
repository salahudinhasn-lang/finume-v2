
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, DollarSign, Settings, LogOut, Menu, X, Bell, Search, Shield, Tag, HelpCircle, ChevronRight, LayoutTemplate } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout, language, setLanguage, t, settings } = useAppContext();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      logout();
    }, 50);
  };

  const getVisibility = (key: string) => {
    if (!settings?.pageVisibility) return true;
    try {
      const vis = JSON.parse(settings.pageVisibility);
      return vis[key.toLowerCase()]?.client !== false;
    } catch (e) {
      return true;
    }
  };

  const getNavItems = () => {
    if (user?.role === 'CLIENT') {
      return [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/client', visible: true },

        { icon: Search, label: t('sidebar.browseExperts'), path: '/client/experts', visible: getVisibility('experts') },
        { icon: FileText, label: t('sidebar.myRequests'), path: '/client/requests', visible: true },
        { icon: DollarSign, label: t('sidebar.payments'), path: '/client/payments', visible: true },
        { icon: Settings, label: t('sidebar.settings'), path: '/client/settings', visible: true },
      ].filter(item => item.visible);
    } else if (user?.role === 'EXPERT') {
      return [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/expert' },
        { icon: FileText, label: t('sidebar.myTasks'), path: '/expert/tasks' },
        { icon: DollarSign, label: t('sidebar.earnings'), path: '/expert/earnings' },
        { icon: Settings, label: t('sidebar.profile'), path: '/expert/profile' },
      ];
    } else {
      // ADMIN
      return [
        { icon: LayoutDashboard, label: t('sidebar.overview'), path: '/admin' },
        { icon: Users, label: t('sidebar.clients'), path: '/admin/clients' },
        { icon: Users, label: t('sidebar.experts'), path: '/admin/experts' },
        { icon: FileText, label: t('sidebar.myRequests'), path: '/admin/requests' },
        { icon: Tag, label: 'Services & Pricing', path: '/admin/services' },
        { icon: LayoutTemplate, label: 'Site Pages', path: '/admin/pages' },
        { icon: DollarSign, label: t('sidebar.financials'), path: '/admin/financials' },
        { icon: Shield, label: t('sidebar.adminProfiles'), path: '/admin/profiles' },
      ];
    }
  };

  return (
    <div className={`flex h-screen bg-gray-50 ${language === 'ar' ? 'font-sans' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Dark Theme */}
      <aside className={`fixed lg:static inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-30 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}>

        {/* Sidebar Header */}
        <div className="flex items-center h-20 px-8 border-b border-slate-800 bg-slate-900">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Logo size={32} className="text-primary-500" />
            <span className="text-2xl font-bold text-white tracking-tight">{language === 'ar' ? 'Finume | فينومي' : 'FINUME'}</span>
          </Link>
          <button className="lg:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>
          {getNavItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                  {item.label}
                </div>
                {isActive && <ChevronRight size={16} className="text-primary-200" />}
              </Link>
            )
          })}

          <div className="mt-8 px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Support
          </div>
          <Link
            to="/qa"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <HelpCircle size={20} className="text-slate-500" />
            Help Center
          </Link>
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="relative">
              <img src={user?.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 hover:border-slate-700"
          >
            <LogOut size={14} className={language === 'ar' ? 'ml-1' : ''} />
            {t('sidebar.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <header className="flex items-center justify-between h-20 px-8 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 uppercase tracking-wide transition-colors"
            >
              {language === 'en' ? 'Arabic' : 'English'}
            </button>
            <button className="relative p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
