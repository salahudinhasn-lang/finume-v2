
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Client, Expert, Admin, Request, Service, Review, PricingPlan, PayoutRequest, Notification } from '../types';
import { MOCK_CLIENTS, MOCK_EXPERTS, MOCK_REQUESTS, SERVICES, MOCK_ADMINS, MOCK_PLANS, MOCK_NOTIFICATIONS } from '../mockData';
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
  notifications: Notification[];
  
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
  resetDatabase: () => void;

  // Payout Actions
  requestPayout: (amount: number, requestIds?: string[]) => void;
  processPayout: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  manualSettle: (requestIds: string[]) => void;

  // Notification Actions
  sendNotification: (toUserId: string, title: string, message: string, type?: 'INFO'|'SUCCESS'|'WARNING'|'ERROR') => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_KEY = 'FINUME_DB_V2'; // Version bump for schema changes
const USER_KEY = 'FINUME_USER_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // "Database" in state
  const [clients, setClients] = useState<Client[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // 1. Initialize from LocalStorage or Mock Data
  useEffect(() => {
    const loadData = () => {
        const savedData = localStorage.getItem(DB_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setClients(parsed.clients || MOCK_CLIENTS);
                setExperts(parsed.experts || MOCK_EXPERTS);
                setRequests(parsed.requests || MOCK_REQUESTS);
                setAdmins(parsed.admins || MOCK_ADMINS);
                setServices(parsed.services || SERVICES);
                setPlans(parsed.plans || MOCK_PLANS);
                setPayoutRequests(parsed.payoutRequests || []);
                setNotifications(parsed.notifications || MOCK_NOTIFICATIONS);
            } catch (e) {
                console.error("Failed to load local DB", e);
                resetToMock();
            }
        } else {
            resetToMock();
        }

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) { console.error("Failed to restore session", e); }
        }
        setIsInitialized(true);
    };

    loadData();
  }, []);

  const resetToMock = () => {
      setClients(MOCK_CLIENTS);
      setExperts(MOCK_EXPERTS);
      setRequests(MOCK_REQUESTS);
      setAdmins(MOCK_ADMINS);
      setServices(SERVICES);
      setPlans(MOCK_PLANS);
      setNotifications(MOCK_NOTIFICATIONS);
      setPayoutRequests([
        { id: 'WD-LEGACY', expertId: 'E1', expertName: 'Expert 1', amount: 0, requestDate: '2023-01-01', processedDate: '2023-01-01', status: 'APPROVED', requestIds: [] }
      ]);
  };

  const resetDatabase = () => {
      if(window.confirm("WARNING: This will wipe all current data and restore original mock data. Continue?")) {
          localStorage.removeItem(DB_KEY);
          localStorage.removeItem(USER_KEY);
          resetToMock();
          setUser(null);
          window.location.reload();
      }
  };

  // 2. Persist Data on Change
  useEffect(() => {
      if (!isInitialized) return;
      
      const dbState = {
          clients, experts, requests, admins, services, plans, payoutRequests, notifications
      };
      localStorage.setItem(DB_KEY, JSON.stringify(dbState));
  }, [clients, experts, requests, admins, services, plans, payoutRequests, notifications, isInitialized]);

  // 3. Persist User Session
  useEffect(() => {
      if (!isInitialized) return;
      if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
          localStorage.removeItem(USER_KEY);
      }
  }, [user, isInitialized]);

  const login = (email: string, role: string, newUser?: User) => {
    if (newUser) { setUser(newUser); return; }
    const normalize = (s: string) => s.trim().toLowerCase();
    
    if (role === 'CLIENT') {
      const client = clients.find(c => normalize(c.email) === normalize(email));
      if (client) { setUser(client); return; } 
      if (email === 'client1@example.com' || !email) { setUser(clients[0]); } 
      else {
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
      }
    } else if (role === 'EXPERT') {
      const expert = experts.find(e => normalize(e.email) === normalize(email));
      if (expert) { setUser(expert); return; }
      setUser(experts[0]);
    } else {
      const admin = admins.find(a => normalize(a.email) === normalize(email));
      if (admin) { setUser(admin); return; }
      setUser(admins[0]);
    }
  };

  const logout = () => setUser(null);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) { value = value?.[k]; }
    return value || key;
  };

  // --- Notification Logic ---
  const sendNotification = (toUserId: string, title: string, message: string, type: Notification['type'] = 'INFO') => {
      // Find the user object to get their actual ID if email was passed (or handle ID directly)
      // Assuming toUserId is the user.id or user.email. Let's normalize to ID.
      let targetId = toUserId;
      // In this mock, we sometimes look up by email, sometimes ID.
      // If we can't find a user by ID, check if it's an email in the DB.
      
      const newNotification: Notification = {
          id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: targetId,
          title,
          message,
          type,
          isRead: false,
          date: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
      if (!user) return;
      setNotifications(prev => prev.map(n => 
          (n.userId === user.id || n.userId === user.email) ? { ...n, isRead: true } : n
      ));
  };

  // --- Main Actions ---

  const addRequest = (req: Request) => {
    setRequests(prev => [req, ...prev]);
    // Notify Admins
    sendNotification('admin@finume.com', 'New Request Received', `Client ${req.clientName} posted a request for ${req.serviceName}.`, 'INFO');
  };

  const updateRequestStatus = (id: string, status: Request['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    // Notifications Logic
    const req = requests.find(r => r.id === id);
    if (req) {
        if (status === 'IN_PROGRESS' && req.clientId) {
            sendNotification(req.clientId, 'Work Started', `Expert ${req.expertName} has started working on ${req.serviceName}.`, 'INFO');
        }
        if (status === 'REVIEW_CLIENT' && req.clientId) {
            sendNotification(req.clientId, 'Approval Needed', `Expert ${req.expertName} has submitted work for approval.`, 'WARNING');
        }
        if (status === 'COMPLETED' && req.assignedExpertId) {
            sendNotification(req.assignedExpertId, 'Job Completed', `You earned ${req.amount * 0.8} SAR from request ${req.id}.`, 'SUCCESS');
        }
    }
  };

  const assignRequest = (requestId: string, expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    if (!expert) return;

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        // Notify Expert
        sendNotification(expert.id, 'New Job Assigned', `You have been assigned to request ${requestId}.`, 'INFO');
        // Notify Client
        if (r.clientId) {
            sendNotification(r.clientId, 'Expert Assigned', `${expert.name} is now handling your request.`, 'SUCCESS');
        }
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
    sendNotification(expertId, 'Account Status Updated', `Your expert account status is now: ${status}`, status === 'ACTIVE' ? 'SUCCESS' : 'WARNING');
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
        // Notify Expert of Review
        sendNotification(request.assignedExpertId, 'New Review', `You received a ${review.expertRating} star review!`, 'SUCCESS');
    }
  };

  const requestPayout = (amount: number, specificRequestIds?: string[]) => {
      if (!user || user.role !== 'EXPERT') return;
      
      let requestIds: string[] = [];
      let payoutAmount = amount;

      if (specificRequestIds && specificRequestIds.length > 0) {
          requestIds = specificRequestIds;
          const selectedRequests = requests.filter(r => requestIds.includes(r.id));
          payoutAmount = selectedRequests.reduce((sum, r) => sum + (r.amount * 0.8), 0);
      } else {
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
      sendNotification('admin@finume.com', 'New Payout Request', `${user.name} requested payout of ${payoutAmount} SAR.`, 'WARNING');
  };

  const processPayout = (id: string, status: 'APPROVED' | 'REJECTED') => {
      setPayoutRequests(prev => prev.map(p => 
          p.id === id ? { ...p, status, processedDate: new Date().toISOString().split('T')[0] } : p
      ));

      // Notification
      const payout = payoutRequests.find(p => p.id === id);
      if (payout) {
          if (status === 'APPROVED') {
              sendNotification(payout.expertId, 'Payout Approved', `Your payout of ${payout.amount} SAR has been processed.`, 'SUCCESS');
          } else {
              sendNotification(payout.expertId, 'Payout Rejected', `Your payout request ${id} was rejected. Contact support.`, 'ERROR');
              // Revert logic
              if (payout.requestIds) {
                  setRequests(prev => prev.map(r => {
                      if (payout.requestIds.includes(r.id)) { return { ...r, payoutId: undefined }; }
                      return r;
                  }));
              }
          }
      }
  };

  const manualSettle = (requestIds: string[]) => {
      const payoutId = `SETTLE-MANUAL-${Date.now()}`;
      const totalAmount = requests.filter(r => requestIds.includes(r.id)).reduce((sum, r) => sum + (r.amount * 0.8), 0);
      const firstReq = requests.find(r => r.id === requestIds[0]);
      const expertId = firstReq?.assignedExpertId;

      const dummyPayout: PayoutRequest = {
          id: payoutId,
          expertId: expertId || 'VARIOUS',
          expertName: 'Manual Settlement',
          amount: totalAmount,
          requestDate: new Date().toISOString().split('T')[0],
          processedDate: new Date().toISOString().split('T')[0],
          status: 'APPROVED',
          requestIds: requestIds
      };
      setPayoutRequests(prev => [dummyPayout, ...prev]);

      setRequests(prev => prev.map(r => {
          if (requestIds.includes(r.id)) { return { ...r, payoutId: payoutId }; }
          return r;
      }));

      // Notify Expert
      if (expertId) {
          sendNotification(expertId, 'Funds Settled', `Admin manually settled ${totalAmount} SAR for ${requestIds.length} tasks.`, 'SUCCESS');
      }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, language, setLanguage, t,
      clients, experts, requests, services, plans, admins, payoutRequests, notifications,
      addRequest, updateRequestStatus, assignRequest, updateExpertStatus, updateRequest,
      updateClient, updateExpert, addClient, addExpert, submitReview,
      addAdmin, updateAdmin, deleteAdmin, resetDatabase,
      updateService, addService, deleteService, updatePlan,
      requestPayout, processPayout, manualSettle,
      sendNotification, markAsRead, markAllAsRead
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
