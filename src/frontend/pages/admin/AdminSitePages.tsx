
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { Save, Plus, Edit, Trash, Globe, Lock, Info, CheckCircle, LayoutTemplate, RotateCw } from 'lucide-react';
import { SitePage } from '../../types';

const AdminSitePages = () => {
    const { settings, updateSitePages } = useAppContext();
    const [pages, setPages] = useState<SitePage[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<SitePage> & { contentBuffer?: any }>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (settings.sitePages) {
            try {
                const parsed = JSON.parse(settings.sitePages);
                setPages(parsed);
                // default select first
                if (!selectedPageId && parsed.length > 0) {
                    setSelectedPageId(parsed[0].id);
                }
            } catch (e) {
                console.error("Failed to parse sitePages", e);
            }
        }
    }, [settings.sitePages]);

    useEffect(() => {
        if (selectedPageId) {
            const p = pages.find(page => page.id === selectedPageId);
            if (p) {
                setEditForm(JSON.parse(JSON.stringify(p))); // Deep copy
                setIsDirty(false);
            }
        }
    }, [selectedPageId, pages]);

    const handleSave = async () => {
        if (!selectedPageId) return;
        const updatedPages = pages.map(p => p.id === selectedPageId ? { ...p, ...editForm } as SitePage : p);

        // Optimistic update
        setPages(updatedPages);

        await updateSitePages(updatedPages);
        setIsDirty(false);
        // Toast success?
    };

    const handleFieldChange = (field: keyof SitePage, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleContentChange = (field: string, value: any) => {
        setEditForm(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [field]: value
            }
        }));
        setIsDirty(true);
    };

    const handleReset = async () => {
        if (confirm('Initialize default pages? This will overwrite existing configuration.')) {
            const defaultPages: SitePage[] = [
                { id: 'about', slug: '/about', title: 'About Us', section: 'COMPANY', isSystem: true, showPublic: true, showClient: true },
                { id: 'careers', slug: '/careers', title: 'Careers', section: 'COMPANY', isSystem: true, showPublic: true, showClient: false },
                { id: 'contact', slug: '/contact', title: 'Contact', section: 'COMPANY', isSystem: true, showPublic: true, showClient: true },
                { id: 'help-center', slug: '/qa', title: 'Help Center', section: 'RESOURCES', isSystem: true, showPublic: true, showClient: true },
                { id: 'zatca-guide', slug: '/compliance', title: 'ZATCA Guide', section: 'RESOURCES', isSystem: true, showPublic: true, showClient: true },
                { id: 'api-docs', slug: '#', title: 'API Documentation', section: 'RESOURCES', isSystem: false, showPublic: true, showClient: false },
                { id: 'privacy', slug: '/privacy', title: 'Privacy Policy', section: 'LEGAL', isSystem: true, showPublic: true, showClient: true },
                { id: 'terms', slug: '/terms', title: 'Terms of Service', section: 'LEGAL', isSystem: true, showPublic: true, showClient: true }
            ];
            setPages(defaultPages);
            await updateSitePages(defaultPages);
        }
    };

    const sections = ['COMPANY', 'RESOURCES', 'LEGAL'];

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* Left Sidebar: Page List */}
            <div className="w-1/3 flex flex-col gap-4">
                <Card className="flex-1 flex flex-col p-0 overflow-hidden border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700">Site Pages</h2>
                        <div className="flex gap-2">
                            {pages.length === 0 && (
                                <span title="Initialize Defaults">
                                    <Button size="sm" variant="outline" onClick={handleReset}>
                                        <RotateCw size={14} />
                                    </Button>
                                </span>
                            )}
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0"><Plus size={16} /></Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {sections.map(section => (
                            <div key={section}>
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{section}</h3>
                                <div className="space-y-2">
                                    {pages.filter(p => p.section === section).map(page => (
                                        <div
                                            key={page.id}
                                            onClick={() => setSelectedPageId(page.id)}
                                            className={`p-3 rounded-lg cursor-pointer border transition-all flex items-center justify-between group ${selectedPageId === page.id
                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`font-medium text-sm ${selectedPageId === page.id ? 'text-blue-700' : 'text-gray-700'}`}>{page.title}</span>
                                                <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{page.slug}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Status Dots */}
                                                <div
                                                    className={`w-2 h-2 rounded-full ${page.showPublic ? 'bg-green-400' : 'bg-gray-200'}`}
                                                    title="Public Visibility"
                                                />
                                                <div
                                                    className={`w-2 h-2 rounded-full ${page.showClient ? 'bg-blue-400' : 'bg-gray-200'}`}
                                                    title="Client Visibility"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Right Panel: Editor */}
            <div className="flex-1 flex flex-col">
                {selectedPageId && editForm.id ? (
                    <Card className="flex-1 flex flex-col p-6 border-gray-200 shadow-sm">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{editForm.title}</h1>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <LayoutTemplate size={14} />
                                    <span>{editForm.section} Page</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{editForm.slug}</span>
                                </div>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={!isDirty}
                                className={isDirty ? 'bg-primary-600 hover:bg-primary-700' : 'opacity-50'}
                            >
                                <Save size={16} className="mr-2" /> Save Changes
                            </Button>
                        </div>

                        {/* Visibility Toggles */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editForm.showPublic ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleFieldChange('showPublic', !editForm.showPublic)}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`font-bold text-sm ${editForm.showPublic ? 'text-green-700' : 'text-gray-500'}`}>Show on Public Site</span>
                                    <Globe size={18} className={editForm.showPublic ? 'text-green-600' : 'text-gray-400'} />
                                </div>
                                <p className="text-xs text-gray-500">Visible in footer and navigation to all visitors.</p>
                            </div>
                            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editForm.showClient ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleFieldChange('showClient', !editForm.showClient)}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`font-bold text-sm ${editForm.showClient ? 'text-blue-700' : 'text-gray-500'}`}>Show to Clients</span>
                                    <Lock size={18} className={editForm.showClient ? 'text-blue-600' : 'text-gray-400'} />
                                </div>
                                <p className="text-xs text-gray-500">Available in the Client Portal sidebar/menus.</p>
                            </div>
                        </div>

                        {/* Special Controls (Careers) */}
                        {editForm.id === 'careers' && (
                            <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                <h3 className="text-sm font-bold text-orange-800 mb-3">Careers Settings</h3>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-orange-600 rounded"
                                            checked={editForm.content?.hiringBadge || false}
                                            onChange={(e) => handleContentChange('hiringBadge', e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700">Show "Hiring" Badge</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='Tagline (e.g., "We are growing!")'
                                        className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                        value={editForm.content?.hiringTagline || ''}
                                        onChange={(e) => handleContentChange('hiringTagline', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content Editors */}
                        <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Page Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold"
                                    value={editForm.content?.pageTitle || editForm.title} // Fallback to meta title
                                    onChange={(e) => handleContentChange('pageTitle', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle / Intro</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-600"
                                    value={editForm.content?.subtitle || ''}
                                    placeholder="Brief introduction text displayed below the title..."
                                    onChange={(e) => handleContentChange('subtitle', e.target.value)}
                                />
                            </div>

                            <div className="flex-1 flex flex-col min-h-[300px]">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Main Content (Markdown Supported)</label>
                                <textarea
                                    className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-relaxed resize-none"
                                    value={editForm.content?.body || ''}
                                    placeholder="# Heading\n\nWrite your content here..."
                                    onChange={(e) => handleContentChange('body', e.target.value)}
                                />
                                <p className="text-xs text-gray-400 mt-2 text-right">Supports basic markdown formatting.</p>
                            </div>
                        </div>

                    </Card>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300 m-4">
                        <p>Select a page to edit</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSitePages;
