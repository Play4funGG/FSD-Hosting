import { Outlet, Navigate } from 'react-router-dom';
import http from '../http';
import { useState, useEffect } from 'react';

const OrganiserRoutes = () => {
    const [user, setUser] = useState(null);
    const [auth, setAuth] = useState({'token': false});
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
      if (localStorage.getItem("accessToken")) {
        http.get('/user/auth').then((res) => {
          
          setUser(res.data.user);
          console.log(res.data.user);
          if (res.data.user.user_type_id === 3) {
            setAuth({'token': true});
          }
          else {
            setAuth({'token': false});
          }
          //setAuth({'token': true});

        }).finally(() => setLoading(false)); // Set loading to false after the request completes
      } else {
        setLoading(false); // Also set loading to false if there's no accessToken
      }
    }, []);

    if (loading) return <div>Loading...</div>; // Show a loading indicator while checking auth

    return(
        auth.token ? <Outlet/> : <Navigate to="/"/>
    );
};



export default OrganiserRoutes