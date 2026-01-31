
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/UI';
import { Edit, Save, Plus, Trash2, X, Tag, FileText, CheckCircle, DollarSign, LayoutList, Layers, TrendingUp } from 'lucide-react';
import { Service, PricingPlan } from '../../types';

const AdminServices = () => {
    const { services, plans, updateService, addService, deleteService, updatePlan, settings, updateSettings } = useAppContext();
    const [activeTab, setActiveTab] = useState<'SERVICES' | 'PRICING' | 'SETTINGS' | 'TABLE_ROWS'>('SERVICES');

    // Service Modal
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [serviceForm, setServiceForm] = useState<Partial<Service>>({});

    // Plan Modal
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [planForm, setPlanForm] = useState<Partial<PricingPlan>>({});

    // Calculate Stats
    const avgPrice = services.length > 0
        ? Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length)
        : 0;

    // --- Handlers ---
    const handleEditService = (service: Service) => {
        setEditingServiceId(service.id);
        setServiceForm(service);
        setShowServiceModal(true);
    };

    const handleAddService = () => {
        setEditingServiceId(null);
        setServiceForm({ nameEn: '', nameAr: '', description: '', price: 0, expertShareType: 'PERCENTAGE', expertShareValue: 0 });
        setShowServiceModal(true);
    };

    const handleSaveService = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingServiceId) {
            updateService(editingServiceId, serviceForm);
        } else {
            const newService: Service = {
                id: `S${Date.now()}`,
                nameEn: serviceForm.nameEn || 'New Service',
                nameAr: serviceForm.nameAr || '',
                description: serviceForm.description || '',
                price: Number(serviceForm.price) || 0,
                expertShareType: serviceForm.expertShareType || 'PERCENTAGE',
                expertShareValue: Number(serviceForm.expertShareValue) || 0
            };
            addService(newService);
        }
        setShowServiceModal(false);
    };

    const handleDeleteService = (id: string) => {
        if (window.confirm('Are you sure you want to remove this service?')) {
            deleteService(id);
        }
    };

    const handleEditPlan = (plan: PricingPlan) => {
        setEditingPlanId(plan.id);
        setPlanForm(plan);
        setShowPlanModal(true);
    };

    const handleSavePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlanId && planForm) {
            updatePlan(editingPlanId, planForm);
        }
        setShowPlanModal(false);
    };

    const handleFeaturesChange = (text: string) => {
        setPlanForm(prev => ({ ...prev, features: text.split(',').map(s => s.trim()).filter(s => s) }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border border-gray-100 flex items-center justify-between p-4">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Total Services</p>
                        <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={20} /></div>
                </Card>
                <Card className="bg-white border border-gray-100 flex items-center justify-between p-4">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Active Plans</p>
                        <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Tag size={20} /></div>
                </Card>
                <Card className="bg-white border border-gray-100 flex items-center justify-between p-4">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Avg. Service Price</p>
                        <p className="text-2xl font-bold text-gray-900">{avgPrice.toLocaleString()} SAR</p>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Catalog Management</h1>
                    <p className="text-gray-500">Configure marketplace services and subscription tiers.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setActiveTab('SERVICES')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'SERVICES' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <LayoutList size={16} /> Services
                    </button>
                    <button
                        onClick={() => setActiveTab('PRICING')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'PRICING' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Tag size={16} /> Pricing Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('TABLE_ROWS')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'TABLE_ROWS' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <LayoutList size={16} /> Table Rows
                    </button>
                    <button
                        onClick={() => setActiveTab('SETTINGS')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'SETTINGS' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <TrendingUp size={16} /> Site Settings
                    </button>
                </div>
            </div>

            {/* --- Services Tab (Table View) --- */}
            {activeTab === 'SERVICES' && (
                <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">All Services</h3>
                        <Button size="sm" onClick={handleAddService} className="shadow-sm">
                            <Plus size={16} /> Add Service
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Service Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Price (SAR)</th>
                                    <th className="px-6 py-4">Expert Share</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {services.map(service => (
                                    <tr key={service.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{service.nameEn}</p>
                                            <p className="text-xs text-gray-400">{service.id}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{service.description}</td>
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">{service.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-gray-700">
                                            {service.expertShareType === 'FIXED'
                                                ? `${service.expertShareValue?.toLocaleString()} SAR`
                                                : `${service.expertShareValue}%`
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditService(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteService(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* --- Pricing Tab (Visual Cards) --- */}
            {activeTab === 'PRICING' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map(plan => (
                        <Card key={plan.id} className={`border-t-4 ${plan.color ? plan.color.replace('border-', 'border-t-') : 'border-t-gray-200'} relative hover:shadow-xl transition-shadow flex flex-col`}>
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={() => handleEditPlan(plan)} className="p-2 bg-white text-gray-500 hover:text-blue-600 border border-gray-200 shadow-sm rounded-full transition-colors">
                                    <Edit size={16} />
                                </button>
                            </div>

                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Most Popular</div>
                            )}

                            <div className="mb-4 pt-2">
                                <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                            </div>

                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <span className="text-4xl font-extrabold text-gray-900">{plan.price.toLocaleString()}</span>
                                <span className="text-gray-500 text-sm font-medium"> SAR / mo</span>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-center text-sm font-medium text-blue-800 mb-6 border border-blue-100">
                                {plan.tagline}
                            </div>

                            <ul className="space-y-3 mb-6 flex-1">
                                {plan.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-700 gap-3">
                                        <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        <span className="leading-snug">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
                                Guarantee: {plan.guarantee}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* --- Table Rows Config Tab --- */}
            {activeTab === 'TABLE_ROWS' && (
                <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h3 className="font-bold text-gray-700">Comparison Table Rows</h3>
                            <p className="text-xs text-gray-500">Define criteria rows for the pricing table.</p>
                        </div>
                        <Button size="sm" onClick={() => {
                            const currentConfig = settings.pricingTableConfig ? JSON.parse(settings.pricingTableConfig) : [];
                            const newRow = { id: `row_${Date.now()}`, label: 'New Criteria', section: 'Features', type: 'boolean' };
                            updateSettings({ pricingTableConfig: JSON.stringify([...currentConfig, newRow]) });
                        }} className="shadow-sm">
                            <Plus size={16} /> Add Row
                        </Button>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Label</th>
                                    <th className="px-4 py-3">Section</th>
                                    <th className="px-4 py-3">Value Type</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(settings.pricingTableConfig ? JSON.parse(settings.pricingTableConfig) : []).map((row: any, idx: number) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={row.label}
                                                onChange={(e) => {
                                                    const config = JSON.parse(settings.pricingTableConfig || '[]');
                                                    config[idx].label = e.target.value;
                                                    updateSettings({ pricingTableConfig: JSON.stringify(config) });
                                                }}
                                                className="border-gray-300 rounded-md text-sm px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={row.section}
                                                onChange={(e) => {
                                                    const config = JSON.parse(settings.pricingTableConfig || '[]');
                                                    config[idx].section = e.target.value;
                                                    updateSettings({ pricingTableConfig: JSON.stringify(config) });
                                                }}
                                                className="border-gray-300 rounded-md text-sm px-2 py-1"
                                            >
                                                <option value="Features">Features</option>
                                                <option value="Financial Limits">Financial Limits</option>
                                                <option value="Operational Limits">Operational Limits</option>
                                                <option value="Advanced Features">Advanced Features</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={row.type}
                                                onChange={(e) => {
                                                    const config = JSON.parse(settings.pricingTableConfig || '[]');
                                                    config[idx].type = e.target.value;
                                                    updateSettings({ pricingTableConfig: JSON.stringify(config) });
                                                }}
                                                className="border-gray-300 rounded-md text-sm px-2 py-1"
                                            >
                                                <option value="boolean">Checkbox (Yes/No)</option>
                                                <option value="text">Text / Number</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this row?')) {
                                                        const config = JSON.parse(settings.pricingTableConfig || '[]');
                                                        const newConfig = config.filter((_: any, i: number) => i !== idx);
                                                        updateSettings({ pricingTableConfig: JSON.stringify(newConfig) });
                                                    }
                                                }}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* --- Site Settings Tab --- */}
            {activeTab === 'SETTINGS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Careers Page Settings */}
                    <Card className="p-6 border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Careers Page</h3>
                                <p className="text-gray-500 text-sm">Manage public job listings visibility.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.careersEnabled}
                                        onChange={(e) => updateSettings({ careersEnabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Page Title</label>
                                <input
                                    type="text"
                                    value={settings.careersTitle || ''}
                                    onChange={(e) => updateSettings({ careersTitle: e.target.value })}
                                    placeholder="e.g. Join Our Team"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle / Intro</label>
                                <textarea
                                    rows={3}
                                    value={settings.careersSubtitle || ''}
                                    onChange={(e) => updateSettings({ careersSubtitle: e.target.value })}
                                    placeholder="Brief introduction text..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <Button size="sm" onClick={() => updateSettings({})}>
                                    <Save size={16} className="mr-2" /> Save Settings
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Pricing Settings */}
                    <Card className="p-6 border border-gray-200 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Pricing Configuration</h3>
                            <p className="text-gray-500 text-sm">Manage global pricing rules and discounts.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Yearly Plan Discount (%)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={settings.yearlyDiscountPercentage ?? 20}
                                        onChange={(e) => updateSettings({ yearlyDiscountPercentage: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="text-gray-500 font-bold">%</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Applies to all plans when "Yearly" billing is selected.
                                    (e.g. 20% off = 0.8 multipliers)
                                </p>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <Button size="sm" onClick={() => updateSettings({})}>
                                    <Save size={16} className="mr-2" /> Save Settings
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Public Pages Visibility */}
                    <Card className="p-6 border border-gray-200 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Public Pages Visibility</h3>
                            <p className="text-gray-500 text-sm">Control which pages are visible to the public and clients.</p>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">Page</th>
                                        <th className="px-4 py-3 text-center">Public Site</th>
                                        <th className="px-4 py-3 text-center">Client Portal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {['Services', 'Pricing', 'Experts', 'About', 'Careers'].map((page) => {
                                        const key = page.toLowerCase();
                                        const visibility = settings.pageVisibility ? JSON.parse(settings.pageVisibility) : {};
                                        const pageSettings = visibility[key] || { public: true, client: true };

                                        const toggleVisibility = (type: 'public' | 'client') => {
                                            const newVisibility = {
                                                ...visibility,
                                                [key]: {
                                                    ...pageSettings,
                                                    [type]: !pageSettings[type]
                                                }
                                            };
                                            updateSettings({ pageVisibility: JSON.stringify(newVisibility) });
                                        };

                                        return (
                                            <tr key={page} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{page}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={pageSettings.public}
                                                                onChange={() => toggleVisibility('public')}
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={pageSettings.client}
                                                                onChange={() => toggleVisibility('client')}
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingServiceId ? 'Edit Service' : 'New Service'}</h3>
                            <button onClick={() => setShowServiceModal(false)} className="hover:bg-gray-700 p-1 rounded"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveService} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Service Name (EN)</label>
                                <input required type="text" value={serviceForm.nameEn} onChange={e => setServiceForm({ ...serviceForm, nameEn: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Price (SAR)</label>
                                <input required type="number" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Expert Share Type</label>
                                    <select
                                        value={serviceForm.expertShareType || 'PERCENTAGE'}
                                        onChange={e => setServiceForm({ ...serviceForm, expertShareType: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (SAR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Expert Share Value</label>
                                    <input
                                        type="number"
                                        value={serviceForm.expertShareValue || 0}
                                        onChange={e => setServiceForm({ ...serviceForm, expertShareValue: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea rows={3} value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-4">
                                <Button variant="secondary" onClick={() => setShowServiceModal(false)} type="button">Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">Edit Plan: {planForm.name}</h3>
                            <button onClick={() => setShowPlanModal(false)} className="hover:bg-gray-700 p-1 rounded"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSavePlan} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Plan Name</label>
                                    <input type="text" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (SAR/mo)</label>
                                    <input type="number" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Expert Share Type</label>
                                    <select
                                        value={planForm.expertShareType || 'PERCENTAGE'}
                                        onChange={e => setPlanForm({ ...planForm, expertShareType: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (SAR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Expert Share Value</label>
                                    <input
                                        type="number"
                                        value={planForm.expertShareValue || 0}
                                        onChange={e => setPlanForm({ ...planForm, expertShareValue: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tagline</label>
                                <input type="text" value={planForm.tagline} onChange={e => setPlanForm({ ...planForm, tagline: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Detailed Features</label>
                                <div className="space-y-3 max-h-60 overflow-y-auto p-2 border border-gray-100 rounded-lg">
                                    {(settings.pricingTableConfig ? JSON.parse(settings.pricingTableConfig) : []).map((row: any) => {
                                        const currentVal = planForm.attributes?.[row.id];
                                        return (
                                            <div key={row.id} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-600 w-1/3 truncate" title={row.label}>{row.label}</span>
                                                <div className="flex-1">
                                                    {row.type === 'boolean' ? (
                                                        <select
                                                            value={currentVal === true ? 'true' : currentVal === false ? 'false' : String(currentVal || 'false')}
                                                            onChange={(e) => {
                                                                const val = e.target.value === 'true';
                                                                setPlanForm(prev => ({
                                                                    ...prev,
                                                                    attributes: { ...prev.attributes, [row.id]: val }
                                                                }));
                                                            }}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        >
                                                            <option value="true">Included (Check)</option>
                                                            <option value="false">Not Included (X)</option>
                                                            <option value="Basic">Partial/Text...</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={typeof currentVal === 'object' ? '' : currentVal || ''}
                                                            onChange={(e) => {
                                                                setPlanForm(prev => ({
                                                                    ...prev,
                                                                    attributes: { ...prev.attributes, [row.id]: e.target.value }
                                                                }));
                                                            }}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                            placeholder="Value (e.g. 5 Users)"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="hidden">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Legacy Features (Comma separated)</label>
                                <textarea
                                    rows={4}
                                    value={planForm.features?.join(', ')}
                                    onChange={e => handleFeaturesChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500"
                                    placeholder="Feature 1, Feature 2, Feature 3"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-4">
                                <Button variant="secondary" onClick={() => setShowPlanModal(false)} type="button">Cancel</Button>
                                <Button type="submit">Update Plan</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
