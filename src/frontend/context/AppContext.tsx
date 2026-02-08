
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Client, Expert, Admin, Request, Service, Review, PricingPlan, PayoutRequest, PlatformSettings, ClientFeaturePermissions, SitePage } from '../types';
import { MOCK_CLIENTS, MOCK_EXPERTS, MOCK_REQUESTS, SERVICES, MOCK_ADMINS, MOCK_PLANS } from '../mockData';

export interface NotificationItem {
  id: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  link: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, role?: string, newUser?: User, password?: string) => Promise<User | null>; // Updated signature to allow password
  register: (data: any) => Promise<User | null>; // Add register
  logout: () => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string, options?: any) => string;
  apiError: string | null;
  setApiError?: (error: string | null) => void;
  isLoading: boolean;


  // Data Access
  clients: Client[];
  experts: Expert[];
  requests: Request[];
  services: Service[];
  plans: PricingPlan[];
  admins: Admin[];
  payoutRequests: PayoutRequest[];

  // Actions
  addRequest: (req: Request) => Promise<Request | null>;
  updateRequestStatus: (id: string, status: Request['status']) => void;
  assignRequest: (requestId: string, expertId: string) => void;
  acceptRequest: (requestId: string, expertId: string) => Promise<boolean>;
  updateExpertStatus: (expertId: string, status: Expert['status']) => void;
  updateRequest: (id: string, updates: Partial<Request>) => Promise<boolean>;
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
  isRestoringSession: boolean;
  refreshData: () => Promise<void>;
  fetchRequests: (clientIdFiltered?: string) => Promise<void>;
  setSession: (user: User, token: string) => void;
  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;
}

// Define API Base URL
const API_BASE_URL = ''; // Unified App: Always use relative path

const AppContext = createContext<AppContextType | undefined>(undefined);

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 500): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok && retries > 0 && res.status >= 500) {
      throw new Error(`Server Error ${res.status}`);
    }
    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed, retrying (${retries} left)...`, error);
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t: i18nT, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // Initialize language from i18n or localStorage (i18n detector handles this mostly, but we sync state)
  const [language, setInternalLanguage] = useState<'en' | 'ar'>((i18n.language as 'en' | 'ar') || 'en');

  // Sync state when i18n language changes
  useEffect(() => {
    if (i18n.language) {
      setInternalLanguage(i18n.language as 'en' | 'ar');
    }
  }, [i18n.language]);

  const setLanguage = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang);
    setInternalLanguage(lang);
  };

  // "Database" in state
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Notification Polling
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        // Fetch recent meetings to check for new messages
        const res = await fetch(`${API_BASE_URL}/api/meetings?role=${user.role}`);
        if (res.ok) {
          const meetings = await res.json();
          const newNotifications: NotificationItem[] = [];

          meetings.forEach((m: any) => {
            // Get last message not sent by me
            const incomingMessages = m.messages?.filter((msg: any) => msg.senderId !== user.id) || [];
            if (incomingMessages.length > 0) {
              const lastMsg = incomingMessages[incomingMessages.length - 1];
              const msgTime = new Date(lastMsg.createdAt);

              // Simple Logic: If message is less than 24h old, consider it for notification list
              // Real "Unread" logic would need DB 'readAt' field. 
              // For now, we show recent activity.
              const isRecent = (new Date().getTime() - msgTime.getTime()) < 24 * 60 * 60 * 1000;

              if (isRecent) {
                const senderName = user.role === 'CLIENT' ? m.expertName : (user.role === 'EXPERT' ? m.clientName : 'System');

                const baseLink = user.role === 'CLIENT' ? '/client/meetings' : (user.role === 'EXPERT' ? '/expert/meetings' : '/admin/calendar');

                newNotifications.push({
                  id: lastMsg.id,
                  senderName: senderName || 'User',
                  content: lastMsg.content,
                  timestamp: msgTime,
                  isRead: false,
                  link: `${baseLink}?meetingId=${m.id}`
                });
              }
            }
          });

          // Sort by newest
          newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setNotifications(newNotifications);
        }
      } catch (e) {
        // Silent fail for background poll
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [user]);

  const markNotificationsAsRead = () => {
    // In a real app, this would call API. 
    // For UI demo, we can clear them or mark visually.
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // useEffect(() => {
  //   document.documentElement.lang = language;
  //   document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  // }, [language]); // Managed by i18n.on('languageChanged') now in i18n.ts

  useEffect(() => {
    // Initialize Mock Data (Empty now as we cleaned it)
    // Initialize Mock Data (Empty now as we cleaned it)
    // Removed to rely fully on DB
    // setClients(MOCK_CLIENTS);
    // setExperts(MOCK_EXPERTS);
    // setRequests(MOCK_REQUESTS);
    // setAdmins(MOCK_ADMINS);
    setServices(SERVICES);
    setPlans(MOCK_PLANS);

    // Legacy payouts - REMOVED
    setPayoutRequests([]); // Start empty


    // Check LocalStorage for User Session
    const savedUser = localStorage.getItem('finume_user');
    console.log("Restoring session, found:", savedUser ? "YES" : "NO");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        console.log("Session restored for:", parsed.email);
      } catch (e) {
        console.error('Failed to restore session');
      }
    }
    setIsRestoringSession(false);

    initBackend();
  }, []); // useEffect dependency array empty -> runs once

  // Reactive Data Fetching: Ensure we fetch user data when user state initializes/changes
  useEffect(() => {
    if (user?.id) {
      // Re-fetch requests. 
      // If CLIENT: filter by their ID.
      // If ADMIN/EXPERT: fetch all (no filter arg).
      if (user.role === 'CLIENT') {
        fetchRequests(user.id);
      } else {
        fetchRequests();
      }
    }
  }, [user?.id]);

  const refreshData = async () => {
    await initBackend();
  };

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
        // const err = await res.json();
        // alert(err.error || 'Login failed');
        // return null;
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

  const setSession = (user: User, token: string) => {
    setUser(user);
    localStorage.setItem('finume_user', JSON.stringify(user));
    localStorage.setItem('finume_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finume_user');
    localStorage.removeItem('finume_token');
    // Clear data to prevent stale state issues on re-login
    setRequests([]);
    setNotifications([]);
    setClients([]);
    setExperts([]);
  };

  const t = (key: string, options?: any): string => {
    return i18nT(key, options) as string;
  };

  // Fetch Requests from Backend
  // Fetch Requests from Backend
  async function fetchRequests(clientIdFiltered?: string) {
    try {
      // Determine if we should filter by specific client
      let url = `${API_BASE_URL}/api/requests`;

      // If clientId passed explicitly (e.g. from initBackend after login)
      if (clientIdFiltered) {
        url += `?clientId=${clientIdFiltered}`;
      }
      // Fallback: If no arg but user is logged in as client in state (might be null during init)
      else if (user?.role === 'CLIENT' && user.id) {
        url += `?clientId=${user.id}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('json')) {
          const data = await res.json();

          // Parse and map service names
          const parsedData = data.map((d: any) => ({
            ...d,
            batches: d.batches?.map((b: any) => ({
              ...b,
              files: b.files || []
            })) || [],
            // Prioritize Pricing Plan Name if available, then Service Name
            serviceName: d.pricingPlan ? d.pricingPlan.name : (d.service ? (language === 'en' ? d.service.nameEn : d.service.nameAr) : d.serviceName),

            // Map Relations to flat fields used by UI
            clientName: d.client ? (d.client.companyName || d.client.user?.name || d.client.name) : 'Unknown Client',
            expertName: d.assignedExpert ? d.assignedExpert.name : (d.expertName || ''),

            // Format Date (DB is ISO DateTime, UI expects YYYY-MM-DD or similar string)
            dateCreated: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-CA') : (d.dateCreated || new Date().toISOString().split('T')[0]),
            amount: Number(d.amount) || 0,

            // Parse requiredSkills JSON string to array if needed
            requiredSkills: typeof d.requiredSkills === 'string' ? JSON.parse(d.requiredSkills) : (d.requiredSkills || [])
          }));

          setRequests(prev => {
            // Always MERGE with existing to avoid wiping optimistic updates
            // But if this is a "Filtered" fetch, we might want to ensure we don't show irrelevant ones?
            // Actually, keep safe merge logic.
            const newIds = new Set(parsedData.map((d: any) => d.id));
            const filteredPrev = prev.filter(p => !newIds.has(p.id) && (p.id.startsWith('SUB-') || p.id.startsWith('REQ-') || p.id.startsWith('NEW-')));
            return [...parsedData, ...filteredPrev];
          });

          console.log('Fetched requests from DB:', parsedData.length);
        }
      }
    } catch (e) {
      console.error('Failed to fetch requests', e);
    }
  }

  // Fetch Pool (for Experts)
  const fetchPool = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pool`);
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('json')) {
          const data = await res.json();
          // Parse and map service names (Same logic as fetchRequests - reusable?)
          const parsedData = data.map((d: any) => ({
            ...d,
            batches: d.batches?.map((b: any) => ({ ...b, files: b.files || [] })) || [],
            serviceName: d.pricingPlan ? d.pricingPlan.name : (d.service ? (language === 'en' ? d.service.nameEn : d.service.nameAr) : d.serviceName),
            clientName: d.client ? (d.client.companyName || d.client.user?.name || d.client.name) : 'Unknown Client',
            expertName: d.assignedExpert ? d.assignedExpert.name : (d.expertName || ''),
            dateCreated: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-CA') : (d.dateCreated || new Date().toISOString().split('T')[0]),
            amount: Number(d.amount) || 0,
            requiredSkills: typeof d.requiredSkills === 'string' ? JSON.parse(d.requiredSkills) : (d.requiredSkills || [])
          }));

          setRequests(prev => {
            // Merge pool into requests, avoiding duplicates
            const newIds = new Set(parsedData.map((d: any) => d.id));
            const filteredPrev = prev.filter(p => !newIds.has(p.id));
            return [...filteredPrev, ...parsedData];
          });
          console.log('Fetched pool:', parsedData);
        }
      }
    } catch (e) {
      console.error('Failed to fetch pool', e);
    }
  };

  async function initBackend() {
    setIsLoading(true);
    try {
      // Fetch Settings
      const settingsRes = await fetch(`${API_BASE_URL}/api/settings`);
      if (settingsRes.ok) {
        const ct = settingsRes.headers.get('content-type');
        if (ct && ct.includes('json')) {
          setSettings(await settingsRes.json());
        }
      }

      // Fetch Users (including permissions) with Retry
      // We use a timestamp to bust cache, and fetchWithRetry for robustness
      let usersRes: Response | null = null;
      try {
        usersRes = await fetchWithRetry(`${API_BASE_URL}/api/users?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-store' }
        });
      } catch (err) {
        console.error("Critical API Fetch Failed after retries:", err);
        setApiError(err instanceof Error ? err.message : 'Connection Failed');
        setIsLoading(false);
        return; // Stop initialization if critical data fails
      }

      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json();
        setApiError(null);

        // Sanitize Experts
        const rawExperts = usersData.experts || [];
        const sanitizedExperts: Expert[] = rawExperts.map((e: any) => ({
          ...e,
          id: e.id || 'EXP-UNKNOWN',
          specializations: Array.isArray(e.specializations)
            ? e.specializations.filter((s: any) => typeof s === 'string')
            : [],
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
          mobileNumber: e.mobileNumber || '',
          role: 'EXPERT',
          avatarUrl: e.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.id || Math.random()}`
        }));
        setExperts(sanitizedExperts);

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

        // Sync User Session with fresh data
        const storedUserJSON = localStorage.getItem('finume_user');
        if (storedUserJSON) {
          const storedUser = JSON.parse(storedUserJSON);
          let freshUser: User | undefined;

          if (storedUser.role === 'CLIENT') {
            freshUser = (usersData.clients as Client[] || []).find((c: any) => c.id === storedUser.id);
          } else if (storedUser.role === 'EXPERT') {
            freshUser = (usersData.experts as Expert[] || []).find((e: any) => e.id === storedUser.id);
          } else if (storedUser.role === 'ADMIN') {
            freshUser = (usersData.admins as Admin[] || []).find((a: any) => a.id === storedUser.id);
          }

          if (freshUser) {
            console.log("Refreshing session with fresh data:", freshUser);
            setUser(freshUser);
            localStorage.setItem('finume_user', JSON.stringify(freshUser));
          }
        }
      } else {
        // Handle API Failure response (500)
        let errorMsg = 'Unknown API Error';
        try {
          // Attempt to parse JSON error, fall back to text if HTML/Network error page
          const ct = usersRes?.headers?.get('content-type');
          if (ct && ct.includes('application/json')) {
            const errData = await usersRes?.json();
            errorMsg = errData.error || errData.details || usersRes?.statusText || 'Unknown';
          } else {
            const text = await usersRes?.text();
            console.error("Critical: Received HTML/Text instead of JSON from API:", text?.substring(0, 500));
            errorMsg = `Server Error (${usersRes?.status}): Received non-JSON response. Check console.`;
          }
        } catch (e) {
          errorMsg = usersRes?.statusText || 'Unknown';
        }
        console.error("API Error:", errorMsg);
        setApiError(`API Error: ${errorMsg}`);
      }
    } catch (err: any) {
      // Catch other synchronous errors
      console.error("InitBackend Error:", err);
      setApiError(`App Error: ${err.message}`);
    }

    // Fetch Requests & Pool
    // Fetch Requests & Pool
    let currentUserId = user?.id;
    let currentUserRole = user?.role;

    if (!currentUserId) {
      const stored = localStorage.getItem('finume_user');
      if (stored) {
        try {
          const p = JSON.parse(stored);
          currentUserId = p.id;
          currentUserRole = p.role;
        } catch (e) { }
      }
    }

    // Only filter by ID if it's a CLIENT. Admins/Experts see all (or their specific view logic handles it)
    if (currentUserRole === 'CLIENT' && currentUserId) {
      await fetchRequests(currentUserId);
    } else {
      await fetchRequests();
    }
    await fetchPool();

    // Fetch Services
    try {
      const servicesRes = await fetch(`${API_BASE_URL}/api/services`);
      if (servicesRes.ok) {
        const ct = servicesRes.headers.get('content-type');
        if (ct && ct.includes('json')) {
          const rawServices = await servicesRes.json();
          const mappedServices = rawServices.map((s: any) => ({
            ...s,
            price: s.price !== undefined ? s.price : (s.basePrice !== undefined ? Number(s.basePrice) : 0),
            description: s.description || '',
            nameEn: s.nameEn || 'Unknown Service'
          }));
          setServices(mappedServices);
        }
      }
    } catch (e) { }

    // Fetch Plans
    try {
      const plansRes = await fetch(`${API_BASE_URL}/api/plans`);
      if (plansRes.ok) {
        const ct = plansRes.headers.get('content-type');
        if (ct && ct.includes('json')) {
          const plansData = await plansRes.json();
          const parsedPlans = plansData.map((p: any) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
            attributes: typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes
          }));
          setPlans(parsedPlans);
        }
      }
    } catch (e) { }

    setIsLoading(false);
  }

  const addRequest = async (req: Request): Promise<Request | null> => {
    // 1. Optimistic UI Update
    setRequests(prev => [req, ...prev]);

    // 2. Persist to Backend
    try {
      const payload = {
        clientId: req.clientId,
        serviceId: req.serviceId,
        pricingPlanId: req.pricingPlanId,
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
        setRequests(prev => prev.map(r => r.id === req.id ? { ...req, ...savedReq, status: r.status, batches: req.batches } : r));
        console.log('Request saved to DB:', savedReq);
        return savedReq;
      } else {
        const err = await res.json();
        console.error('Failed to save request:', err);
        alert(`Failed to save request: ${err.error || 'Unknown error'} \nDetails: ${err.details || ''}`);
        return null;
      }
    } catch (error) {
      console.error('Failed to save request to DB', error);
      alert('Network error: Request not saved to database.');
      return null;
    }
  };

  const updateRequestStatus = (id: string, status: Request['status']) => {
    // We reuse the persist logic
    updateRequest(id, { status });
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
        body: JSON.stringify({ assignedExpertId: expertId, status: 'MATCHED', visibility: 'ASSIGNED' })
      }).catch(err => console.error("Failed to assign expert DB", err));
    } catch (e) {
      console.error("Assign request error", e);
    }
  };

  const acceptRequest = async (requestId: string, expertId: string): Promise<boolean> => {
    const expert = experts.find(e => e.id === expertId);
    if (!expert) return false;

    // Optimistic Update
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          assignedExpertId: expertId,
          expertName: expert.name,
          status: 'MATCHED',
          visibility: 'ASSIGNED'
        };
      }
      return r;
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expertId })
      });

      if (!res.ok) {
        console.error('Failed to accept request DB');
        // Revert logic could go here
        return false;
      }
      // Reload pool/requests to clear any stale invites if needed, or rely on optim updates
      return true;
    } catch (e) {
      console.error("Networks error accepting request", e);
      return false;
    }
  };

  const updateExpertStatus = async (expertId: string, status: Expert['status']) => {
    // 1. Optimistic Update
    setExperts(prev => prev.map(e => e.id === expertId ? { ...e, status } : e));

    // 2. Persist
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${expertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        console.error('Failed to update expert status DB');
        // Revert? For now, we assume success or user refreshes.
      }
    } catch (e) {
      console.error('Network error updating expert status', e);
    }
  };

  const updateRequest = async (id: string, updates: Partial<Request>): Promise<boolean> => {
    // 1. Optimistic Update
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    console.log(`[AppContext] Updating request ${id}`, updates);

    // 2. Persist
    try {
      const url = `${API_BASE_URL}/api/requests/${id}`;
      console.log(`[AppContext] sending PATCH to ${url}`);
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      console.log(`[AppContext] Response status: ${res.status}`);

      if (res.ok) {
        const updatedRequest = await res.json();
        console.log('[AppContext] Server returned updated request:', updatedRequest);
        // Update state with actual server data (includes generated timestamps), but MERGE to keep expanded props
        setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updatedRequest } : r));
        return true;
      } else {
        const errText = await res.text();
        console.error('Failed to update request DB', errText);
        alert(`Server Error: Failed to save status. \n${errText}`);
        return false;
      }
    } catch (e) {
      console.error('Failed to update request DB', e);
      alert('Network Error: Failed to save changes. Check console for details.');
      return false;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    // 1. Optimistic Update
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (user && user.id === id) {
      const updatedUser = user ? { ...user, ...updates } as User : null;
      setUser(updatedUser);
      if (updatedUser) {
        localStorage.setItem('finume_user', JSON.stringify(updatedUser));
      }
    }

    // 2. Persist
    try {
      console.log('Persisting Client Update to DB:', updates);
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error('API Error:', errData);
        alert('Failed to save changes: ' + (errData.error || 'Unknown server error'));
      } else {
        console.log('Successfully saved to DB');
      }
    } catch (e) {
      console.error('Failed to update client DB', e);
      alert('Network error: Could not connect to server.');
    }
  };

  const updateExpert = async (id: string, updates: Partial<Expert>) => {
    // 1. Optimistic Update
    setExperts(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

    // 2. Persist
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const updatedExpert = await res.json();
        // Update local state if this is the logged-in user
        if (user && user.id === id) {
          console.log("Updating local session with fresh expert data", updatedExpert);
          // Ensure we preserve the token (it's not changed)
          const token = localStorage.getItem('finume_token') || '';
          setSession(updatedExpert, token);
        }
      } else {
        console.error('Failed to update expert DB');
      }
    } catch (e) {
      console.error('Failed to update expert DB', e);
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

  const updateAdmin = async (id: string, updates: Partial<Admin>) => {
    // 1. Optimistic Update
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

    // Update local user session if the admin is updating themselves
    if (user && user.id === id) {
      setUser(prev => prev ? { ...prev, ...updates } as User : null);
      // Update LocalStorage to keep session fresh
      const stored = localStorage.getItem('finume_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('finume_user', JSON.stringify({ ...parsed, ...updates }));
      }
    }

    // 2. Persist to API
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        console.error("Failed to persist admin update");
        // Optionally revert optimistic update here
      }
    } catch (e) {
      console.error("Network error updating admin", e);
    }
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

  const submitReview = async (requestId: string, review: Review) => {
    // 1. Optimistic Update (Just stores the review object locally for UI)
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, review } : r));

    // 2. Persist to API
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          expertId: review.expertId,
          rating: review.expertRating, // Old Logic (kept for compatibility if needed)
          comment: review.comment,     // Old Logic

          // New Dual Review Fields
          expertReview: review.expertRating,
          expertReviewComment: review.comment, // We map the main comment here
          platformReview: review.adminNps,
          platformReviewComment: review.adminComment
        })
      });

      if (res.ok) {
        console.log("Review saved to DB");
        // Refetch requests to get updated Expert Rating from server calc
        // Or do optimistic calc again
        const request = requests.find(r => r.id === requestId);
        if (request && request.assignedExpertId) {
          // We can rely on refreshData or just manual update
          // Logic remains same for now, server handles the heavy lifting
        }
      }
    } catch (e) {
      console.error("Failed to save review DB", e);
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
      expertName: t('financials.manualSettlement'),
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
      addRequest, updateRequestStatus, assignRequest, acceptRequest, updateExpertStatus, updateRequest,
      updateClient, updateExpert, addClient, addExpert, submitReview,
      addAdmin, updateAdmin, deleteAdmin,
      updateService, addService, deleteService, updatePlan,
      requestPayout, processPayout, manualSettle, checkUsageLimit,
      settings,
      updateSettings,
      clientPermissions,
      getPermissions,
      updatePermissions,
      updateSitePages: async (pages) => {
        await updateSettings({ sitePages: JSON.stringify(pages) });
      },
      isRestoringSession,
      refreshData: initBackend,
      fetchRequests,
      apiError,
      setApiError,
      isLoading,
      setSession,
      notifications,
      markNotificationsAsRead
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

