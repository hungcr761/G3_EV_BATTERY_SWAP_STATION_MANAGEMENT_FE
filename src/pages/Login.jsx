import React from 'react';
import LoginForm from '../components/Auth/LoginForm';
import SimpleHeader from '../components/Layout/SimpleHeader';

const Login = () => {
    return (
        <>
            <SimpleHeader />
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                <LoginForm />
            </div>
        </>
    );
};

export default Login;
