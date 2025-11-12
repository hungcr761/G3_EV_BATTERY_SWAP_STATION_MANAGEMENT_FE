import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm';
import SimpleHeader from '../components/Layout/SimpleHeader';

const Register = () => {
    return (
        <>
            <SimpleHeader />
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                <RegisterForm />
            </div>
        </>
    );
};

export default Register;
