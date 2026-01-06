import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../UI';
import {
    Briefcase, FileText, BookOpen, Search, Coins, TrendingUp,
    Layout, Check, Star, CreditCard, Minus, CheckCircle, ArrowRight
} from 'lucide-react';

interface ServiceCatalogProps {
    onSelectService: (serviceId: string) => void;
    onSelectPlan: (planId: string) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectService, onSelectPlan }) => {
    const { services, plans, t } = useAppContext();
    const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');

    const getIcon = (name: string) => {
        if (name.includes('VAT')) return FileText;
        if (name.includes('Bookkeeping')) return BookOpen;
        if (name.includes('Audit')) return Search;
        if (name.includes('Zakat')) return Coins;
        if (name.includes('CFO')) return TrendingUp;
        return Briefcase;
    };

    return (
        <div className="space-y-12">

            {/* Services Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600">
                        <Briefcase size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('public.servicesTitle')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => {
                        const Icon = getIcon(service.nameEn);
                        return (
                            <div key={service.id} className="group flex flex-col bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.nameEn}</h3>
                                <p className="text-gray-500 mb-6 flex-1 text-sm leading-relaxed">{service.description}</p>

                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('public.startingFrom')}</p>
                                        <p className="text-lg font-black text-gray-900">{service.price.toLocaleString()} <span className="text-xs text-gray-400 font-medium">{t('common.sar')}</span></p>
                                    </div>
                                    <Button onClick={() => onSelectService(service.id)} className="bg-gray-900 hover:bg-blue-600 text-white rounded-lg px-4 py-2 font-bold transition-colors shadow-lg shadow-gray-200 text-sm">
                                        {t('public.bookNow')}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-6 pt-8 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-600">
                            <CreditCard size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('public.pricingTitle')}</h2>
                    </div>

                    <div className="bg-gray-100 p-1 rounded-xl inline-flex self-start sm:self-auto">
                        <button
                            onClick={() => setBilling('MONTHLY')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${billing === 'MONTHLY' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('public.monthly')}
                        </button>
                        <button
                            onClick={() => setBilling('YEARLY')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${billing === 'YEARLY' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('public.yearly')} <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">-20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => {
                        const price = billing === 'YEARLY' ? Math.round(plan.price * 0.8) : plan.price;
                        return (
                            <div key={plan.id} className={`group relative p-6 bg-white rounded-3xl flex flex-col transition-all duration-300 ${plan.isPopular ? 'border-2 border-gray-900 shadow-xl scale-105 z-10' : 'border border-gray-200 shadow-sm hover:border-gray-300'}`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                                        <Star size={10} fill="currentColor" /> {t('public.mostPopular')}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed">{plan.description}</p>
                                </div>

                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-black text-gray-900 tracking-tight">{price}</span>
                                        <span className="text-sm font-bold text-gray-400 ml-1"> {t('common.sar')}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs font-medium mt-1">/{billing === 'YEARLY' ? 'year' : 'month'}</p>
                                </div>

                                <ul className="space-y-3 mb-6 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-600 font-medium text-xs group-hover:text-gray-900 transition-colors">
                                            <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5 shrink-0">
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <Button onClick={() => onSelectPlan(plan.id)} className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.isPopular ? 'bg-gray-900 hover:bg-blue-600 shadow-lg shadow-gray-900/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                        {t('public.getStarted')}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
