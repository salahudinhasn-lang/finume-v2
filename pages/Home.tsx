import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { CheckCircle, Users, Shield, TrendingUp, ArrowRight, Briefcase, UserPlus, MapPin, Activity, ShieldCheck, Star, Clock, Zap, Globe, MessageSquare, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import TierCalculator from '../components/TierCalculator';
import PricingTable from '../components/PricingTable';

const HomePage = () => {
  const { t, language, experts, clients, requests } = useAppContext();
  const isRtl = language === 'ar';

  return (
    <div className="flex flex-col overflow-hidden bg-slate-950 text-slate-200">

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[#0B1120]">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-indigo-950/50 to-transparent"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-300 text-sm font-bold mb-8 border border-blue-500/20 shadow-sm mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Trusted by 500+ Companies
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                Financial<br />
                Compliance <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Made Simple.
                </span>
              </h1>

              <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Stop worrying about VAT & ZATCA fines. Get matched with the perfect financial compliance plan for your business size.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="px-8 py-6 text-lg rounded-2xl shadow-xl shadow-blue-500/10 bg-blue-600 hover:bg-blue-500 text-white border-none">
                  Find My Plan
                </Button>
              </div>

            </div>

            {/* Right Column: Image */}
            <div className="relative lg:h-[600px] w-full hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-[2.5rem] rotate-3 transform scale-95 opacity-50 blur-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"
                alt="Financial Compliance"
                className="relative w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-4 border-slate-800/50 rotate-0 hover:rotate-1 transition-transform duration-700 opacity-90"
              />

              {/* Floating Card */}
              <div className="absolute bottom-10 -left-10 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="text-white font-black text-lg">100% Compliant</div>
                    <div className="text-slate-400 text-sm">Zero Fines Guarantee</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div id="calculator" className="py-20 bg-slate-900 relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4">Calculate Your Tier</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Answer 3 simple questions to find the perfect compliance package for your business.</p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
          <TierCalculator />
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-slate-950 border-t border-slate-900">
        {/* Note: PricingTable might need internal CSS updates for Dark Mode, but container needs to be dark */}
        <div className="bg-white rounded-3xl p-2 hidden"></div> {/* Placeholder to ensure I didn't break anything logic wise */}
        <PricingTable />
      </div>

      {/* Join As Expert Section */}
      <div className="py-24 bg-[#0B1120] overflow-hidden relative border-t border-slate-900">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black text-white mb-6">Are you a Financial Expert?</h2>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              Join the Finume network and get matched with high-quality clients.
              Monetize your expertise in VAT, Bookkeeping, and Auditing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/join-expert">
                <Button size="lg" className="!bg-white !text-slate-900 hover:!bg-slate-100 border-none transition-transform hover:-translate-y-1">
                  Apply as an Expert
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-slate-800 pt-8">
              <div>
                <div className="text-3xl font-black text-blue-400 mb-1">Top 3%</div>
                <div className="text-sm text-slate-500">Talent Acceptance</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-400 mb-1">$0</div>
                <div className="text-sm text-slate-500">Upfront Cost</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl rotate-3 opacity-20 blur-lg"></div>
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80"
              alt="Expert working"
              className="relative rounded-3xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      </div>


      {/* Live Stats Tracker - Glassmorphic Premium Design */}
      <div className="relative py-16 overflow-hidden bg-slate-950">
        {/* Background Gradients for Stats */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Experts Card */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-5xl font-black text-white mb-2">
                  {experts.filter(e => e.status === 'ACTIVE').length}
                </h3>
                <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">{t('features.experts') || 'Qualified Experts'}</p>
              </div>
            </div>

            {/* Clients Card */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-5xl font-black text-white mb-2">
                  {clients.length}
                </h3>
                <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">{t('features.clients') || 'Satisfied Clients'}</p>
              </div>
            </div>

            {/* Value Card */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-5xl font-black text-white mb-2">
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
      <div className="py-24 bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3">{t('hero.whyFinume')}</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              {t('hero.betterWay')}
            </p>
            <p className="text-lg text-slate-400 leading-relaxed">{t('hero.platformDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: t('features.zatca'), desc: t('features.zatcaDesc'), color: 'emerald' },
              { icon: Users, title: t('features.vetted'), desc: t('features.vettedDesc'), color: 'blue' },
              { icon: Zap, title: t('features.ai'), desc: t('features.aiDesc'), color: 'purple' },
            ].map((feature, i) => (
              <div key={i} className="group relative bg-slate-800/50 rounded-[2rem] p-8 hover:bg-slate-800 border border-transparent hover:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center text-${feature.color}-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm transition-colors`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client CTA Section */}
      <div className="py-16 bg-blue-700 relative overflow-hidden">
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
      <div className="py-10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-slate-800">
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
