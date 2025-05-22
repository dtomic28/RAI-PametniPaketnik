import { useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { Navigate } from 'react-router-dom';

function Logout(){
    const userContext = useContext(UserContext); 
    useEffect(function(){
        const logout = async function(){
            userContext.setUserContext(null);
            const res = await fetch("http://localhost:3001/api/users/logout");
        }
        logout();
    }, []);

    return (
        <Navigate replace to="/login" />
    );
}

export default Logout;