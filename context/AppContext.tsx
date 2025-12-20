
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Client, Expert, Admin, Request, Service, Review, PricingPlan, PayoutRequest } from '../types';
import { MOCK_CLIENTS, MOCK_EXPERTS, MOCK_REQUESTS, SERVICES, MOCK_ADMINS, MOCK_PLANS } from '../mockData';
import { translations } from '../utils/translations';

interface AppContextType {
  user: User | null;
  login: (email: string, role: string, newUser?: User) => void;
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
}

// Define API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
        // Fetch Users
        const usersRes = await fetch(`${API_BASE_URL}/api/users`);
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setClients(usersData.clients || []);
          setExperts(usersData.experts || []);
          setAdmins(usersData.admins || []);
        }

        // Fetch Requests
        await fetchRequests();
      } catch (e) {
        console.warn('Backend not available:', e);
      }
    };
  }, []);

  const login = (email: string, role: string, newUser?: User) => {
    const normalize = (s: string) => s.trim().toLowerCase();
    // Try DB Login first (if password provided, usually handled by passed user object or API)
    // Since login signature doesn't take password, we might need to assume verify happened before calling login?
    // OR update login signature. The plan said update login signature.
    // Let's rely on the LoginPage calling the API, and then calling login(user) with the result.

    // But we need to update the data in context too.
    // And we need to support the manual "Just click login" flow for demos if user didn't enter password? 
    // User said: "make all passwords as 12121212", so they WILL enter it.

    // If we are strictly following "Keep app showing", we want real data.

    // Current Login: local find.
    // New Login: passed user object (authenticated)
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('finume_user', JSON.stringify(newUser));
      return;
    }
    // If no newUser passed, fall back to mock/local check (or error?)
    // We will modify Auth.tsx to ALWAYS pass newUser (result of API).

    if (role === 'CLIENT') {
      const client = clients.find(c => normalize(c.email) === normalize(email));
      if (client) {
        setUser(client);
        localStorage.setItem('finume_user', JSON.stringify(client));
        return;
      }

      if (email === 'client1@example.com' || !email) {
        setUser(clients[0]);
        localStorage.setItem('finume_user', JSON.stringify(clients[0]));
      } else {
        const tempUser: Client = {
          id: `C-${Date.now()}`,
          name: email.split('@')[0],
          email: email,
          role: 'CLIENT',
          companyName: 'New Company',
          industry: 'General',
          totalSpent: 0,
          zatcaStatus: 'GREEN',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
        };
        setClients(prev => [tempUser, ...prev]);
        setUser(tempUser);
        localStorage.setItem('finume_user', JSON.stringify(tempUser));
      }
    } else if (role === 'EXPERT') {
      const expert = experts.find(e => normalize(e.email) === normalize(email));
      if (expert) {
        setUser(expert);
        localStorage.setItem('finume_user', JSON.stringify(expert));
        return;
      }

      if (email === 'expert1@example.com' || !email) {
        setUser(experts[0]);
        localStorage.setItem('finume_user', JSON.stringify(experts[0]));
      } else {
        alert(translations[language === 'en' ? 'en' : 'ar'].financials.expertNotFound); // Access translation directly as context update is async/hook limitation here
        setUser(experts[0]);
        localStorage.setItem('finume_user', JSON.stringify(experts[0]));
      }
    } else {
      const admin = admins.find(a => normalize(a.email) === normalize(email));
      if (admin) {
        setUser(admin);
        localStorage.setItem('finume_user', JSON.stringify(admin));
        return;
      }
      setUser(admins[0]);
      localStorage.setItem('finume_user', JSON.stringify(admins[0]));
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
        // Map backend data format to frontend type if necessary, or ensure they match
        // Ideally we merge with mocks or replace. For this demo, let's prepend backend data to mocks or replace.
        // Since we want to see "saved" data, we should prioritize backend.
        // However, our mocks are static. Let's just append.
        // Actually, we don't have a full User system on backend yet (auth is skipped), so standardizing IDs is tricky.
        // We will just log success for now and maybe append to state.
        // Merge backend data with mocks.
        // For simplicity, we prioritize backend data if IDs match, or append.
        // Actually, let's just REPLACE requests with backend data + any mocks that don't exist in backend (if needed).
        // Since we want to see "new transactions", backend is truth.
        // But MOCK_REQUESTS should be kept for demo purposes if backend is empty.

        if (Array.isArray(data) && data.length > 0) {
          // If backend has data, use it. Migh want to mix in mocks if backend has few.
          // For now, let's just setRequests to (backend + mocks) avoiding duplicates by ID?
          // Or just PREPEND backend items.
          setRequests(prev => {
            const newIds = new Set(data.map((d: any) => d.id));
            const filteredPrev = prev.filter(p => !newIds.has(p.id) && p.id.startsWith('R-')); // Keep mocks (R- prefix) if not colliding
            return [...data, ...filteredPrev];
          });
        }
        console.log('Fetched requests from DB:', data);
      }
    } catch (e) {
      console.error('Failed to fetch requests', e);
    }
  };

  const addRequest = async (req: Request) => {
    // 1. Optimistic UI Update
    setRequests(prev => [req, ...prev]);

    // 2. Persist to Backend (Disabled)
    /*
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
        setRequests(prev => prev.map(r => r.id === req.id ? { ...r, id: savedReq.id, status: savedReq.status } : r));
      }
    } catch (error) {
      console.error('Failed to save request to DB', error);
    }
    */
  };

  const updateRequestStatus = (id: string, status: Request['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const assignRequest = (requestId: string, expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    if (!expert) return;

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
  };

  const updateExpertStatus = (expertId: string, status: Expert['status']) => {
    setExperts(prev => prev.map(e => e.id === expertId ? { ...e, status } : e));
  };

  const updateRequest = (id: string, updates: Partial<Request>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateExpert = (id: string, updates: Partial<Expert>) => {
    setExperts(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
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
  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const updatePlan = (id: string, updates: Partial<PricingPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
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

  return (
    <AppContext.Provider value={{
      user, login, logout, language, setLanguage, t,
      clients, experts, requests, services, plans, admins, payoutRequests,
      addRequest, updateRequestStatus, assignRequest, updateExpertStatus, updateRequest,
      updateClient, updateExpert, addClient, addExpert, submitReview,
      addAdmin, updateAdmin, deleteAdmin,
      updateService, addService, deleteService, updatePlan,
      requestPayout, processPayout, manualSettle, checkUsageLimit
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

