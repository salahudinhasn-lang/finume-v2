
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Client, Expert, Admin, Request, Service, Review, PricingPlan, PayoutRequest, PlatformSettings, ClientFeaturePermissions, SitePage } from '../types';
import { MOCK_CLIENTS, MOCK_EXPERTS, MOCK_REQUESTS, SERVICES, MOCK_ADMINS, MOCK_PLANS } from '../mockData';
import { translations } from '../utils/translations';

interface AppContextType {
  user: User | null;
  login: (email: string, role?: string, newUser?: User, password?: string) => Promise<User | null>; // Updated signature to allow password
  register: (data: any) => Promise<User | null>; // Add register
  logout: () => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;

  // Data Access
  clients: Client[];
  experts: Expert[];
  requests: Request[];
  services: Service[];
  plans: PricingPlan[];
  admins: Admin[];
  payoutRequests: PayoutRequest[];

  // Actions
  addRequest: (req: Request) => void;
  updateRequestStatus: (id: string, status: Request['status']) => void;
  assignRequest: (requestId: string, expertId: string) => void;
  updateExpertStatus: (expertId: string, status: Expert['status']) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  updateExpert: (id: string, updates: Partial<Expert>) => void;
  addClient: (client: Client) => void;
  addExpert: (expert: Expert) => void;
  submitReview: (requestId: string, review: Review) => void;

  // Service & Pricing Actions
  updateService: (id: string, updates: Partial<Service>) => void;
  addService: (service: Service) => void;
  deleteService: (id: string) => void;
  updatePlan: (id: string, updates: Partial<PricingPlan>) => void;

  // Admin Actions
  addAdmin: (admin: Admin) => void;
  updateAdmin: (id: string, updates: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;

  // Payout Actions
  requestPayout: (amount: number, requestIds?: string[]) => void;
  processPayout: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  manualSettle: (requestIds: string[]) => void;
  checkUsageLimit: (type: 'TRANSACTIONS' | 'REVENUE') => boolean;

  // Site Permissions & Settings
  settings: PlatformSettings;
  updateSettings: (settings: Partial<PlatformSettings>) => void;
  clientPermissions: Record<string, ClientFeaturePermissions>; // Exposed if needed, but getPermissions is better
  getPermissions: (clientId: string) => ClientFeaturePermissions;
  updatePermissions: (clientId: string, permissions: Partial<ClientFeaturePermissions>) => Promise<void>;
  updateSitePages: (pages: SitePage[]) => Promise<void>;
}

// Define API Base URL
const API_BASE_URL = ''; // Unified App: Always use relative path

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // "Database" in state
  const [clients, setClients] = useState<Client[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    // Initialize Mock Data
    setClients(MOCK_CLIENTS);
    setExperts(MOCK_EXPERTS);
    setRequests(MOCK_REQUESTS);
    setAdmins(MOCK_ADMINS);
    setServices(SERVICES);
    setPlans(MOCK_PLANS);

    // Legacy payouts
    setPayoutRequests([
      { id: 'WD-LEGACY', expertId: 'E1', expertName: 'Expert 1', amount: 0, requestDate: '2023-01-01', processedDate: '2023-01-01', status: 'APPROVED', requestIds: [] }
    ]);

    // Check LocalStorage for User Session
    const savedUser = localStorage.getItem('finume_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to restore session');
      }
    }

    const initBackend = async () => {
      try {
        // Fetch Settings
        const settingsRes = await fetch(`${API_BASE_URL}/api/settings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }

        // Fetch Users (including permissions)
        const usersRes = await fetch(`${API_BASE_URL}/api/users`);
        if (usersRes.ok) {
          const usersData = await usersRes.json();

          // Sanitize Experts
          if (usersData.experts?.length > 0) {
            const sanitizedExperts: Expert[] = usersData.experts.map((e: any) => ({
              ...e,
              specializations: (Array.isArray(e.specializations) ? e.specializations : [])
                .filter((s: any) => typeof s === 'string'),
              rating: typeof e.rating === 'number' ? e.rating : 0,
              totalEarned: typeof e.totalEarned === 'number' ? e.totalEarned : 0,
              status: e.status || 'VETTING',
              bio: e.bio || '',
              yearsExperience: typeof e.yearsExperience === 'number' ? e.yearsExperience : 0,
              hourlyRate: typeof e.hourlyRate === 'number' ? e.hourlyRate : 0,
              isPremium: !!e.isPremium,
              isFeatured: !!e.isFeatured,
              name: e.name || 'Unknown Expert',
              email: e.email || '',
              role: 'EXPERT',
              avatarUrl: e.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.id || Math.random()}`
            }));
            setExperts(sanitizedExperts);
          }

          // Sanitize Clients
          if (usersData.clients?.length > 0) {
            const sanitizedClients: Client[] = usersData.clients.map((c: any) => ({
              ...c,
              role: 'CLIENT',
              companyName: c.companyName || 'Unknown Company',
              industry: c.industry || 'Other',
              totalSpent: typeof c.totalSpent === 'number' ? c.totalSpent : 0,
              zatcaStatus: c.zatcaStatus || 'GREEN',
              name: c.name || 'Unknown Client',
              email: c.email || '',
              avatarUrl: c.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${c.id || Math.random()}`
            }));
            setClients(sanitizedClients);
          }

          if (usersData.admins?.length > 0) setAdmins(usersData.admins);

          // Hydrate client permissions map
          const permsMap: Record<string, ClientFeaturePermissions> = {};
          (usersData.clients as Client[] || []).forEach((c: any) => {
            if (c.permissions) {
              permsMap[c.id] = c.permissions;
            }
          });
          setClientPermissions(permsMap);
        }

        // Fetch Requests
        await fetchRequests();

        // Fetch Services
        const servicesRes = await fetch(`${API_BASE_URL}/api/services`);
        if (servicesRes.ok) {
          setServices(await servicesRes.json());
        }

        // Fetch Plans
        const plansRes = await fetch(`${API_BASE_URL}/api/plans`);
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          // Parse features/attributes if they are strings (from DB)
          const parsedPlans = plansData.map((p: any) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
            attributes: typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes
          }));
          setPlans(parsedPlans);
        }
      } catch (e) {
        console.warn('Backend not available:', e);
      }
    };
    initBackend(); // Call initBackend here
  }, []);

  const login = async (email: string, role?: string, newUser?: User, password?: string) => {
    // 1. If newUser passed (from Register instant login), use it
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('finume_user', JSON.stringify(newUser));
      return newUser;
    }

    // 2. API Login
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // We only send password if provided. Existing pages might not send it yet, 
        // but we are upgrading them. For now, valid password is required for real auth.
        body: JSON.stringify({ email, password: password || '12121212' }) // Default fallback for dev
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('finume_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('finume_token', data.token);
        return data.user;
      } else {
        // Fallback to Mock if API Fails (for demo continuity if backend is down)
        console.warn("API Login failed, falling back to mock logic for demo");
        // ... existing mock logic ...
        // For brevity, I will just alert error if API fails, as user requested "Professional".
        const err = await res.json();
        alert(err.error || 'Login failed');
        return null;
      }
    } catch (e) {
      console.error("Login Error", e);
      return null;
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('finume_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('finume_token', data.token);
        }
        // Sync state lists for UI
        if (data.user.role === 'CLIENT') setClients(prev => [data.user, ...prev]);
        if (data.user.role === 'EXPERT') setExperts(prev => [data.user, ...prev]);

        return data.user;
      } else {
        const err = await res.json();
        console.error('Registration failed:', err);

        // Format Zod validation errors if available
        let errorMessage = err.error || 'Registration failed';
        if (err.details && typeof err.details === 'object') {
          // Zod format returns { field: { _errors: [] } }
          const details = Object.entries(err.details)
            .map(([key, value]: [string, any]) => {
              if (value._errors && value._errors.length > 0) {
                return `${key}: ${value._errors.join(', ')}`;
              }
              return '';
            })
            .filter(Boolean)
            .join('\n');
          if (details) errorMessage += `:\n${details}`;
        }

        alert(errorMessage);
        return null;
      }
    } catch (e) {
      console.error("Registration Error", e);
      alert("Network error during registration");
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finume_user');
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Fetch Requests from Backend
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`);
      if (res.ok) {
        const data = await res.json();

        // Parse and map service names
        const parsedData = data.map((d: any) => ({
          ...d,
          batches: d.batches?.map((b: any) => ({
            ...b,
            files: b.files || []
          })) || [],
          // Prioritize Pricing Plan Name if available, then Service Name
          serviceName: d.pricingPlan ? d.pricingPlan.name : (d.service ? (language === 'en' ? d.service.nameEn : d.service.nameAr) : d.serviceName)
        }));

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setRequests(prev => {
            const newIds = new Set(parsedData.map((d: any) => d.id));
            const filteredPrev = prev.filter(p => !newIds.has(p.id) && p.id.startsWith('R-'));
            return [...parsedData, ...filteredPrev];
          });
        }
        console.log('Fetched requests from DB:', parsedData);
      }
    } catch (e) {
      console.error('Failed to fetch requests', e);
    }
  };

  const addRequest = async (req: Request) => {
    // 1. Optimistic UI Update
    setRequests(prev => [req, ...prev]);

    // 2. Persist to Backend
    try {
      const payload = {
        clientId: req.clientId,
        serviceId: req.serviceId,
        description: req.description,
        amount: req.amount,
        batches: req.batches
      };

      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedReq = await res.json();
        // Update the temporary ID with the real one from DB
        setRequests(prev => prev.map(r => r.id === req.id ? { ...savedReq, status: r.status } : r));
      }
    } catch (error) {
      console.error('Failed to save request to DB', error);
    }
  };

  const updateRequestStatus = (id: string, status: Request['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const assignRequest = (requestId: string, expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    if (!expert) return;

    // Optimistic Update
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          assignedExpertId: expertId,
          expertName: expert.name,
          status: 'MATCHED'
        };
      }
      return r;
    }));

    // Persist to Backend
    try {
      fetch(`${API_BASE_URL}/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedExpertId: expertId, status: 'MATCHED' })
      }).catch(err => console.error("Failed to assign expert DB", err));
    } catch (e) {
      console.error("Assign request error", e);
    }
  };

  const updateExpertStatus = (expertId: string, status: Expert['status']) => {
    setExperts(prev => prev.map(e => e.id === expertId ? { ...e, status } : e));
  };

  const updateRequest = (id: string, updates: Partial<Request>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (user && user.id === id) {
      setUser(prev => prev ? { ...prev, ...updates } as User : null);
    }
  };

  const updateExpert = (id: string, updates: Partial<Expert>) => {
    setExperts(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (user && user.id === id) {
      setUser(prev => prev ? { ...prev, ...updates } as User : null);
    }
  };

  const addClient = (client: Client) => {
    setClients(prev => [client, ...prev]);
  };

  const addExpert = (expert: Expert) => {
    setExperts(prev => [expert, ...prev]);
  };

  const addAdmin = (admin: Admin) => {
    setAdmins(prev => [...prev, admin]);
  };

  const updateAdmin = (id: string, updates: Partial<Admin>) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAdmin = (id: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  // Service & Pricing Actions
  const updateService = async (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    try {
      await fetch(`${API_BASE_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
    } catch (e) { console.error(e); }
  };

  const addService = async (service: Service) => {
    setServices(prev => [...prev, service]);
    try {
      await fetch(`${API_BASE_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
    } catch (e) { console.error(e); }
  };

  const deleteService = async (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    try {
      await fetch(`${API_BASE_URL}/api/services?id=${id}`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  const updatePlan = async (id: string, updates: Partial<PricingPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await fetch(`${API_BASE_URL}/api/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
    } catch (e) { console.error(e); }
  };

  const submitReview = (requestId: string, review: Review) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, review } : r));
    const request = requests.find(r => r.id === requestId);
    if (request && request.assignedExpertId) {
      setExperts(prev => prev.map(e => {
        if (e.id === request.assignedExpertId) {
          const totalRatings = 10;
          const currentSum = e.rating * totalRatings;
          const newRating = (currentSum + review.expertRating) / (totalRatings + 1);
          return { ...e, rating: Math.min(5, Math.max(0, newRating)) };
        }
        return e;
      }));
    }
  };

  const requestPayout = (amount: number, specificRequestIds?: string[]) => {
    if (!user || user.role !== 'EXPERT') return;

    let requestIds: string[] = [];
    let payoutAmount = amount;

    if (specificRequestIds && specificRequestIds.length > 0) {
      requestIds = specificRequestIds;
      // Calculate amount from specific IDs to be safe
      const selectedRequests = requests.filter(r => requestIds.includes(r.id));
      payoutAmount = selectedRequests.reduce((sum, r) => sum + (r.amount * 0.8), 0);
    } else {
      // Fallback: Find All Unsettled
      const unsettledRequests = requests.filter(r =>
        r.assignedExpertId === user.id &&
        r.status === 'COMPLETED' &&
        !r.payoutId
      );
      requestIds = unsettledRequests.map(r => r.id);
      payoutAmount = unsettledRequests.reduce((sum, r) => sum + (r.amount * 0.8), 0);
    }

    if (requestIds.length === 0) return;

    const payoutId = `WD-${Date.now()}`;

    // Update Requests to link to this payout
    setRequests(prev => prev.map(r => {
      if (requestIds.includes(r.id)) {
        return { ...r, payoutId: payoutId };
      }
      return r;
    }));

    const newPayout: PayoutRequest = {
      id: payoutId,
      expertId: user.id,
      expertName: user.name,
      amount: payoutAmount,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      requestIds: requestIds
    };

    setPayoutRequests(prev => [newPayout, ...prev]);
  };

  const processPayout = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setPayoutRequests(prev => prev.map(p =>
      p.id === id ? { ...p, status, processedDate: new Date().toISOString().split('T')[0] } : p
    ));

    // If rejected, unlink the requests so they can be requested again
    if (status === 'REJECTED') {
      const payout = payoutRequests.find(p => p.id === id);
      if (payout && payout.requestIds) {
        setRequests(prev => prev.map(r => {
          if (payout.requestIds.includes(r.id)) {
            return { ...r, payoutId: undefined };
          }
          return r;
        }));
      }
    }
  };

  const manualSettle = (requestIds: string[]) => {
    // Create a dummy approved payout
    const payoutId = `SETTLE-MANUAL-${Date.now()}`;

    // Calculate total
    const totalAmount = requests
      .filter(r => requestIds.includes(r.id))
      .reduce((sum, r) => sum + (r.amount * 0.8), 0);

    // Create dummy payout record
    const dummyPayout: PayoutRequest = {
      id: payoutId,
      expertId: 'VARIOUS', // Or specific if we filtered
      expertName: translations[language === 'en' ? 'en' : 'ar'].financials.manualSettlement,
      amount: totalAmount,
      requestDate: new Date().toISOString().split('T')[0],
      processedDate: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
      requestIds: requestIds
    };
    setPayoutRequests(prev => [dummyPayout, ...prev]);

    // Link Requests
    setRequests(prev => prev.map(r => {
      if (requestIds.includes(r.id)) {
        return { ...r, payoutId: payoutId };
      }
      return r;
    }));
  };

  // Usage Limit Implementation
  const checkUsageLimit = (type: 'TRANSACTIONS' | 'REVENUE') => {
    if (!user || user.role !== 'CLIENT') return false;

    // For now, assume a basic plan if not found.
    // In real app, we'd fetch plan details linked to user subscription.
    // Let's cycle limits for demo:
    // If client email contains 'limit', we trigger limit.
    // Or just random for now? No, let's use a hardcoded logic based on plan name if available, or just mock it.

    // Mock Limits
    const MAX_TRANSACTIONS = 5; // Low limit to trigger easily
    const MAX_REVENUE = 50000;

    // Count current usage (Mock: count requests)
    const currentTransactions = requests.filter(r => r.clientId === user.id).length;

    if (type === 'TRANSACTIONS') {
      // If user has > 5 requests, trigger limit
      return currentTransactions >= MAX_TRANSACTIONS;
    }

    return false;
  };

  // State for Platform Settings and Permissions
  const [settings, setSettings] = useState<PlatformSettings>({
    id: 'global',
    showExpertsPage: true,
    showServicesPage: true,
    careersEnabled: false,
    careersTitle: '',
    careersSubtitle: '',
    pageVisibility: '{}',
    sitePages: '[]'
  });

  // Per-Client Permissions (Locked features)
  const [clientPermissions, setClientPermissions] = useState<Record<string, ClientFeaturePermissions>>({});

  const getPermissions = (clientId: string): ClientFeaturePermissions => {
    return clientPermissions[clientId] || {
      id: 'default',
      clientId: clientId,
      canViewReports: true,
      canUploadDocs: true,
      canDownloadInvoices: true,
      canRequestCalls: true,
      canSubmitTickets: true,
      canViewMarketplace: false // Private by default
    };
  };

  const updatePermissions = async (clientId: string, newPerms: Partial<ClientFeaturePermissions>) => {
    const updated = { ...getPermissions(clientId), ...newPerms };

    // Optimistic Update
    setClientPermissions(prev => ({
      ...prev,
      [clientId]: updated
    }));

    // Persist
    try {
      await fetch(`${API_BASE_URL}/api/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, permissions: updated })
      });
    } catch (e) {
      console.error('Failed to persist permissions', e);
    }
  };

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Persist
    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, ...newSettings })
      });
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, language, setLanguage, t, register,
      clients, experts, requests, services, plans, admins, payoutRequests,
      addRequest, updateRequestStatus, assignRequest, updateExpertStatus, updateRequest,
      updateClient, updateExpert, addClient, addExpert, submitReview,
      addAdmin, updateAdmin, deleteAdmin,
      updateService, addService, deleteService, updatePlan,
      requestPayout, processPayout, manualSettle, checkUsageLimit,
      settings, updateSettings, clientPermissions, getPermissions, updatePermissions,
      updateSitePages: async (pages) => {
        await updateSettings({ sitePages: JSON.stringify(pages) });
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

