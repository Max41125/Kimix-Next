import React from 'react';
import { UserProvider } from '@/app/components/Auth/UserProvider'; // Путь к UserProvider
import Dashboard from '@/app/components/Personal/Dashboard';
import Header from '@/app/components/Module/Header';
const App = () => {
    
    return (
        <>
        <UserProvider >
            <Header />

            <Dashboard />
            
        </UserProvider>
        </>
    );
};

export default App;
