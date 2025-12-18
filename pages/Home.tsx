import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { CheckCircle, Users, Shield, TrendingUp, ArrowRight, Briefcase, UserPlus, MapPin, Activity, ShieldCheck, Star, Clock, Zap, Globe, MessageSquare, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const HomePage = () => {
  const { t, language, experts, clients, requests } = useAppContext();
  const isRtl = language === 'ar';

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-32 lg:pb-40 overflow-hidden bg-[#0f172a]">

        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/40 text-blue-300 text-sm font-bold mb-8 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {t('hero.new')}
              </div>

              <h1 className="text-5xl tracking-tight font-black text-white sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
                <span className="block">{t('hero.title1')}</span>
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 filter drop-shadow-2xl">
                  {t('hero.title2')}
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-300 sm:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                {t('hero.subtitle')}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-5 sm:justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300">
                <Link to="/experts" className="group">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]">
                    {t('hero.findExpert').replace('Find', 'Hire') /* Or just "Hire an Expert" if translation key not flexible */} <ArrowRight size={22} className={`transition-transform duration-300 ${isRtl ? 'rotate-180 mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'}`} />
                  </Button>
                </Link>
                <Link to="/join-expert">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-5 rounded-2xl !bg-white/10 !backdrop-blur-md !text-white !border !border-white/20 hover:!bg-white/20 transition-all">
                    Join as Expert
                  </Button>
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-6 text-sm text-slate-400 sm:justify-center lg:justify-start animate-in fade-in duration-1000 delay-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800">
                      <img className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">+2k</div>
                </div>
                <div className="flex flex-col">
                  <div className="flex text-yellow-400 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="font-medium">{t('hero.trustedBy')}</span>
                </div>
              </div>
            </div>

            {/* Visual Column */}
            <div className="mt-16 lg:mt-0 lg:col-span-6 perspective-1000 relative">
              {/* Decorative Elements behind main visual */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

              <div className="relative mx-auto w-full lg:max-w-xl rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:rotate-y-2 hover:rotate-x-2 border border-white/10 group animate-in zoom-in duration-1000 bg-[#1e293b]">

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10 opacity-80"></div>

                <img
                  className="w-full h-[650px] object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-overlay"
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"
                  alt="Modern Financial Office"
                />

                {/* UI Overlay Elements */}
                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">

                  {/* Top Float */}
                  <div className="self-end animate-in slide-in-from-right-10 duration-700 delay-300">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-3 w-fit">
                      <div className="p-2 bg-green-500/20 rounded-lg text-green-400 shadow-inner">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Status</p>
                        <p className="text-white font-bold flex items-center gap-2">ZATCA Compliant <CheckCircle size={14} className="text-green-500 fill-current" /></p>
                      </div>
                    </div>
                  </div>



                  {/* Bottom Float */}
                  <div className="self-start w-full animate-in slide-in-from-bottom-10 duration-700 delay-500">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl transform group-hover:translate-y-[-10px] transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Activity size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Growth</p>
                            <p className="text-white font-bold">Monthly Report</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded text-xs">+24%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                        <span>Oct</span>
                        <span>Nov</span>
                        <span className="text-white">Dec</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats Tracker - Glassmorphic Premium Design */}
      <div className="relative py-16 overflow-hidden">
        {/* Background Gradients for Stats */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Experts Card */}
            <div className="group relative bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 mb-2">
                  {experts.filter(e => e.status === 'ACTIVE').length}
                </h3>
                <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">{t('features.experts') || 'Qualified Experts'}</p>
              </div>
            </div>

            {/* Clients Card */}
            <div className="group relative bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 mb-2">
                  {clients.length}
                </h3>
                <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">{t('features.clients') || 'Satisfied Clients'}</p>
              </div>
            </div>

            {/* Value Card */}
            <div className="group relative bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 mb-2">
                  {/* Format: $25M+ or actual value if smaller. Using dynamic formatting. */}
                  {(() => {
                    const total = requests.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.amount, 0);
                    if (total >= 1000000) return `$${(total / 1000000).toFixed(1)}M+`;
                    if (total >= 1000) return `$${(total / 1000).toFixed(0)}k+`;
                    return `$${total}`;
                  })()}
                </h3>
                <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">{t('features.value') || 'Project Value'}</p>
              </div>
            </div>

          </div>
        </div>
      </div>


      {/* Features Section */}
      <div className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">{t('hero.whyFinume')}</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {t('hero.betterWay')}
            </p>
            <p className="text-lg text-slate-500 leading-relaxed">{t('hero.platformDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: t('features.zatca'), desc: t('features.zatcaDesc'), color: 'emerald' },
              { icon: Users, title: t('features.vetted'), desc: t('features.vettedDesc'), color: 'blue' },
              { icon: Zap, title: t('features.ai'), desc: t('features.aiDesc'), color: 'purple' },
            ].map((feature, i) => (
              <div key={i} className="group relative bg-slate-50 rounded-[2rem] p-8 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 flex items-center justify-center text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client CTA Section */}
      <div className="py-16 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">
              Ready to streamline your<br />financial operations?
            </h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-xl">
              Join hundreds of businesses that trust Finume for their VAT, bookkeeping, and CFO needs. Get matched with a vetted expert in minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/experts">
                <Button className="!bg-white !text-blue-600 hover:!bg-blue-50 border-none px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:-translate-y-1 transition-transform">
                  Hire an Expert Now
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" className="!border-blue-400 !text-white hover:!bg-white/10 px-8 py-4 rounded-xl font-bold text-lg">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-2xl transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <CheckCircle size={24} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Request Completed</div>
                  <div className="text-blue-200 text-sm">Just now</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex justify-between text-sm text-blue-100 mb-1">Service</div>
                  <div className="font-bold text-white">Quarterly VAT Filing</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex justify-between text-sm text-blue-100 mb-1">Status</div>
                  <div className="font-bold text-green-300 flex items-center gap-2">● Submitted to ZATCA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join as Expert CTA */}
      <div className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                className="w-full h-full object-cover opacity-20"
                alt="Team collaboration"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/60"></div>
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center p-12 sm:p-20">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold mb-6 border border-white/10 backdrop-blur-md">
                  <Globe size={12} /> Remote Opportunities
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">
                  {t('cta.areYouExpert')}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 mt-2">{t('cta.joinNetwork')}</span>
                </h2>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-md">
                  {t('cta.monetize')}
                </p>
                <Link
                  to="/join-expert"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 rounded-xl px-8 py-4 font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
                >
                  <Briefcase size={20} className="text-blue-600" /> {t('cta.joinBtn')}
                </Link>
              </div>

              {/* Decorative Grid or Stats for Right Side */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-1">Top 1%</div>
                  <div className="text-sm text-slate-400">Talent Acceptance Rate</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl mt-8">
                  <div className="text-3xl font-black text-pink-400 mb-1">Flex</div>
                  <div className="text-sm text-slate-400">Work on your terms</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl -mt-8">
                  <div className="text-3xl font-black text-blue-400 mb-1">$0</div>
                  <div className="text-sm text-slate-400">Upfront Cost</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-1">Global</div>
                  <div className="text-sm text-slate-400">Client Base</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
