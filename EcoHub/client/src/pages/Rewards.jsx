import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTime } from '../utils';
import http from '../http';
// import { search } from '../../../server/routes/user';

function RewardsMain() {
    const [searchValue, setSearch] = useState('');
    const [rewardsAll, initrewards] = useState([]);

    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        http.get('/rewards')
           .then(res => {
                const rewards = res.data.currentrewards;
                
                initrewards(rewards)
            })
           .catch(error => console.error('Error fetching rewards:', error));
    }, []);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            getUserId();
        }
    }, []);

    const handleViewDetails = (reward_id) => {
        console.log(reward_id);
        navigate(`/rewards/details/${reward_id}`);
    };

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

    const filteredRewards = rewardsAll.filter(reward => {
        const rewardTitle = reward.reward_name ? reward.reward_name.toLowerCase() : '';
        const searchLower = searchValue.toLowerCase();
        const titleMatchTrue = rewardTitle.includes(searchLower)

        return titleMatchTrue;
    });

    const handleclaiming = async (reward_id) => {
        if (!userId) {
            window.alert("Please login or register to sign up for an event.");
            if (window.confirm("Do you have an account?\nClick 'OK' to login or 'Cancel' to register.")) {
                navigate('/login');
            } else {
                navigate('/register');
            }
            return;x
        }

        try {
            const claimResponse = await http.post(`/rewards/claimreward`, { userId, reward_id });
            console.log(claimResponse.data);
            window.alert("Successfully claimed reward.");
            
        } catch (error) {
            console.error('Error claiming reward:', error);
            window.alert("Failed to claim reward.");
        }
    };



    return (
        <div className="container mx-auto px-4 py-8">
            <div className="breadcrumbs text-2xl md-6">
                <ul>
                    <li><button onClick={() => navigate('/')}>Home</button></li> 
                    <li>Rewards Page</li> 
                </ul>
            </div>
            <div className="relative w-full max-w-md">
                <input
                value = {searchValue}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search..."
                className="input input-bordered w-full bg-white text-gray-900 pr-12 rounded"
                />
                <button className="absolute top-0 right-0 mt-2 mr-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a7 7 0 00-7 7 7 7 0 007 7 7 7 0 007-7 7 7 0 00-7-7zm0 14a7 7 0 01-7-7 7 7 0 017-7 7 7 0 017 7 7 7 0 01-7 7z"
                    />
                </svg>
                </button>
            </div>
            <h3 className="text-2xl font-bold mb-4">All Rewards</h3>
            <div className="flex flex-wrap justify-center gap-4" >
            {filteredRewards.map(rewards =>(
                
                <div key = {rewards.reward_id} className="card bg-base-60 w-96 shadow-xl mb-6">
                    <figure>
                        <img
                        src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                        alt="Shoes" />
                    </figure>
                    <div className="card-body">
                        <h2 className="card-title">Name: {rewards.reward_name}</h2>
                        <p>Type: {rewards.rewardsType.rewards_type_description}</p>
                        <div className="card-actions justify-end">
                        <button className="btn btn-primary" onClick={() => handleViewDetails(rewards.reward_id)}>View details</button>
                        {userId && (
                            <button className="btn btn-primary" onClick={() => handleclaiming(targetRewards.reward_id)}>Claim</button>
                        )}
                        </div>
                    </div>
                </div>

            ))}
            </div>
        </div>
    );
}

export default RewardsMain;
