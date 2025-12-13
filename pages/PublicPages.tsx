import React, { useState } from 'react';
import { 
  Shield, Info, Phone, Briefcase, FileText, 
  CheckCircle, CreditCard, 
  UserCheck, Mail, Building, ShieldCheck, FileQuestion, Smartphone, Cpu, Check,
  BookOpen, Search, Coins, TrendingUp, Layout, Minus, HelpCircle, ArrowRight,
  MessageCircle, FileCheck, Zap, Lock
} from 'lucide-react';
import { Button } from '../components/UI';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// --- Shared Components ---

const PageContent = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="max-w-7xl mx-auto px-6 py-12">
    <div className="flex items-center gap-3 mb-12 justify-center">
        <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <Icon size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
    </div>
    <div className="max-w-5xl mx-auto">
        {children}
    </div>
  </div>
);

export const ServicesPage = () => {
    const { services, user } = useAppContext();
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
            navigate('/client', { state: { action: 'book_service', serviceId } });
        } else {
            navigate(`/login?redirect=/client&action=book_service&serviceId=${serviceId}`);
        }
    };

    return (
        <PageContent title="Professional Financial Services" icon={Briefcase}>
            <div className="text-center max-w-2xl mx-auto mb-16 -mt-6">
                <p className="text-lg text-gray-500">
                    From daily bookkeeping to complex Zakat filings, our network of certified experts covers every aspect of financial compliance in Saudi Arabia.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {services.map(service => {
                    const Icon = getIcon(service.nameEn);
                    return (
                        <div key={service.id} className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex flex-col">
                            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                                <Icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{service.nameEn}</h3>
                            <p className="text-gray-500 mb-6 flex-1 leading-relaxed">{service.description}</p>
                            
                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Starting from</p>
                                    <p className="text-xl font-bold text-primary-600">{service.price.toLocaleString()} <span className="text-sm text-gray-500 font-normal">SAR</span></p>
                                </div>
                                <Button size="sm" onClick={() => handleBookService(service.id)} className="shadow-none bg-gray-900 hover:bg-gray-800">
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    )
                })}
                
                {/* Custom Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-lg text-white flex flex-col">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6">
                        <Layout size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Custom Enterprise Solution</h3>
                    <p className="text-gray-300 mb-6 flex-1 leading-relaxed">Need a tailored package for multiple entities or complex consolidation? Let's build a plan that fits.</p>
                    <div className="pt-6 border-t border-gray-700 mt-auto">
                        <Link to="/contact">
                            <Button size="sm" className="w-full bg-white text-gray-900 hover:bg-gray-100 border-none">Contact Sales</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Process Section */}
            <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-12">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Connecting line */}
                    <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>
                    
                    {[
                        { step: 1, title: 'Select Service', desc: 'Choose from our catalog or post a custom request.' },
                        { step: 2, title: 'Get Matched', desc: 'Our AI matches you with a certified expert instantly.' },
                        { step: 3, title: 'Expert Delivery', desc: 'Work begins immediately via our secure platform.' },
                        { step: 4, title: 'Approval', desc: 'Review deliverables and release payment only when happy.' }
                    ].map((item) => (
                        <div key={item.step} className="relative"> 
                            <div className="w-16 h-16 bg-white border-4 border-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-sm relative z-10">
                                {item.step}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </PageContent>
    );
};

export const PricingPage = () => {
    const { plans, user } = useAppContext();
    const navigate = useNavigate();
    const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');

    const handleSelectPlan = (planId: string) => {
        if (user) {
            navigate('/client', { state: { action: 'subscribe_plan', planId } });
        } else {
            navigate(`/login?redirect=/client&action=subscribe_plan&planId=${planId}`);
        }
    };

    return (
        <PageContent title="Transparent Pricing" icon={CreditCard}>
            <div className="text-center max-w-2xl mx-auto -mt-6 mb-12">
                <p className="text-lg text-gray-500 mb-8">
                    Simple, flat-rate pricing for peace of mind. No hidden fees, no hourly billing surprises.
                </p>
                
                {/* Toggle */}
                <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200 relative">
                    <button 
                        onClick={() => setBilling('MONTHLY')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billing === 'MONTHLY' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBilling('YEARLY')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billing === 'YEARLY' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Yearly <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">-20%</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {plans.map(plan => {
                    const price = billing === 'YEARLY' ? Math.round(plan.price * 0.8) : plan.price;
                    
                    return (
                        <div key={plan.id} className={`relative p-8 bg-white rounded-2xl flex flex-col ${plan.isPopular ? 'border-2 border-primary-500 shadow-xl scale-105 z-10' : 'border border-gray-200 shadow-sm'}`}>
                            {plan.isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Most Popular</div>}
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <p className="text-gray-500 text-sm mb-6 h-10">{plan.description}</p>
                            
                            <div className="mb-6">
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-extrabold text-gray-900">{price}</span>
                                    <span className="text-lg font-medium text-gray-500 ml-1"> SAR / mo</span>
                                </div>
                                {billing === 'YEARLY' && (
                                    <p className="text-xs text-green-600 font-medium mt-2">Billed {Math.round(price * 12).toLocaleString()} SAR yearly</p>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                                        <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5">
                                            <Check size={12} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="mt-auto">
                                <Button onClick={() => handleSelectPlan(plan.id)} className={`w-full py-3 ${plan.isPopular ? 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30' : 'bg-gray-900 hover:bg-gray-800'}`}>
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-16">
                <div className="p-8 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-2xl font-bold text-gray-900 text-center">Compare Plans</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 pl-8 text-gray-500 font-medium w-1/3">Features</th>
                                {plans.map(p => <th key={p.id} className="p-4 text-center font-bold text-gray-900">{p.name.split('(')[0]}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { name: 'VAT Registration', basic: true, std: true, pro: true },
                                { name: 'Quarterly Filing', basic: false, std: true, pro: true },
                                { name: 'Monthly Bookkeeping', basic: false, std: true, pro: true },
                                { name: 'Dedicated Accountant', basic: false, std: 'Shared', pro: 'Dedicated' },
                                { name: 'Zakat Filing', basic: 'Estimated', std: true, pro: true },
                                { name: 'Audit Support', basic: false, std: false, pro: true },
                                { name: 'CFO Consultation', basic: false, std: false, pro: 'Monthly' },
                                { name: 'Fine Guarantee', basic: 'Basic', std: 'Full', pro: 'Full + Legal' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 pl-8 font-medium text-gray-700">{row.name}</td>
                                    <td className="p-4 text-center">
                                        {row.basic === true ? <Check className="mx-auto text-green-500" size={18} /> : row.basic === false ? <Minus className="mx-auto text-gray-300" size={18} /> : <span className="text-gray-600">{row.basic}</span>}
                                    </td>
                                    <td className="p-4 text-center">
                                        {row.std === true ? <Check className="mx-auto text-green-500" size={18} /> : row.std === false ? <Minus className="mx-auto text-gray-300" size={18} /> : <span className="text-gray-600">{row.std}</span>}
                                    </td>
                                    <td className="p-4 text-center">
                                        {row.pro === true ? <Check className="mx-auto text-green-500" size={18} /> : row.pro === false ? <Minus className="mx-auto text-gray-300" size={18} /> : <span className="text-gray-900 font-bold">{row.pro}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    {[
                        { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade at any time. Prorated charges will apply." },
                        { q: "What is the Fine Guarantee?", a: "If you incur a fine due to our error while on a covered plan, we pay it. Period." },
                        { q: "Is VAT included in the price?", a: "Prices shown are exclusive of VAT. 15% VAT will be added at checkout." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><HelpCircle size={16} className="text-primary-500" /> {item.q}</h4>
                            <p className="text-gray-600 ml-6">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </PageContent>
    );
};

export const QAPage = () => (
    <PageContent title="Frequently Asked Questions" icon={FileQuestion}>
        <div className="space-y-6 max-w-3xl mx-auto">
            {[
                { q: "How are experts vetted?", a: "Every expert undergoes a rigorous 3-step verification process including identity verification, SOCPA certification check, and a technical interview." },
                { q: "What happens if I'm not satisfied?", a: "We offer a money-back guarantee. If the delivered work doesn't meet the agreed scope, we'll refund your payment or find a replacement expert." },
                { q: "Is the platform ZATCA compliant?", a: "Yes, all invoicing and tax related services provided through our platform adhere to the latest ZATCA Phase 2 regulations." },
                { q: "How do payments work?", a: "Payments are held in escrow and only released to the expert once you approve the completed work." }
            ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.q}</h3>
                    <p className="text-gray-600">{item.a}</p>
                </div>
            ))}
        </div>
    </PageContent>
);

export const AboutPage = () => (
    <PageContent title="The 'Fine Protection' Marketplace" icon={ShieldCheck}>
        <div className="prose prose-lg text-gray-600 mx-auto max-w-none">
            
            {/* Intro Section - SEO Enhanced */}
            <div className="text-center max-w-4xl mx-auto mb-16 -mt-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    We don't just sell accounting. <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">We sell safety.</span>
                </h2>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Compliance as a Service (CaaS)</h3>
                    <p className="text-xl leading-relaxed text-gray-700">
                        We replace the expensive "Full-Time Accountant" with a tech-enabled <span className="font-bold text-primary-700 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm border border-primary-100">"Fine Protection Subscription."</span>
                    </p>
                </div>
            </div>

            {/* The Shield Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch mb-24">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Shield size={32} /></div>
                        <h3 className="text-2xl font-bold text-gray-900 m-0">The "Shield" Model</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-800 mb-4">We don't sell hours; <span className="text-blue-600 font-bold">we sell outcomes.</span></p>
                    <p className="text-gray-600 leading-relaxed">
                        Our vetted accountants leverage proprietary automation tools to handle compliance efficiently for 60+ clients simultaneously. This allows us to offer enterprise-grade financial protection at a price accessible to every SME in Saudi Arabia.
                    </p>
                </div>
                
                <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 transition-transform group-hover:scale-110">
                        <ShieldCheck size={200} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Lock className="text-green-400" size={28} /> The Fine Guarantee
                        </h4>
                        <p className="text-gray-300 mb-8 leading-relaxed text-lg border-l-4 border-green-500 pl-4">
                            The only platform in KSA that <strong>pays the fine</strong> if we make a mistake.
                        </p>
                        <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-4">
                            <p className="font-bold text-white flex items-center gap-2">
                                <CheckCircle className="text-green-400" size={20} /> Risk Reversal: 100% Protected
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it Works - Tech + Human Loop (Flow) */}
            <div className="mb-24 relative">
                <div className="text-center mb-16">
                    <h3 className="text-3xl font-extrabold text-gray-900">Technology + Human Loop</h3>
                    <p className="text-gray-500 mt-2">The engine behind your safety.</p>
                </div>
                
                {/* Visual Flow Connector (Desktop) */}
                <div className="hidden md:block absolute top-[60%] left-0 w-full h-2 bg-gray-100 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-green-100 via-blue-100 to-green-100 opacity-50"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1: Input */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg relative text-center hover:-translate-y-2 transition-transform duration-300 group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md z-20">1</div>
                        <div className="w-20 h-20 mx-auto bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            <Smartphone size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Input</h4>
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                            SME owner snaps a photo of an invoice via <span className="font-bold text-gray-900 inline-flex items-center gap-1 mx-1"><MessageCircle size={14} className="text-green-500"/> WhatsApp</span> or our App.
                        </p>
                    </div>

                    {/* Step 2: Process */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg relative text-center hover:-translate-y-2 transition-transform duration-300 group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md z-20">2</div>
                        <div className="w-20 h-20 mx-auto bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            <Cpu size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Process</h4>
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                            <span className="font-bold text-purple-700 inline-flex items-center gap-1"><Zap size={14}/> Automation engine</span> categorizes it + <span className="font-bold text-gray-900 inline-flex items-center gap-1"><UserCheck size={14}/> Human Accountant</span> verifies it.
                        </p>
                    </div>

                    {/* Step 3: Output */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg relative text-center hover:-translate-y-2 transition-transform duration-300 group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md z-20">3</div>
                        <div className="w-20 h-20 mx-auto bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            <CheckCircle size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Output</h4>
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                            <span className="font-bold text-gray-900 inline-flex items-center gap-1"><FileCheck size={14} className="text-blue-500"/> ZATCA-compliant</span> filing and guaranteed <span className="font-bold text-green-600 inline-flex items-center gap-1 bg-green-100 px-1.5 py-0.5 rounded border border-green-200 uppercase text-xs tracking-wider">"Green"</span> status.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-gray-100 pt-12">
                <div>
                    <div className="text-4xl font-extrabold text-primary-600 mb-2">500+</div>
                    <div className="text-gray-500 font-medium uppercase tracking-wide text-sm">Active Companies</div>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-primary-600 mb-2">100%</div>
                    <div className="text-gray-500 font-medium uppercase tracking-wide text-sm">ZATCA Compliant</div>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-green-500 mb-2">0 SAR</div>
                    <div className="text-gray-500 font-medium uppercase tracking-wide text-sm">Fines Incurred</div>
                </div>
            </div>
        </div>
    </PageContent>
);

export const CareersPage = () => (
    <PageContent title="Join Our Team" icon={UserCheck}>
        <div className="text-center mb-12">
            <p className="text-xl text-gray-600">We're building the future of financial services in MENA.</p>
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
            {[
                { role: "Senior Frontend Engineer", loc: "Riyadh (Remote)", type: "Full-time" },
                { role: "Product Manager", loc: "Riyadh", type: "Full-time" },
                { role: "Customer Success Specialist", loc: "Jeddah", type: "Full-time" },
                { role: "Sales Executive", loc: "Dammam", type: "Full-time" }
            ].map((job, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-primary-500 transition-colors cursor-pointer group">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">{job.role}</h3>
                        <p className="text-gray-500 text-sm">{job.loc} • {job.type}</p>
                    </div>
                    <Button variant="outline" size="sm">Apply Now</Button>
                </div>
            ))}
        </div>
    </PageContent>
);

export const ContactPage = () => (
    <PageContent title="Contact Us" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Get in touch</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Have questions about our services or need help finding an expert? Our team is here to help you navigate your financial journey.</p>
                </div>
                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mt-1"><Mail size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Email</p>
                            <p className="font-medium text-gray-900 text-lg">support@finume.com</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mt-1"><Phone size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Phone</p>
                            <p className="font-medium text-gray-900 text-lg">+966 54 000 0000</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mt-1"><Building size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Office</p>
                            <p className="font-medium text-gray-900">King Fahd Rd, Olaya Dist, Riyadh</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
                <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                        <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Your name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="you@company.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                        <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="How can we help?" />
                    </div>
                    <Button className="w-full py-3 shadow-lg bg-gray-900 hover:bg-gray-800">Send Message</Button>
                </form>
            </div>
        </div>
    </PageContent>
);

export const PrivacyPage = () => (
    <PageContent title="Privacy Policy" icon={Shield}>
        <div className="prose prose-blue text-gray-600 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Information Collection</h3>
            <p className="mb-6">We collect information that you provide directly to us, including your name, email address, company details, and payment information when you register for an account or purchase services.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Use of Information</h3>
            <p className="mb-6">We use the information we collect to provide, maintain, and improve our services, match you with experts, process payments, and communicate with you.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">3. Data Security</h3>
            <p className="mb-6">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">4. Sharing of Information</h3>
            <p className="mb-6">We do not share your personal information with third parties except as described in this policy, such as with our vetted experts to facilitate your requests.</p>
        </div>
    </PageContent>
);

export const TermsPage = () => (
    <PageContent title="Terms of Service" icon={FileText}>
        <div className="prose prose-blue text-gray-600 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h3>
            <p className="mb-6">By accessing or using Finume, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our services.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Services</h3>
            <p className="mb-6">Finume connects businesses with independent financial experts. We are not a financial firm and do not provide financial advice directly. The experts are independent contractors.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">3. User Responsibilities</h3>
            <p className="mb-6">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h3>
            <p className="mb-6">Finume shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the services.</p>
        </div>
    </PageContent>
);

export const CompliancePage = () => (
    <PageContent title="ZATCA Compliance" icon={ShieldCheck}>
        <div className="prose prose-blue text-gray-600 max-w-3xl mx-auto">
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-8">
                <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center gap-2"><CheckCircle size={20}/> Phase 2 Ready</h3>
                <p className="text-green-700">Our platform and experts are fully equipped to handle ZATCA Phase 2 E-Invoicing integration and reporting requirements.</p>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Commitment</h3>
            <p className="mb-6">We ensure that all financial experts on our platform are knowledgeable about the latest regulations from the Zakat, Tax and Customs Authority (ZATCA).</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">Services Covered</h3>
            <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>VAT Registration & Deregistration</li>
                <li>Monthly & Quarterly VAT Filing</li>
                <li>Zakat Calculation & Filing</li>
                <li>E-Invoicing Implementation & Support</li>
                <li>Compliance Audits</li>
            </ul>
        </div>
    </PageContent>
);