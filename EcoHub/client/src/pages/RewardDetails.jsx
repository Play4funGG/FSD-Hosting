import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { formatDateTime } from '../utils';
import http from '../http';

function RewardsDetail() {
    const [rewards, initrewards] = useState(null);
    const { id } = useParams();
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {

        const fetchRewards = async () => {
            try {
                const response = await http.get(`rewards/details/${id}`);
                console.log(id)
                initrewards(response.data.targetRewards);
                console.log(response.data.targetRewards)
            } catch (error) {
                console.error('Error fetching rewards details:', error);
            }
        };
        fetchRewards();
    }, [id]);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            getUserId();
        }
    }, []);

    const getUserId = async () => {
        try {
            const authResponse = await http.get('/user/auth');
            const id = authResponse.data.user.id;
            setUserId(id);
        } catch (error) {
            console.error('Error fetching authenticated user:', error);
            setUserId(null);
        }
    };

    
    const handleclaiming = async (reward_id) => {
        if (!userId) {
            window.alert("Please login or register to sign up for an event.");
            if (window.confirm("Do you have an account?\nClick 'OK' to login or 'Cancel' to register.")) {
                navigate('/login');
            } else {
                navigate('/register');
            }
            return;
        }

        try {
            if(!window.confirm("Are you sure you want to claim this reward?")) {
                return;
            }
            const claimResponse = await http.post(`/rewards/claimreward`, { userId, reward_id });
            console.log(claimResponse.data);
            window.alert("Successfully claimed the reward.");
            
        } catch (error) {
            console.error('Error claiming reward:', error);
            window.alert("Failed to claim reward.");
        }
    };


    if (!rewards) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="breadcrumbs text-2xl md-6">
                <ul>
                    <li><button onClick={() => navigate('/')}>Home</button></li> 
                    <li><button onClick={() => navigate('/rewards')}>Rewards Page</button></li> 
                    <li>Reward Details</li>
                </ul>
            </div>

            <div class="flex justify-center items-center">
            {rewards.map(targetRewards =>(
            <div  className="card bg-base-120 w-192 shadow-xl mb-6 ">
            <figure>
                <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                alt="Shoes" />
            </figure>
            <div className="card-body text-white flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold mb-4 text-black">Name: {targetRewards.reward_name}</h3>
                <p className="text-2xl text-black">Type: {targetRewards.rewardsType.rewards_type_description}</p>
                <p className="text-2xl text-black">Description: {targetRewards.reward_description}</p>
                {userId && (
                    <button className="btn btn-primary" onClick={() => handleclaiming(targetRewards.reward_id)}>Claim</button>
                )}
            </div>
            </div>
            ))}
            </div>
        </div>
    );
}

export default RewardsDetail;
