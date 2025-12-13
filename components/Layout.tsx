import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, DollarSign, Settings, LogOut, Menu, X, Bell, Search, Shield, Tag, HelpCircle, ChevronRight, Check } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout, language, setLanguage, t, notifications, markAsRead, markAllAsRead } = useAppContext();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Filter notifications for current user
  const myNotifications = notifications.filter(n => n.userId === user?.id || n.userId === user?.email).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      logout();
    }, 50);
  };

  const getNavItems = () => {
    if (user?.role === 'CLIENT') {
      return [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/client' },
        { icon: Search, label: t('sidebar.browseExperts'), path: '/client/experts' },
        { icon: FileText, label: t('sidebar.myRequests'), path: '/client/requests' },
        { icon: DollarSign, label: t('sidebar.payments'), path: '/client/payments' },
        { icon: Settings, label: t('sidebar.settings'), path: '/client/settings' },
      ];
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
      <aside className={`fixed lg:static inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-30 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center h-20 px-8 border-b border-slate-800 bg-slate-900">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Logo size={32} className="text-primary-500" />
            <span className="text-2xl font-bold text-white tracking-tight">FINUME</span>
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
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive 
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 relative">
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
            
            {/* Notification Bell with Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {isNotifOpen && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsNotifOpen(false)}></div>
                        <div className={`absolute top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-40 overflow-hidden animate-in fade-in zoom-in duration-200 ${language === 'ar' ? 'left-0' : 'right-0'}`}>
                            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {myNotifications.length > 0 ? myNotifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                        <div>
                                            <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-gray-400 text-sm">No notifications.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
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