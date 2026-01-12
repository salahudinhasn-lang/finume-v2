
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { Star, MapPin, Briefcase, CheckCircle, Crown, Award, Search, Sparkles, Filter, X, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Expert, Service, Request } from '../../types';
import { generateAIResponse } from '../../services/geminiService';

const BrowseExperts = () => {
    const { experts, services, user, addRequest } = useAppContext();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');

    // AI Match State
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchInput, setMatchInput] = useState('');
    const [isMatching, setIsMatching] = useState(false);
    const [matchedService, setMatchedService] = useState<Service | null>(null);



    // Filter for ACTIVE experts only (removed isPremium check from here to include all, but will process them differently)
    const activeExperts = experts.filter(e => e.status === 'ACTIVE');

    // Advanced Filtering and Sorting
    const filteredExperts = activeExperts.filter(e => {
        const matchesFilter = filter === 'All' || (e.specializations || []).includes(filter);
        const matchesSearch =
            (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (e.specializations || []).some(s => (s || '').toLowerCase().includes(search.toLowerCase())) ||
            (e.bio || '').toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    }).sort((a, b) => {
        // Sort Priority: Premium > Rating > ID
        if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
        return b.rating - a.rating;
    });

    const allSpecializations = Array.from(new Set(activeExperts.flatMap(e => e.specializations)));

    // Specific Finance Skills for Sidebar
    const financeSkills = [
        "VAT Compliance", "Zakat Filing", "Bookkeeping", "Financial Modeling",
        "Auditing", "CFO Advisory", "Corporate Tax", "Payroll Management",
        "Cost Accounting", "Feasibility Studies", "Risk Management", "M&A Advisory"
    ];

    const handleHire = (expertId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedExpertId(expertId);
    };

    // ... (rest of match logic unchanged) ...

    const handleMatchClick = () => {
        setShowMatchModal(true);
        setMatchInput('');
        setMatchedService(null);
    };

    const performAIMatch = async () => {
        if (!matchInput.trim()) return;
        setIsMatching(true);

        try {
            const prompt = `
            You are a helpful financial service matching assistant for the Finume platform.
            
            User's Requirement: "${matchInput}"
            
            Available Services:
            ${services.map(s => `- ID: ${s.id}, Name: ${s.nameEn}, Description: ${s.description}`).join('\n')}
            
            Task: Analyze the user's requirement and select the single most relevant Service ID from the list.
            If the requirement is vague, select the most general advisory service (usually CFO Advisory or Bookkeeping).
            
            Output: Return ONLY the ID string of the service (e.g., S1, S2). Do not add any text.
          `;

            const result = await generateAIResponse(prompt);
            const serviceId = result.trim().replace(/[^a-zA-Z0-9-]/g, ''); // Clean up ID
            const service = services.find(s => s.id === serviceId);

            if (service) {
                setMatchedService(service);
            } else {
                // Fallback if AI hallucinates an ID
                setMatchedService(services[0]);
            }
        } catch (error) {
            console.error("AI Match failed", error);
            setMatchedService(services[0]); // Fallback
        } finally {
            setIsMatching(false);
        }
    };

    const proceedWithMatch = () => {
        if (!matchedService) return;

        if (user) {
            // Logged in: Create Request directly
            const req: Request = {
                id: `REQ-${Math.floor(Math.random() * 100000)}`,
                clientId: user.id,
                clientName: user.name,
                serviceId: matchedService.id,
                serviceName: matchedService.nameEn,
                status: 'PENDING_PAYMENT',
                amount: matchedService.price,
                dateCreated: new Date().toISOString().split('T')[0],
                description: `AI Matched Request based on: "${matchInput}". Client requested admin assignment.`
            };
            addRequest(req);
            navigate(`/client/request-received/${req.id}`);
        } else {
            // Not logged in: Redirect to register with params - logic handled in Register to eventually redirect to Request Received?
            // Actually, we should probably redirect to Service Page or Expert Page in a real flow if they aren't logged in, 
            // but for now keeping it simple. But ideally we want to preserve the "Request" intent.
            // Let's redirect to login which then redirects to this page, or handle it via query params.
            // For now, simpler:
            navigate(`/login?redirect=/client/experts`);
        }
        setShowMatchModal(false);
    };

    const confirmHire = () => {
        if (!user || !selectedExpertId || !selectedServiceId) return;

        const expert = experts.find(e => e.id === selectedExpertId);
        const service = services.find(s => s.id === selectedServiceId);

        if (expert && service) {
            const req: Request = {
                id: `REQ-${Math.floor(Math.random() * 100000)}`,
                clientId: user.id,
                clientName: user.name,
                serviceId: service.id,
                serviceName: service.nameEn,
                status: 'PENDING_PAYMENT',
                amount: service.price,
                dateCreated: new Date().toISOString().split('T')[0],
                assignedExpertId: expert.id,
                expertName: expert.name,
                description: `Direct hire request for ${service.nameEn}`
            };
            addRequest(req);
            navigate(`/client/request-received/${req.id}`);
        }
    };

    const ExpertCard: React.FC<{ expert: Expert, isFeatured?: boolean }> = ({ expert, isFeatured }) => {
        const isPremium = expert.isPremium;

        return (
            <Card className={`flex flex-col h-full transition-all duration-300 relative group overflow-hidden ${isPremium ? 'border-amber-200 hover:shadow-xl' : 'border-gray-100 opacity-80'}`}>
                {isPremium && (
                    <div className="absolute top-0 right-0 p-3 z-10">
                        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white p-1.5 rounded-full shadow-lg" title="Premium Expert">
                            <Crown size={14} fill="currentColor" />
                        </div>
                    </div>
                )}

                {/* Background Header */}
                <div className={`h-20 w-full ${isPremium ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gray-100'}`}></div>

                <div className="px-6 relative flex-1 flex flex-col">
                    <div className="flex justify-between items-end -mt-10 mb-4">
                        <div className="relative">
                            <img
                                src={expert.avatarUrl}
                                alt={isPremium ? expert.name : "Hidden"}
                                className={`w-20 h-20 rounded-full bg-white object-cover border-4 ${isPremium ? 'border-amber-100' : 'border-white blur-sm'} shadow-md`}
                            />
                            {isPremium && <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="Online"></div>}
                        </div>
                        <div className="flex flex-col items-end">
                            {isPremium ? (
                                <>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
                                        <Star size={18} fill="currentColor" /> {expert.rating.toFixed(1)}
                                    </div>
                                    <span className="text-xs text-gray-400">(24 reviews)</span>
                                </>
                            ) : (
                                <div className="flex items-center gap-1 text-gray-300 font-bold text-lg blur-[2px]">
                                    <Star size={18} /> 4.0
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-bold text-gray-900 truncate ${!isPremium && 'blur-sm select-none'}`}>
                                {isPremium ? expert.name : 'Expert Hidden'}
                            </h3>
                            {expert.isFeatured && isPremium && <Award size={16} className="text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Briefcase size={14} />
                            <span>{expert.yearsExperience} Years Exp.</span>
                            <span>•</span>
                            <span className="text-green-600 font-medium">98% Job Success</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {expert.specializations.slice(0, 3).map(spec => (
                            <span key={spec} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                {spec}
                            </span>
                        ))}
                    </div>

                    <p className={`text-sm text-gray-600 line-clamp-2 mb-6 flex-1 ${!isPremium && 'blur-sm select-none'}`}>
                        {expert.bio}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto mb-6">
                        {isPremium ? (
                            <>
                                <div>
                                    <span className="text-lg font-bold text-gray-900">{expert.hourlyRate} SAR</span>
                                    <span className="text-xs text-gray-500">/hr</span>
                                </div>
                                <Button onClick={() => handleHire(expert.id)} size="sm" className="bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-200">Hire Now</Button>
                            </>
                        ) : (
                            <div className="w-full text-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-200 rounded px-2 py-1">Premium Only</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ... (Smart Match Banner Unchanged) ... */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold tracking-wider text-xs uppercase">
                            <Sparkles size={14} /> AI Powered
                        </div>
                        <h2 className="text-3xl font-extrabold mb-2">Not sure who to hire?</h2>
                        <p className="text-indigo-100 max-w-xl">Let our AI analyze your business profile and assign the perfect financial expert from our vetted pool for your specific compliance needs.</p>
                    </div>
                    <Button onClick={handleMatchClick} size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-xl whitespace-nowrap">
                        Find My Match
                    </Button>
                </div>
            </div>

            {/* Main Content Layout with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Sidebar Filter */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Filter size={20} className="text-slate-900" />
                            <h3 className="font-bold text-lg text-slate-900">Filter Experts</h3>
                        </div>

                        {/* Sort By */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sort By</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                                >
                                    <option>Relevance</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Rating</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Category</label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filter === 'All' ? 'border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                        {filter === 'All' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                                    </div>
                                    <input type="radio" name="category" className="hidden" checked={filter === 'All'} onChange={() => setFilter('All')} />
                                    <span className={`font-medium transition-colors ${filter === 'All' ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'}`}>All</span>
                                </label>
                                {/* Removed old Category loop, will use Finance Skills if we want category to be skills match, or keep simplified */}
                            </div>
                        </div>

                        {/* Skills - Now Functional */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Skills</label>
                            <div className="space-y-3">
                                {financeSkills.map(skill => (
                                    <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filter === skill ? 'border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                            {filter === skill && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                                        </div>
                                        {/* Using same 'filter' state for now to demonstrate single-selection skill filter logic easily */}
                                        <input type="radio" name="category" className="hidden" checked={filter === skill} onChange={() => setFilter(skill)} />
                                        <span className={`text-slate-600 font-medium group-hover:text-slate-900 transition-colors ${filter === skill && '!text-blue-600'}`}>{skill}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-2">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Range</label>
                                <span className="text-blue-600 font-bold text-sm">$0 - $500</span>
                            </div>
                            <input type="range" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Main Grid Section */}
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Browse Premium Experts</h2>

                        {/* Search Bar - Repositioned */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm bg-white"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredExperts.map(expert => (
                            <ExpertCard key={expert.id} expert={expert} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Hire Modal */}
            {selectedExpertId && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Hire Expert</h3>
                            <button onClick={() => setSelectedExpertId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-4 text-sm">Select the service you would like to request from this expert:</p>
                            <div className="space-y-3 mb-6">
                                {services.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedServiceId(s.id)}
                                        className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedServiceId === s.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div>
                                            <span className="font-bold text-gray-800 block">{s.nameEn}</span>
                                            <span className="text-xs text-gray-500">{s.description}</span>
                                        </div>
                                        <span className="text-primary-600 font-bold bg-white px-2 py-1 rounded border border-gray-100">{s.price} SAR</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                <Button variant="secondary" onClick={() => setSelectedExpertId(null)}>Cancel</Button>
                                <Button disabled={!selectedServiceId} onClick={confirmHire} className="bg-gray-900 hover:bg-gray-800">Send Request</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Match Modal */}
            {showMatchModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-indigo-900 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                        <Sparkles size={20} className="text-indigo-200" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Find My Match</h3>
                                        <p className="text-indigo-200 text-sm">AI-powered service recommendation</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowMatchModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {!matchedService ? (
                                <div className="space-y-4">
                                    <label className="block font-medium text-gray-700">Describe what you need help with:</label>
                                    <textarea
                                        value={matchInput}
                                        onChange={(e) => setMatchInput(e.target.value)}
                                        placeholder="e.g., I need help with my quarterly VAT filing and some general bookkeeping for my retail shop."
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] resize-none text-sm"
                                    />
                                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                                        <span className="font-bold text-indigo-600">Tip:</span>
                                        Be specific about your industry and the type of compliance work required.
                                    </p>

                                    <Button
                                        onClick={performAIMatch}
                                        disabled={!matchInput.trim() || isMatching}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 text-base shadow-lg shadow-indigo-200"
                                    >
                                        {isMatching ? <><Loader2 className="animate-spin mr-2" size={18} /> Analyzing...</> : 'Find Best Service'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">We found a match!</h3>
                                        <p className="text-gray-500 text-sm mt-1">Based on your description, we recommend:</p>
                                    </div>

                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase">Recommended</div>
                                        <h4 className="text-lg font-bold text-indigo-900 mb-1">{matchedService.nameEn}</h4>
                                        <p className="text-indigo-700 text-sm mb-3">{matchedService.description}</p>
                                        <div className="font-bold text-indigo-900 text-xl">{matchedService.price.toLocaleString()} <span className="text-sm font-normal text-indigo-600">SAR</span></div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button onClick={proceedWithMatch} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg">
                                            Confirm & Proceed <ArrowRight size={18} className="ml-2" />
                                        </Button>
                                        <button
                                            onClick={() => setMatchedService(null)}
                                            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                                        >
                                            Try a different description
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrowseExperts;
