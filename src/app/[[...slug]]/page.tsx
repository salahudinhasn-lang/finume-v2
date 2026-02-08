'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the App component with SSR disabled
const App = dynamic(() => import('../../frontend/App'), { ssr: false });

export default function CatchAllPage() {
    return <App />;
}
