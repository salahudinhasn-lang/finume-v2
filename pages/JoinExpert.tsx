
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/UI';
import { User, Mail, Briefcase, DollarSign, Award, CheckCircle, Upload, Shield, ArrowRight, Star, TrendingUp, Users } from 'lucide-react';
import { Expert } from '../types';
import { Logo } from '../components/Logo';

const JoinExpert = () => {
  const { addExpert, login } = useAppContext();
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
  });

  const [specializationInput, setSpecializationInput] = useState('');

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
      rating: 0.0, // Initialize as 0.0 for new joiners
      totalEarned: 0,
      isPremium: false,
      isFeatured: false,
    };

    addExpert(newExpert);
    login(newExpert.email, 'EXPERT', newExpert);
    // Immediate redirect to dashboard
    navigate('/expert');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Left Sidebar - Value Prop */}
      <div className="lg:w-5/12 bg-[#0B0F19] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
         
         <div className="relative z-10">
             <Link to="/" className="flex items-center gap-2 mb-12">
                <Logo className="text-primary-500" />
                <span className="text-xl font-bold tracking-tight">FINUME</span>
             </Link>
             
             <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                 Build your practice <br/> on <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Autopilot</span>.
             </h1>
             <p className="text-gray-400 text-lg mb-12 max-w-md">
                 Join the top 1% of financial experts in Saudi Arabia. We handle the sales, marketing, and billing so you can focus on the work.
             </p>

             <div className="space-y-8">
                 <div className="flex gap-4">
                     <div className="p-3 bg-white/5 rounded-xl border border-white/10 h-fit">
                         <DollarSign size={24} className="text-green-400" />
                     </div>
                     <div>
                         <h3 className="font-bold text-xl mb-1">High-Value Projects</h3>
                         <p className="text-gray-400 text-sm">Average project size of 5,000 SAR. Guaranteed payouts upon completion.</p>
                     </div>
                 </div>
                 <div className="flex gap-4">
                     <div className="p-3 bg-white/5 rounded-xl border border-white/10 h-fit">
                         <TrendingUp size={24} className="text-blue-400" />
                     </div>
                     <div>
                         <h3 className="font-bold text-xl mb-1">Career Growth</h3>
                         <p className="text-gray-400 text-sm">Build your reputation with verified reviews and become a Top Rated expert.</p>
                     </div>
                 </div>
                 <div className="flex gap-4">
                     <div className="p-3 bg-white/5 rounded-xl border border-white/10 h-fit">
                         <Users size={24} className="text-purple-400" />
                     </div>
                     <div>
                         <h3 className="font-bold text-xl mb-1">Exclusive Community</h3>
                         <p className="text-gray-400 text-sm">Network with other CFOs and CPAs. Access private webinars and ZATCA updates.</p>
                     </div>
                 </div>
             </div>
         </div>

         <div className="relative z-10 mt-12 pt-12 border-t border-white/10">
             <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                         <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Ex${i}`} className="w-10 h-10 rounded-full border-2 border-[#0B0F19] bg-white" />
                     ))}
                 </div>
                 <p className="text-sm text-gray-400">Join <span className="text-white font-bold">200+ experts</span> already earning.</p>
             </div>
         </div>
      </div>

      {/* Right Content - Form */}
      <div className="lg:w-7/12 flex flex-col justify-center p-4 lg:p-16">
         <div className="max-w-2xl mx-auto w-full">
             <div className="mb-8 flex justify-between items-end">
                 <div>
                     <h2 className="text-2xl font-bold text-gray-900">Expert Application</h2>
                     <p className="text-gray-500">Complete your profile to start the vetting process.</p>
                 </div>
                 <span className="text-sm text-gray-400 font-mono hidden sm:block">ID: NEW-EXPERT</span>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">1</span>
                        About You
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Sarah Ahmed" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="+966 5..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="linkedin.com/in/..." />
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">2</span>
                        Expertise
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Years Experience</label>
                            <input required type="number" name="yearsExperience" min="1" value={formData.yearsExperience} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Hourly Rate (SAR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">SAR</span>
                                <input required type="number" name="hourlyRate" min="50" value={formData.hourlyRate} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="200" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Specializations</label>
                            <div className="flex gap-2 mb-2">
                                <input 
                                type="text" 
                                value={specializationInput}
                                onChange={(e) => setSpecializationInput(e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Add skill (e.g. Zakat, VAT, Audit)"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                                />
                                <Button type="button" onClick={handleAddSpecialization} variant="secondary" className="rounded-xl">Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.specializations.map((spec, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-gray-200">
                                    {spec}
                                    <button type="button" onClick={() => setFormData(prev => ({...prev, specializations: prev.specializations.filter((_, i) => i !== idx)}))} className="hover:text-red-500 ml-1">
                                    &times;
                                    </button>
                                </span>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Bio</label>
                            <textarea required name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Briefly describe your experience and key achievements..." />
                        </div>
                    </div>
                </div>

                {/* Verification */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">3</span>
                        Verification
                    </h3>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                        </div>
                        <p className="font-bold text-gray-700 text-sm">Upload CV or Certificate</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG (Max 5MB)</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500 max-w-xs">By clicking Submit, you agree to our Expert Terms of Service.</p>
                    <Button type="submit" size="lg" className="bg-primary-600 hover:bg-primary-700 shadow-lg px-8 rounded-xl">
                        Submit Application <ArrowRight size={18} className="ml-2" />
                    </Button>
                </div>

             </form>
         </div>
      </div>
    </div>
  );
};

export default JoinExpert;
