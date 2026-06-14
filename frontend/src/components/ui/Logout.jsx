import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
        sessionStorage.clear();

        navigate('/landing');
    }, [navigate]);

    return null;
};

export default Logout;