
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const RequestInitiator = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, addRequest, plans, services, settings } = useAppContext();
    const submittedRef = React.useRef(false);

    useEffect(() => {
        const init = async () => {
            if (!user) return; // Should be protected route

            // Prevent double submission in Strict Mode
            if (submittedRef.current) return;
            submittedRef.current = true;

            const planId = searchParams.get('planId');
            const serviceId = searchParams.get('serviceId');
            const billing = searchParams.get('billing');

            if (planId) {
                const plan = plans.find(p => p.id === planId);
                if (plan) {
                    const discount = billing === 'YEARLY' ? (settings?.yearlyDiscountPercentage || 20) / 100 : 0;
                    const finalPrice = billing === 'YEARLY' ? Math.round(plan.price * 12 * (1 - discount)) : plan.price;

                    const newReq: any = {
                        id: `SUB-${Date.now()}`,
                        pricingPlanId: plan.id,
                        serviceName: `${plan.name} (${billing || 'YEARLY'})`,
                        clientId: user.id,
                        clientName: user.name,
                        expertId: null,
                        expertName: null,
                        status: 'PENDING_PAYMENT',
                        dateCreated: new Date().toISOString(),
                        amount: finalPrice,
                        description: `Subscription to ${plan.name} plan. Billed ${billing || 'YEARLY'}.`,
                        batches: []
                    };
                    const created = await addRequest(newReq);
                    if (created) navigate(`/client/request-received/${created.id}`, { replace: true });
                }
            } else if (serviceId) {
                const service = services.find(s => s.id === serviceId);
                if (service) {
                    const newReq: any = {
                        id: `REQ-${Date.now()}`,
                        serviceId: service.id,
                        serviceName: service.nameEn,
                        clientId: user.id,
                        clientName: user.name,
                        expertId: null,
                        expertName: null,
                        status: 'PENDING_PAYMENT',
                        dateCreated: new Date().toISOString(),
                        amount: service.price,
                        description: service.description,
                        batches: []
                    };
                    const created = await addRequest(newReq);
                    if (created) navigate(`/client/request-received/${created.id}`, { replace: true });
                }
            } else {
                navigate('/client');
            }
        };

        init();
    }, [user, plans, services, searchParams, addRequest, navigate, settings]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500 font-medium">Initializing Request...</span>
        </div>
    );
};

export default RequestInitiator;
