
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/UI';
import { User, Mail, Briefcase, DollarSign, Award, CheckCircle, Upload, Shield, ArrowRight, Star, TrendingUp, Users, Globe } from 'lucide-react';
import { Expert } from '../types';
import { Logo } from '../components/Logo';

const JoinExpert = () => {
    const { addExpert, login, t, language, setLanguage } = useAppContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        bio: '',
        yearsExperience: 0,
        hourlyRate: 0,
        linkedin: '',
        specializations: [] as string[],
        certifications: [] as string[],
        cvFile: null as File | null,
    });

    const [specializationInput, setSpecializationInput] = useState('');
    const [selectedServiceKey, setSelectedServiceKey] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Specific services requested by user
    const specificServices = [
        'bookkeeping',
        'vatFilling',
        'financialAudit',
        'zakatAdvisory',
        'cfoAdvisory'
    ];

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'other') {
            setIsOtherSelected(true);
            setSelectedServiceKey('other');
        } else {
            setIsOtherSelected(false);
            setSelectedServiceKey(value);

            // Get the translated name for display/storage
            const translatedName = t(`joinExpert.services.${value}`);
            if (value && !formData.specializations.includes(translatedName)) {
                setFormData(prev => ({
                    ...prev,
                    specializations: [...prev.specializations, translatedName]
                }));
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, cvFile: e.target.files![0] }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSpecialization = () => {
        if (specializationInput.trim()) {
            setFormData(prev => ({
                ...prev,
                specializations: [...prev.specializations, specializationInput.trim()]
            }));
            setSpecializationInput('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newExpert: Expert = {
            id: `EXP-${Date.now()}`,
            role: 'EXPERT',
            name: formData.name,
            email: formData.email,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
            bio: formData.bio,
            yearsExperience: Number(formData.yearsExperience),
            hourlyRate: Number(formData.hourlyRate),
            specializations: formData.specializations.length > 0 ? formData.specializations : ['General Accounting'],
            status: 'VETTING',
            rating: 0.0,
            totalEarned: 0,
            isPremium: false,
            isFeatured: false,
        };

        addExpert(newExpert);
        login(newExpert.email, 'EXPERT', newExpert);
        navigate('/expert');
    };

    return (
        <div className="min-h-screen flex bg-gray-900 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Left Sidebar - Visuals (Glassmorphic) */}
            <div className="hidden lg:flex lg:w-5/12 relative bg-[#0F172A] text-white overflow-hidden flex-col justify-between p-12">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[100px] animate-blob"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[100px] animate-blob animation-delay-2000"></div>
                </div>
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-12 group w-fit">
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl group-hover:bg-white/20 transition-colors border border-white/10">
                            <Logo size={28} className="text-primary-400" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">FINUME</span>
                    </Link>

                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: t('joinExpert.leftTitle') }}></h1>
                    <p className="text-slate-400 text-lg mb-12 max-w-md leading-relaxed border-l-2 border-primary-500/30 pl-6 rtl:pl-0 rtl:border-l-0 rtl:border-r-2 rtl:pr-6">
                        {t('joinExpert.leftDesc')}
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: DollarSign, title: t('joinExpert.highValue'), desc: t('joinExpert.highValueDesc'), color: 'text-green-400', bg: 'bg-green-400/10' },
                            { icon: TrendingUp, title: t('joinExpert.careerGrowth'), desc: t('joinExpert.careerGrowthDesc'), color: 'text-blue-400', bg: 'bg-blue-400/10' },
                            { icon: Users, title: t('joinExpert.exclusiveCommunity'), desc: t('joinExpert.exclusiveCommunityDesc'), color: 'text-purple-400', bg: 'bg-purple-400/10' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className={`p-4 rounded-2xl border border-white/5 h-fit backdrop-blur-sm transition-all duration-300 group-hover:bg-white/5 ${item.bg}`}>
                                    <item.icon size={24} className={item.color} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1 text-slate-100">{item.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                        <div className="flex -space-x-3 rtl:space-x-reverse">
                            {[1, 2, 3, 4].map(i => (
                                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" />
                            ))}
                        </div>
                        <p className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: t('joinExpert.joinCount') }}></p>
                    </div>
                </div>
            </div>

            {/* Right Content - Form */}
            <div className="lg:w-7/12 flex flex-col justify-center p-4 lg:p-12 bg-white relative">
                {/* Top Right Decorative & Language Switcher */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-0"></div>

                <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-bold text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full"
                    >
                        <Globe size={18} />
                        <span>{language === 'en' ? 'AR' : 'EN'}</span>
                    </button>
                </div>

                <div className="max-w-2xl mx-auto w-full relative z-10">
                    <div className="mb-10 text-center lg:text-left rtl:lg:text-right">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider mb-4 border border-primary-100">
                            {t('auth.expert')} Application
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('joinExpert.formTitle')}</h2>
                        <p className="text-slate-500 text-lg">{t('joinExpert.formDesc')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* Section 1: Personal Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3 border-b border-slate-100 pb-3">
                                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm shadow-md">1</span>
                                {t('joinExpert.aboutYou')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('auth.fullName')}</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium placehoder:text-slate-400" placeholder="e.g. Sarah Ahmed" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('auth.email')}</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium" placeholder="name@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('auth.password')}</label>
                                    <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium" placeholder="••••••••" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('joinExpert.phone')}</label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium" placeholder="+966 5..." />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('joinExpert.linkedinUrl')}</label>
                                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium" placeholder="linkedin.com/in/..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Expertise */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3 border-b border-slate-100 pb-3">
                                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm shadow-md">2</span>
                                {t('joinExpert.expertise')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('joinExpert.yearsEx')}</label>
                                    <input required type="number" name="yearsExperience" min="1" value={formData.yearsExperience} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('joinExpert.hourlyRate')}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{t('common.sar')}</span>
                                        <input required type="number" name="hourlyRate" min="50" value={formData.hourlyRate} onChange={handleChange} className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium" placeholder="200" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('joinExpert.specializations')}</label>
                                    <div className="flex flex-col gap-3 mb-2">
                                        <select
                                            value={selectedServiceKey}
                                            onChange={handleServiceSelect}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-medium appearance-none cursor-pointer"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: language === 'ar' ? 'left 1rem center' : 'right 1rem center', backgroundSize: '0.65em auto' }}
                                        >
                                            <option value="">{t('joinExpert.selectSpecialization')}</option>
                                            {specificServices.map(key => (
                                                <option key={key} value={key}>{t(`joinExpert.services.${key}`)}</option>
                                            ))}
                                            <option value="other">{t('common.other') || "Other"}</option>
                                        </select>

                                        {isOtherSelected && (
                                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                                                <input
                                                    type="text"
                                                    value={specializationInput}
                                                    onChange={(e) => setSpecializationInput(e.target.value)}
                                                    className="flex-1 px-4 py-3 bg-white border border-primary-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                                                    placeholder={t('joinExpert.addSkillPlaceholder')}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                                                    autoFocus
                                                />
                                                <Button type="button" onClick={handleAddSpecialization} variant="secondary" className="rounded-xl px-6 font-bold">{t('joinExpert.add')}</Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                                        {formData.specializations.map((spec, idx) => (
                                            <span key={idx} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm animate-in zoom-in-50 duration-200">
                                                {spec}
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, specializations: prev.specializations.filter((_, i) => i !== idx) }))} className="hover:text-red-300 transition-colors">
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">{t('joinExpert.bio')}</label>
                                    <textarea required name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium" placeholder={t('joinExpert.bioPlaceholder')} />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Verification */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3 border-b border-slate-100 pb-3">
                                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm shadow-md">3</span>
                                {t('joinExpert.verification')}
                            </h3>
                            <div
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group ${formData.cvFile ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                />
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transition-transform group-hover:scale-110 ${formData.cvFile ? 'bg-primary-100 text-primary-600' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                    {formData.cvFile ? <CheckCircle size={28} /> : <Upload size={28} />}
                                </div>
                                <p className="font-bold text-slate-900 text-lg mb-1">
                                    {formData.cvFile ? formData.cvFile.name : t('joinExpert.uploadCv')}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">{t('joinExpert.fileType')}</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-xs text-slate-400 max-w-xs leading-relaxed text-center sm:text-start">{t('joinExpert.submitAgreement')}</p>
                            <Button type="submit" size="lg" className="bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 px-10 py-4 rounded-xl text-base w-full sm:w-auto h-auto transition-all hover:-translate-y-1">
                                {t('joinExpert.submit')} <ArrowRight size={20} className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};


export default JoinExpert;
