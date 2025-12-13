import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { CheckCircle, Users, Shield, TrendingUp, ArrowRight, Briefcase, UserPlus, MapPin, Activity, ShieldCheck, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const HomePage = () => {
  const { t, language } = useAppContext();
  const isRtl = language === 'ar';

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="pt-16 pb-16 sm:pt-24 sm:pb-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6 border border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                 <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span> {t('hero.new')}
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
                <span className="block">{t('hero.title1')}</span>
                <span className="block text-primary-600">{t('hero.title2')}</span>
              </h1>
              <p className="mt-6 text-lg text-gray-500 sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                {t('hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300">
                <Link to="/experts">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-xl shadow-primary-600/20 hover:scale-105 transition-transform">
                    {t('hero.findExpert')} <ArrowRight size={20} className={isRtl ? 'rotate-180 mr-2' : 'ml-2'} />
                  </Button>
                </Link>
                <Link to="/join-expert">
                   <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:text-primary-600 shadow-md transition-all">
                      Join as Expert
                   </Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-4 text-sm text-gray-500 sm:justify-center lg:justify-start animate-in fade-in duration-1000 delay-500">
                  <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                          <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                      ))}
                  </div>
                  <p>{t('hero.trustedBy')}</p>
              </div>
            </div>
            
            {/* Visual Column */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden transform hover:scale-[1.01] transition-transform duration-500 border-8 border-white group animate-in zoom-in duration-1000">
                
                {/* Image: Professional Office Context (Default) */}
                <img 
                  className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80" 
                  alt="Modern Financial Office" 
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* --- Enhanced Floating Tags --- */}
                
                {/* 1. ZATCA Compliance Badge (Left) */}
                <div className="absolute top-8 -left-4 bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/50 flex items-center gap-3 animate-in slide-in-from-left-10 duration-700 delay-300 hover:scale-105 transition-transform cursor-default">
                    <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compliance</p>
                        <p className="text-base font-bold text-gray-900 flex items-center gap-1">
                            ZATCA Ready <CheckCircle size={14} className="text-emerald-500" />
                        </p>
                    </div>
                </div>

                {/* 2. Active Experts (Right) */}
                <div className="absolute bottom-32 -right-4 bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/50 flex items-center gap-4 animate-in slide-in-from-right-10 duration-700 delay-500 hover:scale-105 transition-transform cursor-default">
                     <div className="flex -space-x-3">
                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Exp1" alt="Expert" />
                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Exp2" alt="Expert" />
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">+50</div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network</p>
                        <p className="text-base font-bold text-gray-900">Active Experts</p>
                    </div>
                </div>
                
                {/* 3. Rating/Trust (Top Right) */}
                <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-white shadow-lg animate-in fade-in duration-700 delay-700">
                    <div className="flex text-yellow-400">
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold">4.9/5 Trust Score</span>
                </div>

                {/* 4. Bottom Info Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center border border-white/20 shadow-lg">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-200 uppercase tracking-wider font-bold">Growth Partner</p>
                            <p className="font-bold text-white text-sm">Vision 2030 Aligned</p>
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/20"></div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-[10px] text-gray-200">Secure & Private</p>
                    </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">{t('hero.whyFinume')}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('hero.betterWay')}
            </p>
            <p className="mt-4 text-lg text-gray-500">{t('hero.platformDesc')}</p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Shield, title: t('features.zatca'), desc: t('features.zatcaDesc') },
                { icon: Users, title: t('features.vetted'), desc: t('features.vettedDesc') },
                { icon: TrendingUp, title: t('features.ai'), desc: t('features.aiDesc') },
              ].map((feature, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-blue-400 rounded-lg blur opacity-0 group-hover:opacity-25 transition duration-200"></div>
                  <div className="relative bg-white p-8 rounded-lg border border-gray-100 shadow-sm h-full hover:-translate-y-1 transition-transform duration-300">
                      <div className="inline-flex items-center justify-center p-3 bg-primary-50 rounded-xl mb-6 text-primary-600">
                        <feature.icon className="h-8 w-8" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Join as Expert CTA */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-3xl overflow-hidden shadow-2xl lg:grid lg:grid-cols-2 lg:gap-4">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Are you a Financial Expert?</span>
                  <span className="block text-primary-200">Join the Finume Network.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-primary-100">
                  Monetize your expertise in tax, audit, and finance. Access a steady stream of corporate clients without the marketing hassle.
                </p>
                <Link
                  to="/join-expert"
                  className="mt-8 bg-white border border-transparent rounded-xl shadow px-6 py-4 inline-flex items-center text-base font-bold text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Briefcase className="mr-2" size={20} /> Join as an Expert
                </Link>
              </div>
            </div>
            <div className="relative -mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1">
              <img
                className="transform translate-x-6 translate-y-6 rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20 filter brightness-90"
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80"
                alt="Expert collaboration"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;