import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Request } from '../../types';
import { ServiceCatalog } from '../../components/dashboard/ServiceCatalog';
import { Sparkles } from 'lucide-react';

const ClientServices = () => {
    const { user, services, plans, addRequest, t } = useAppContext();
    const navigate = useNavigate();

    const handleBookService = async (serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (!user || !service) return;

        const requestId = `REQ-${Math.floor(Math.random() * 100000)}`;
        const today = new Date().toISOString().split('T')[0];

        const newRequest: Request = {
            id: requestId,
            clientId: user.id,
            clientName: user.name,
            serviceId: service.id,
            serviceName: service.nameEn,
            status: 'PENDING',
            amount: service.price,
            dateCreated: today,
            description: `Booked Service: ${service.nameEn}`,
        };

        const savedReq = await addRequest(newRequest);
        if (savedReq) {
            navigate(`/client/request-received/${savedReq.id}`);
        }
    };

    const handleSubscribePlan = async (planId: string) => {
        if (!user) return;
        const selectedPlan = (plans || []).find(p => p.id === planId);

        const requestId = `SUB-${Math.floor(Math.random() * 100000)}`;
        const today = new Date().toISOString().split('T')[0];

        const newRequest: Request = {
            id: requestId,
            clientId: user.id,
            clientName: user.name,
            pricingPlanId: selectedPlan ? selectedPlan.id : undefined,
            serviceName: selectedPlan ? `Subscription: ${selectedPlan.name}` : 'Plan Subscription',
            status: 'PENDING',
            amount: selectedPlan ? selectedPlan.price : 0,
            dateCreated: today,
            description: `Subscription to ${selectedPlan?.name || 'Plan'}`,
        };
        const savedReq = await addRequest(newRequest);
        if (savedReq) {
            navigate(`/client/request-received/${savedReq.id}`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">

            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-[0.05] rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500 opacity-[0.1] rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium mb-6">
                        <Sparkles size={16} className="text-yellow-400" />
                        <span>Premium Financial Solutions</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Services & Pricing
                    </h1>
                    <p className="text-lg md:text-xl opacity-80 max-w-2xl leading-relaxed">
                        Choose from our catalog of certified financial services or subscribe to a plan that fits your business needs.
                        Transparent pricing, no hidden fees.
                    </p>
                </div>
            </div>

            {/* Catalog */}
            <ServiceCatalog
                onSelectService={handleBookService}
                onSelectPlan={handleSubscribePlan}
            />
        </div>
    );
};

export default ClientServices;
