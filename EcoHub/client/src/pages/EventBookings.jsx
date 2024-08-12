import React, { useState } from 'react';
import { FilterList, ViewModule, ViewList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EventBookings = ({ bookings }) => {
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const getCurrentDateTime = () => new Date();

  const filteredBookings = bookings.filter(booking => {
    const eventTitle = booking.events.event_title ? booking.events.event_title.toLowerCase() : '';
    const searchLower = search.toLowerCase();
    const isTitleMatch = eventTitle.includes(searchLower);

    const isAll = filter === 'all';
    const isRegistered = filter === 'registered' && booking.status === 'registered';
    const isAttended = filter === 'attended' && booking.status === 'registered' && booking.attendance === 'marked';
    const isUpcoming = filter === 'upcoming' && booking.status === 'registered' && new Date(booking.events.event_date) > getCurrentDateTime();
    const isMissed = filter === 'missed' && booking.status === 'registered' && booking.attendance === 'not_marked' && new Date(booking.events.event_date) <= getCurrentDateTime();

    return isTitleMatch && (isAll || isRegistered || isAttended || isUpcoming || isMissed);
  });

  const handleViewDetails = (eventId) => {
    navigate(`/events/details/${eventId}`);
  };

  const handleWithdraw = async(eventId) => {
    navigate(`/events/details/${eventId}`);
    console.log(`Withdraw from event with SignUpId: ${eventId}`);
  };

  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th className='text-black'>Name</th>
            <th className='text-black'>Time (24H Timing)</th>
            <th className='text-black'>Date</th>
            <th className='text-black'>Status</th>
            <th className='text-black'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <tr key={booking.SignUpId}>
                <td>{booking.events.event_title}</td>
                <td>{`${booking.events.event_start_time} - ${booking.events.event_end_time}`}</td>
                <td>{new Date(booking.events.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td>
                  {booking.status === 'registered' && (
                    <>
                      {booking.attendance === 'marked' ? (
                        <button className="btn btn-sm btn-success mr-2" onClick={() => handleViewDetails(booking.event_id)}>
                          Attended
                        </button>
                      ) : new Date(booking.events.event_date) > getCurrentDateTime() ? (
                        <>
                          <button className="btn btn-sm btn-warning" onClick={() => handleWithdraw(booking.event_id)}>
                            Yet to Withdraw
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-sm bg-red-500 text-white mr-2" onClick={() => handleViewDetails(booking.event_id)}>
                          Missed
                        </button>
                      )}
                    </>
                  )}
                  {booking.status === 'unregistered' && (
                    <span className="badge badge-ghost">Unregistered</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-sm btn-info rounded-lg" onClick={() => handleViewDetails(booking.event_id)}>
                    View Event Details
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No events signed up</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredBookings.length > 0 ? (
        filteredBookings.map(booking => (
          <div key={booking.SignUpId} className="card bg-base-800 shadow-xl border-2">
            <div className="card-body">
              <figure>
              <img 
                    src={booking.events.imageFile ? `${import.meta.env.VITE_FILE_BASE_URL}/${booking.events.imageFile}` : 'https://via.placeholder.com/150'} 
                    alt="Event" 
                    style={{ maxWidth: '350px', maxHeight: '150px', width: '350px', height: '150px', objectFit: 'cover', paddingTop: '-60px' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }} 
                />
              </figure>
              <h2 className="card-title">{booking.events.event_title || 'N/A'}</h2>
              <p>Date: {new Date(booking.events.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p>Time(24H Timing): {`${booking.events.event_start_time} - ${booking.events.event_end_time}`}</p>
              <div className="card-actions justify-end">
                {booking.status === 'registered' && (
                  <>
                    {booking.attendance === 'marked' ? (
                      <button className="btn btn-sm btn-success" onClick={() => handleViewDetails(booking.event_id)}>
                        Attended
                      </button>
                    ) : new Date(booking.events.event_date) > getCurrentDateTime() ? (
                      <>
                        <button className="btn btn-sm btn-warning" onClick={() => handleWithdraw(booking.SignUpId)}>
                          Withdraw
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-sm bg-red-500 text-white mr-2" onClick={() => handleViewDetails(booking.event_id)}>
                        Missed
                      </button>
                    )}
                  </>
                )}
                <button className="btn btn-sm btn-info mr-2" onClick={() => handleViewDetails(booking.event_id)}>
                  View Event Details
                </button>
                {booking.status === 'unregistered' && (
                  <span className="badge badge-ghost">Unregistered</span>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center p-4">No events signed up</div>
      )}
    </div>
  );
  

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">View Bookings</h1>
      <div className="flex justify-between mb-4">
        <div className="form-control">
          <div className="input-group">
            <input type="text" placeholder="Search…" className="input input-bordered text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex text-white">
          <select className="select select-bordered mr-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="registered">Registered</option>
            <option value="attended">Attended</option>
            <option value="upcoming">Upcoming</option>
            <option value="missed">Missed</option>
          </select>
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

export default EventBookings;
