import React, { useState } from 'react';
import {
    Shield, Info, Phone, Briefcase, FileText,
    CheckCircle, CreditCard,
    UserCheck, Mail, Building, ShieldCheck, FileQuestion, Smartphone, Cpu, Check,
    BookOpen, Search, Coins, TrendingUp, Layout, Minus, HelpCircle, ArrowRight,
    MessageCircle, FileCheck, Zap, Lock, MapPin, Globe, Star
} from 'lucide-react';
import { Button } from '../components/UI';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// --- Shared Components for Consistent UI ---

// --- Shared Components for Consistent UI ---

const PlanCalculator = ({ plans, onRecommend }: { plans: any[], onRecommend: (id: string) => void }) => {
    const [revenue, setRevenue] = useState(200000);
    const [txns, setTxns] = useState('< 50');
    const [employees, setEmployees] = useState('None');

    // Logic to determine recommended plan
    const getRecommendedPlan = () => {
        // CR Guard: Rev < 375k, Tx < 50, Emp None/1-10
        if (revenue < 375000 && txns === '< 50' && (employees === 'None' || employees === '1-10')) {
            return plans.find(p => p.name.includes('CR')) || plans[0];
        }
        // ZATCA Shield: Rev < 5M, Tx < 300, Emp < 50
        if (revenue < 5000000 && (txns === '< 50' || txns === '50-300') && employees !== '50+') {
            return plans.find(p => p.name.includes('ZATCA')) || plans[1];
        }
        // Audit Proof: Unlimited
        return plans.find(p => p.name.includes('Audit')) || plans[2];
    };

    const recommended = getRecommendedPlan();

    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden mb-24">
            {/* Left: Inputs */}
            <div className="flex-1 w-full space-y-8 relative z-10">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">Configure Your Needs</h3>
                    <p className="text-slate-500">Answer 3 simple questions to find the perfect compliance package.</p>
                </div>

                {/* Revenue Slider */}
                <div>
                    <div className="flex justify-between mb-4">
                        <label className="font-bold text-slate-700">Annual Revenue</label>
                        <span className="font-black text-2xl text-slate-900">{revenue.toLocaleString()} <span className="text-sm font-medium text-slate-400">SAR</span></span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="50000"
                        value={revenue}
                        onChange={(e) => setRevenue(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Startup</span>
                        <span>Growth</span>
                        <span>Enterprise</span>
                    </div>
                </div>

                {/* Transactions */}
                <div>
                    <label className="font-bold text-slate-700 block mb-3">Monthly Transactions</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['< 50', '50-300', '300+'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setTxns(opt)}
                                className={`py-3 rounded-xl font-bold text-sm transition-all border ${txns === opt ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Employees */}
                <div>
                    <label className="font-bold text-slate-700 block mb-3">Employees</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['None', '1-10', '10+'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setEmployees(opt)}
                                className={`py-3 rounded-xl font-bold text-sm transition-all border ${employees === opt ? 'bg-purple-50 border-purple-200 text-purple-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Recommendation Card */}
            <div className="flex-1 w-full bg-slate-50 rounded-3xl p-8 border border-slate-100 relative">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                {recommended && (
                    <div className="relative z-10 animate-in fade-in zoom-in duration-300">
                        <div className="uppercase tracking-widest text-xs font-bold text-blue-600 mb-2 bg-blue-100 w-fit px-2 py-1 rounded">Recommended Plan</div>
                        <h3 className="text-4xl font-black text-slate-900 mb-2">{recommended.name}</h3>
                        <p className="text-slate-500 mb-6">{recommended.description}</p>

                        <div className="space-y-3 mb-8">
                            {recommended.features.slice(0, 3).map((f: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <CheckCircle size={16} className="text-green-500" /> {f}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-200">
                            <Button onClick={() => onRecommend(recommended.id)} className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 shadow-lg font-bold">
                                Get Started <ArrowRight size={16} className="ml-2" />
                            </Button>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900">{recommended.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">SAR</span></p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Per Month</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PageHeader = ({ title, subtitle, icon: Icon, color = 'blue' }: { title: string, subtitle?: string, icon: any, color?: string }) => (
    <div className={`relative overflow-hidden py-24 sm:py-32 bg-slate-900`}>
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-${color}-600/20 rounded-full blur-[120px] opacity-40 mix-blend-screen`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <div className={`inline-flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 text-${color}-400 mb-8 backdrop-blur-sm shadow-xl`}>
                <Icon size={40} />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">{title}</h1>
            {subtitle && <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
        </div>
    </div>
);

const Section = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`py-20 sm:py-28 px-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
    </div>
);

export const ServicesPage = () => {
    const { services, user, t } = useAppContext();
    const navigate = useNavigate();

    const getIcon = (name: string) => {
        if (name.includes('VAT')) return FileText;
        if (name.includes('Bookkeeping')) return BookOpen;
        if (name.includes('Audit')) return Search;
        if (name.includes('Zakat')) return Coins;
        if (name.includes('CFO')) return TrendingUp;
        return Briefcase;
    };

    const handleBookService = (serviceId: string) => {
        if (user) {
            // Direct to checkout if logged in
            navigate(`/client/checkout?serviceId=${serviceId}`);
        } else {
            navigate(`/login?redirect=/client/checkout&serviceId=${serviceId}`);
        }
    };

    return (
        <div className="bg-white">
            <PageHeader
                title={t('public.servicesTitle')}
                subtitle={t('public.servicesDesc')}
                icon={Briefcase}
                color="blue"
            />

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => {
                        const Icon = getIcon(service.nameEn);
                        return (
                            <div key={service.id} className="group flex flex-col bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <Icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.nameEn}</h3>
                                <p className="text-slate-500 mb-8 flex-1 leading-relaxed">{service.description}</p>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('public.startingFrom')}</p>
                                        <p className="text-2xl font-black text-slate-900">{service.price.toLocaleString()} <span className="text-sm text-slate-400 font-medium">{t('common.sar')}</span></p>
                                    </div>
                                    <Button onClick={() => handleBookService(service.id)} className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl px-6 py-3 font-bold transition-colors shadow-lg shadow-slate-200">
                                        {t('public.bookNow')}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}

                    {/* Custom Enterprise Card */}
                    <div className="group flex flex-col bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/30 transition-colors"></div>

                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/10">
                                <Layout size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{t('public.customTitle')}</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">{t('public.customDesc')}</p>

                            <div className="mt-auto">
                                <Link to="/contact">
                                    <Button className="w-full !bg-white !text-slate-900 hover:bg-blue-50 font-bold py-4 rounded-xl border-none">
                                        {t('public.contactSales')} <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Process Section */}
            <Section className="bg-slate-50 relative overflow-hidden">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">{t('public.howItWorks')}</h2>
                    <p className="text-slate-500 text-lg">Simple steps to financial peace of mind.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative max-w-6xl mx-auto">
                    {/* Connecting line */}
                    <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-10"></div>

                    {[
                        { step: 1, title: t('public.steps.1.title'), desc: t('public.steps.1.desc'), icon: UserCheck },
                        { step: 2, title: t('public.steps.2.title'), desc: t('public.steps.2.desc'), icon: Search },
                        { step: 3, title: t('public.steps.3.title'), desc: t('public.steps.3.desc'), icon: CheckCircle },
                        { step: 4, title: t('public.steps.4.title'), desc: t('public.steps.4.desc'), icon: Star }
                    ].map((item) => (
                        <div key={item.step} className="relative group text-center">
                            <div className="w-16 h-16 bg-white border-4 border-slate-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10 group-hover:-translate-y-2 transition-transform duration-300 transform rotate-3 group-hover:rotate-0">
                                <item.icon size={28} />
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
                                    {item.step}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed px-2">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
};

export const PricingPage = () => {
    const { plans, user, t } = useAppContext();
    const navigate = useNavigate();
    const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
    const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);
    const comparisonRef = React.useRef<HTMLDivElement>(null);

    // Scroll to comparison logic
    const handleCalculatorRecommend = (planId: string) => {
        setHighlightedPlan(planId);
        comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleSelectPlan = (planId: string) => {
        if (user) {
            // Direct to checkout if logged in
            navigate(`/client/checkout?planId=${planId}&billing=${billing}`);
        } else {
            navigate(`/login?redirect=/client/checkout&planId=${planId}&billing=${billing}`);
        }
    };

    return (
        <div className="bg-white">
            <PageHeader
                title={t('public.pricingTitle')}
                subtitle={t('public.pricingDesc')}
                icon={CreditCard}
                color="emerald"
            />

            <Section className="-mt-32 relative z-20">
                {/* Calculator */}
                <PlanCalculator plans={plans} onRecommend={handleCalculatorRecommend} />

                <div className="flex justify-center mb-12">
                    <div className="bg-slate-900/5 backdrop-blur-sm p-1.5 rounded-2xl border border-white/20 inline-flex relative shadow-lg">
                        <button
                            onClick={() => setBilling('MONTHLY')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${billing === 'MONTHLY' ? 'bg-white shadow-md text-slate-900 transform scale-105' : 'text-slate-300 hover:text-white'}`}
                        >
                            {t('public.monthly')}
                        </button>
                        <button
                            onClick={() => setBilling('YEARLY')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${billing === 'YEARLY' ? 'bg-white shadow-md text-slate-900 transform scale-105' : 'text-slate-300 hover:text-white'}`}
                        >
                            {t('public.yearly')} <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">-20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map(plan => {
                        const price = billing === 'YEARLY' ? Math.round(plan.price * 0.8) : plan.price;
                        return (
                            <div key={plan.id} className={`group relative p-10 bg-white rounded-[2.5rem] flex flex-col transition-all duration-300 ${plan.isPopular ? 'border-2 border-slate-900 shadow-2xl scale-105 z-10' : 'border border-slate-200 shadow-xl hover:translate-y-[-5px]'}`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                                        <Star size={12} fill="currentColor" /> {t('public.mostPopular')}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
                                </div>

                                <div className="mb-8 pb-8 border-b border-slate-100">
                                    <div className="flex items-baseline">
                                        <span className="text-5xl font-black text-slate-900 tracking-tight">{price}</span>
                                        <span className="text-lg font-bold text-slate-400 ml-2"> {t('common.sar')}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mt-2">per month, billed {billing === 'YEARLY' ? 'annually' : 'monthly'}</p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm group-hover:text-slate-900 transition-colors">
                                            <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-1 shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <Button onClick={() => handleSelectPlan(plan.id)} className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${plan.isPopular ? 'bg-slate-900 hover:bg-blue-600 shadow-xl shadow-slate-900/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                                        {t('public.getStarted')}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Comparison Table (Enhanced) */}
                <div ref={comparisonRef} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden mt-20">
                    <div className="p-10 border-b border-slate-100 bg-slate-50/50 text-center">
                        <h3 className="text-2xl font-black text-slate-900">{t('public.comparePlans')}</h3>
                        <p className="text-slate-500 mt-2">Detailed feature breakdown</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-white">
                                    <th className="p-6 pl-10 text-slate-400 font-bold uppercase tracking-wider text-xs w-1/3">Features</th>
                                    {plans.map(p => (
                                        <th key={p.id} className={`p-6 text-center font-bold text-lg transition-colors duration-500 ${highlightedPlan === p.id ? 'bg-blue-50 text-blue-700' : 'text-slate-900'}`}>
                                            {p.name.split('(')[0]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { name: 'VAT Registration', basic: true, std: true, pro: true },
                                    { name: 'Quarterly Filing', basic: false, std: true, pro: true },
                                    { name: 'Monthly Bookkeeping', basic: false, std: true, pro: true },
                                    { name: 'Dedicated Accountant', basic: false, std: 'Shared Team', pro: 'Dedicated Expert' },
                                    { name: 'Zakat Filing', basic: 'Estimated', std: true, pro: true },
                                    { name: 'Audit Support', basic: false, std: false, pro: true },
                                    { name: 'CFO Consultation', basic: false, std: false, pro: 'Monthly Call' },
                                    { name: 'Fine Guarantee', basic: 'Basic', std: 'Full Coverage', pro: 'Full + Legal' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-5 pl-10 font-bold text-slate-700">{row.name}</td>
                                        <td className={`p-5 text-center transition-colors duration-500 ${highlightedPlan === plans[0].id ? 'bg-blue-50' : ''}`}>
                                            {row.basic === true ? <CheckCircle className="mx-auto text-green-500" size={20} fill="#dcfce7" /> : row.basic === false ? <Minus className="mx-auto text-slate-300" size={20} /> : <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-xs">{row.basic}</span>}
                                        </td>
                                        <td className={`p-5 text-center transition-colors duration-500 ${highlightedPlan === plans[1].id ? 'bg-blue-50' : ''}`}>
                                            {row.std === true ? <CheckCircle className="mx-auto text-green-500" size={20} fill="#dcfce7" /> : row.std === false ? <Minus className="mx-auto text-slate-300" size={20} /> : <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-xs">{row.std}</span>}
                                        </td>
                                        <td className={`p-5 text-center transition-colors duration-500 ${highlightedPlan === plans[2].id ? 'bg-blue-50' : ''}`}>
                                            {row.pro === true ? <CheckCircle className="mx-auto text-green-500" size={20} fill="#dcfce7" /> : row.pro === false ? <Minus className="mx-auto text-slate-300" size={20} /> : <span className="text-slate-900 font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">{row.pro}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </Section>
        </div>
    );
};

export const AboutPage = () => {
    const { t, settings } = useAppContext();
    let dynamicContent: any = null;
    if (settings?.sitePages) {
        try {
            const pages = JSON.parse(settings.sitePages);
            const page = pages.find((p: any) => p.id === 'about');
            if (page?.content) dynamicContent = page.content;
        } catch (e) { }
    }

    return (
        <div className="bg-white">
            <PageHeader
                title={dynamicContent?.pageTitle || t('public.aboutTitle')}
                subtitle={dynamicContent?.subtitle}
                icon={ShieldCheck}
                color="indigo"
            />

            <Section>
                <div className="max-w-4xl mx-auto">
                    {/* Intro Section */}
                    <div className="text-center mb-20 -mt-10">
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-8 leading-tight">
                            {t('public.aboutIntro1')} <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('public.aboutIntro2')}</span>
                        </h2>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-10 backdrop-blur-sm">
                            <h3 className="text-2xl font-bold text-blue-900 mb-4">{t('public.caasTitle')}</h3>
                            <p className="text-xl leading-relaxed text-blue-800/80">
                                {t('public.caasDesc')}
                            </p>
                        </div>
                    </div>

                    {/* The Shield Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-24">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">{t('public.shieldTitle')}</h3>
                            <p className="text-lg font-medium text-slate-800 mb-4">{t('public.shieldDesc1')} <span className="text-blue-600 font-bold bg-blue-50 px-2 rounded">{t('public.shieldDesc2')}</span></p>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {t('public.shieldBody')}
                            </p>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={240} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <Lock className="text-green-400" size={32} />
                                    <h4 className="text-2xl font-bold">{t('public.guaranteeTitle')}</h4>
                                </div>
                                <p className="text-slate-300 mb-8 leading-relaxed text-lg border-l-4 border-green-500 pl-6">
                                    {t('public.guaranteeBody')}
                                </p>
                                <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
                                    <p className="font-bold text-white flex items-center gap-3">
                                        <CheckCircle className="text-green-400" size={24} fill="currentColor" /> {t('public.riskReversal')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tech + Human Loop */}
                    <div className="mb-24 relative">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-black text-slate-900 mb-4">{t('public.techTitle')}</h3>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">{t('public.techDesc')}</p>
                        </div>

                        {/* Connector Line */}
                        <div className="hidden md:block absolute top-[140px] left-0 w-full h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
                            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-blue-200 to-transparent mx-auto"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { title: t('public.inputTitle'), desc: t('public.inputDesc'), icon: Smartphone, color: 'blue' },
                                { title: t('public.processTitle'), desc: t('public.processDesc'), icon: Cpu, color: 'purple' },
                                { title: t('public.outputTitle'), desc: t('public.outputDesc'), icon: CheckCircle, color: 'green' }
                            ].map((step, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl text-center group hover:-translate-y-2 transition-transform duration-300">
                                    <div className="mx-auto w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-lg mb-6 shadow-lg border-4 border-white relative z-10">
                                        {i + 1}
                                    </div>
                                    <div className={`w-20 h-20 mx-auto bg-${step.color}-50 text-${step.color}-600 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-inner`}>
                                        <step.icon size={36} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export const ContactPage = () => {
    const { t, settings } = useAppContext();
    let dynamicContent: any = null;
    if (settings?.sitePages) {
        try {
            const pages = JSON.parse(settings.sitePages);
            const page = pages.find((p: any) => p.id === 'contact');
            if (page?.content) dynamicContent = page.content;
        } catch (e) { }
    }

    return (
        <div className="bg-white">
            <PageHeader
                title={dynamicContent?.pageTitle || t('public.contactTitle')}
                subtitle={dynamicContent?.subtitle}
                icon={Phone}
                color="purple"
            />

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 mb-6">{t('public.getStarted')}</h3>
                            <p className="text-slate-600 text-lg leading-relaxed">{t('public.contactDesc')}</p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                { label: t('auth.email'), value: "support@finume.com", icon: Mail },
                                { label: "Phone", value: "+966 54 000 0000", icon: Phone },
                                { label: t('public.office'), value: t('public.address'), icon: MapPin }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-100 hover:shadow-md transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="font-bold text-slate-900 text-lg">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <form className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">{t('public.name')}</label>
                                    <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">{t('auth.email')}</label>
                                    <input type="email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium" placeholder="john@company.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">{t('public.message')}</label>
                                <textarea rows={5} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium resize-none" placeholder="Tell us about your needs..." />
                            </div>
                            <Button className="w-full py-5 bg-slate-900 hover:bg-purple-600 text-white rounded-xl text-lg font-bold shadow-xl transition-all">
                                {t('public.sendMessage')} <Send size={20} className="ml-2" />
                            </Button>
                        </form>
                    </div>
                </div>
            </Section>
        </div>
    );
};

// --- Simple Pages (Privacy, Terms, QA, Components) ---
// Kept cleaner but consistent structure

const SimplePage = ({ title, icon: Icon, children, pageId }: { title: string, icon: any, children: React.ReactNode, pageId?: string }) => {
    const { settings } = useAppContext();
    let dynamicContent: any = null;

    if (pageId && settings?.sitePages) {
        try {
            const pages = JSON.parse(settings.sitePages);
            const page = pages.find((p: any) => p.id === pageId);
            if (page?.content) dynamicContent = page.content;
        } catch (e) { }
    }

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title={dynamicContent?.pageTitle || title}
                subtitle={dynamicContent?.subtitle}
                icon={Icon}
                color="slate"
            />
            <Section>
                <div className="max-w-4xl mx-auto prose prose-lg prose-slate first-letter:text-4xl first-letter:font-bold first-letter:mr-1">
                    {dynamicContent?.body ? (
                        <div className="whitespace-pre-wrap">{dynamicContent.body}</div>
                    ) : children}
                </div>
            </Section>
        </div>
    );
};

export const QAPage = () => {
    const { t } = useAppContext();
    return (
        <SimplePage title={t('public.faqTitle')} icon={FileQuestion} pageId="help-center">
            <div className="space-y-6 not-prose">
                {[
                    { q: "How are experts vetted?", a: "Every expert undergoes a rigorous 3-step verification process including identity verification, SOCPA certification check, and a technical interview." },
                    { q: "What happens if I'm not satisfied?", a: "We offer a money-back guarantee. If the delivered work doesn't meet the agreed scope, we'll refund your payment or find a replacement expert." },
                    { q: "Is the platform ZATCA compliant?", a: "Yes, all invoicing and tax related services provided through our platform adhere to the latest ZATCA Phase 2 regulations." },
                    { q: "How do payments work?", a: "Payments are held in escrow and only released to the expert once you approve the completed work." }
                ].map((item, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                        <h3 className="font-bold text-xl text-slate-900 mb-3">{item.q}</h3>
                        <p className="text-slate-600 leading-relaxed">{item.a}</p>
                    </div>
                ))}
            </div>
        </SimplePage>
    );
};

export const PrivacyPage = () => {
    const { t } = useAppContext();
    return (
        <SimplePage title={t('pol.privacyTitle')} icon={Shield} pageId="privacy">
            <h3>{t('pol.privacy1Title')}</h3><p>{t('pol.privacy1Desc')}</p>
            <h3>{t('pol.privacy2Title')}</h3><p>{t('pol.privacy2Desc')}</p>
            <h3>{t('pol.privacy3Title')}</h3><p>{t('pol.privacy3Desc')}</p>
            <h3>{t('pol.privacy4Title')}</h3><p>{t('pol.privacy4Desc')}</p>
        </SimplePage>
    );
};

export const CareersPage = () => {
    const { t, settings } = useAppContext();
    let dynamicContent: any = null;
    if (settings?.sitePages) {
        try {
            const pages = JSON.parse(settings.sitePages);
            const page = pages.find((p: any) => p.id === 'careers');
            if (page?.content) dynamicContent = page.content;
        } catch (e) { }
    }

    return (
        <div className="bg-white">
            <PageHeader
                title={dynamicContent?.pageTitle || t('pol.careersTitle')}
                subtitle={dynamicContent?.subtitle || (dynamicContent?.hiringTagline ? `🚀 ${dynamicContent.hiringTagline}` : undefined)}
                icon={UserCheck}
                color="pink"
            />
            <Section>
                <div className="max-w-3xl mx-auto space-y-8">
                    {dynamicContent?.body && (
                        <div className="prose prose-lg prose-slate mb-12 whitespace-pre-wrap">
                            {dynamicContent.body}
                        </div>
                    )}

                    {[
                        { role: "Senior Frontend Engineer", loc: "Riyadh (Remote)", type: "Full-time" },
                        { role: "Product Manager", loc: "Riyadh", type: "Full-time" },
                        { role: "Customer Success Specialist", loc: "Jeddah", type: "Full-time" },
                        { role: "Sales Executive", loc: "Dammam", type: "Full-time" }
                    ].map((job, i) => (
                        <div key={i} className="flex items-center justify-between p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-pink-300 hover:shadow-xl hover:shadow-pink-50 transition-all cursor-pointer group">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900 group-hover:text-pink-600 transition-colors mb-2">{job.role}</h3>
                                <p className="text-slate-500 font-medium flex items-center gap-2"><MapPin size={16} /> {job.loc} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {job.type}</p>
                            </div>
                            <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900">{t('pol.applyNow')}</Button>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
};

export const TermsPage = () => {
    const { t } = useAppContext();
    return (
        <SimplePage title={t('pol.termsTitle')} icon={FileText} pageId="terms">
            <h3>{t('pol.terms1Title')}</h3><p>{t('pol.terms1Desc')}</p>
            <h3>{t('pol.terms2Title')}</h3><p>{t('pol.terms2Desc')}</p>
            <h3>{t('pol.terms3Title')}</h3><p>{t('pol.terms3Desc')}</p>
            <h3>{t('pol.terms4Title')}</h3><p>{t('pol.terms4Desc')}</p>
        </SimplePage>
    );
};

export const CompliancePage = () => {
    const { t } = useAppContext();
    return (
        <SimplePage title={t('pol.complianceTitle')} icon={ShieldCheck} pageId="zatca-guide">
            <div className="bg-green-50 border border-green-200 p-8 rounded-3xl mb-10 not-prose">
                <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2"><CheckCircle size={24} /> {t('pol.compPhase2')}</h3>
                <p className="text-green-700 text-lg">{t('pol.compPhase2Desc')}</p>
            </div>
            <h3>{t('pol.compCommit')}</h3> <p>{t('pol.compCommitDesc')}</p>
            <h3>{t('pol.compServices')}</h3>
            <ul>
                <li>{t('pol.compList1')}</li>
                <li>{t('pol.compList2')}</li>
                <li>{t('pol.compList3')}</li>
                <li>{t('pol.compList4')}</li>
                <li>{t('pol.compList5')}</li>
            </ul>
        </SimplePage>
    );
};

// Import Send icon which was missing in imports but used in Contact
import { Send } from 'lucide-react';
