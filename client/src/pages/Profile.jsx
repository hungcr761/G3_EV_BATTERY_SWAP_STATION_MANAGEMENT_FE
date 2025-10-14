import React from 'react';
import ProfileUpdate from '../components/Dashboard/ProfileUpdate';
import { useNavigate } from 'react-router';

const Profile = () => {
    const navigate = useNavigate();

    return (
        <ProfileUpdate onBack={() => navigate('/dashboard')} />
    );
};

export default Profile;

