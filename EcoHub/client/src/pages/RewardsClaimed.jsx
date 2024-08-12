import React, { useState , useEffect } from 'react';
import { FilterList, ViewModule, ViewList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import http from '../http';

function RewardsClaimed() {
  const [view, setView] = useState('grid');
  const [searchValue, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [userId, setUserId] = useState(null);
  const [rewardsClaimed, initrewards] = useState([]);
  const navigate = useNavigate();

  const getCurrentDateTime = () => new Date();

  const filteredRewards = rewardsClaimed.filter(reward => {
    const rewardTitle = reward.rewards.reward_name ? reward.rewards.reward_name.toLowerCase() : '';
    const searchLower = searchValue.toLowerCase();
    const titleMatchTrue = rewardTitle.includes(searchLower)
    console.log(titleMatchTrue.length);
    return titleMatchTrue;
    });

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
        getUserId();
    }
    }, []);

  useEffect(() => {
    console.log('current user: ',userId)
    http.get(`/rewards/viewclaimedrewards/${userId}`)
    .then(res => {
         const rewards = res.data;
         initrewards(rewards);
         
     })
    .catch(error => console.error('Error fetching rewards:', error));
}, [userId]);

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


  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRewards.length > 0 ? (
        filteredRewards.map(reward => (
            <div key = {reward.claim_ID} className="card bg-base-60 w-96 shadow-xl mb-6">
            <figure>
                <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                alt="Shoes" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">Name: {reward.rewards.reward_name}</h2>
                <p>Type: </p>
                <div className="card-actions justify-end">
                {userId && (
                    <button className="btn btn-primary">Use</button>
                )}
                </div>
            </div>
        </div>
        ))
      ) : (
        <div className="col-span-full text-center p-4">No rewards Claimed</div>
      )}
    </div>
  );
  
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredRewards.length > 0 ? (
      filteredRewards.map(reward => (
          <div key = {reward.claim_ID} className="card bg-base-800 shadow-xl border-2">
          <figure>
              <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
              alt="Shoes" />
          </figure>
          <div className="card-body">
              <h2 className="card-title">Name: {reward.rewards.reward_name}</h2>
              <p>Type: </p>
              <div className="card-actions justify-end">
              {userId && (
                  <button className="btn btn-primary">Use</button>
              )}
              </div>
          </div>
      </div>
      ))
    ) : (
      <div className="col-span-full text-center p-4">No rewards Claimed</div>
    )}
  </div>
  );
  



  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">View Rewards</h1>
      <div className="flex justify-between mb-4">
        <div className="form-control">
          <div className="input-group">
            <input type="text" placeholder="Search…" className="input input-bordered text-white" value={searchValue} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex text-white">
          <button className={`btn ${view === 'grid' ? 'btn-active' : ''}`} onClick={() => setView('grid')}>
            <ViewModule />
          </button>
          <button className={`btn ${view === 'list' ? 'btn-active' : ''}`} onClick={() => setView('list')}>
            <ViewList />
          </button>
        </div>
      </div>
      {view === 'list' ? renderListView() : renderGridView()}
    </div>
  );
};

export default RewardsClaimed;
