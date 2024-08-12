import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Tutorials from './pages/Tutorials'; //remove this later on
// import AddTutorial from './pages/AddTutorial'; //remove this later on
// import EditTutorial from './pages/EditTutorial'; //remove this later on
import MyForm from './pages/MyForm';
import Register from './pages/Register';
import Login from './pages/Login';
import EventsMain from './pages/EventsMain';
import EventsSorting from './pages/EventsSorting';
import EventsDetail from './pages/EventsDetail';
import Calendar from './pages/EventCalendar';
import UpcomingEvents from './pages/UpcomingEvents';
import PastEvents from './pages/PastEvents';
import http from './http';
import UserContext from './contexts/UserContext';
import UserProfile from './pages/UserProfile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AdminRoutes from './utils/AdminRoutes';
import OrganiserRoutes from './utils/OrganiserRoutes';
import AdminHome from './pages/AdminHome';
import AdminEvents from './pages/AdminEvents';
import AddEvent from './pages/AddEvent';
import UserEventsManagement from './pages/UserEventsManagement';
import EventBookings from './pages/EventBookings';
import UserCalendar from './pages/UserCalendar';
import RewardsMain from './pages/Rewards';
import AddReward from './pages/AddRewards';
import UserHome from './pages/UserHome';
import RewardsDetail from './pages/RewardDetails';
import AdminEventProposal from './pages/AdminEventProposal';
import UpdateEvent from './pages/UpdateEvent';
import OrganiserEventProposal from './pages/OrganiserEventProposals';
import OrganiserEvents from './pages/OrganiserEvents';
import AddEventOrganiser from './pages/AddEventOrganiser';
import UpdateEventOrganiser from './pages/UpdateEventOrganiser';
import UpdateProposalsAdmin from './pages/UpdateProposalsAdmin';
import ViewProposalOrganiser from './pages/ViewProposalOrganiser';
import AdminAttendance from './pages/AdminAttendance';
import PageFooter from './pages/PageFooter';
import { GoogleOAuthProvider } from '@react-oauth/google';
import OrganiserAttendance from './pages/OrganiserAttendance';
import UserRewardsManagement from './pages/UserRewardsManagement';
import ContactUs from './pages/ContactUs';
import UpdateProposalOrganiser from './pages/UpdateProposalOrganiser';



function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        //setUser(res.data.user);
        console.log(res.data.user);
        http.get(`/user/users/${res.data.user.id}`)
          .then(res => {
            setUser(res.data);
          })
          .catch(error => console.error('Error fetching user:', error));
      });
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location = "/";
  };

  return (
    <GoogleOAuthProvider clientId="208554047878-jh3n66khbbc5uhj8fdg42k0thhmhp5i7.apps.googleusercontent.com">

      <UserContext.Provider value={{ user, setUser }}>
        <Router>
          <div className="bg-gray-300 min-h-screen">
            <nav className="bg-green-900 shadow-lg top-0 left-0 right-0 z-50 p-3">
              <div className="container mx-auto px-6 py-3">
                <div className="flex justify-between items-center">
                  <Link to="/" className="text-2xl font-semibold text-white">EcoHub</Link>
                  <div className="flex space-x-4">
                    {/*<Link to="/tutorials" className="text-gray-700 hover:text-gray-900">Tutorials</Link>*/}
                    <Link to="/calendar" className="text-white hover:text-gray-900">Calendar</Link>
                    <Link to="/events" className="text-white hover:text-gray-900">Events</Link>
                    <Link to="/rewards" className="text-white hover:text-gray-900">Rewards</Link>
                    <Link to="/contactus" className="text-white hover:text-gray-900">Contact Us</Link>
                    {user && user.user_type_id === 2 && (
                      <Link to="/admin/adminhome" className="text-white hover:text-gray-900">Admin</Link>
                    )
                    }
                    {user && user.user_type_id === 3 && (
                      <Link to="/organiser/proposal" className="text-white hover:text-gray-900">Organiser</Link>
                    )
                    }
                    {user && (
                      <>
                        <span className="text-white">{user.username}</span>
                        <Link to="/user/profile" className="text-white hover:text-gray-300 transition duration-300"><FontAwesomeIcon icon={faUser} /></Link>
                        <button onClick={logout} className="text-white hover:text-gray-300 transition duration-300">Logout</button>
                      </>
                    )}
                    {!user && (
                      <>
                        <Link to="/register" className="text-white hover:text-gray-300 transition duration-300">Register</Link>
                        <Link to="/login" className="text-white hover:text-gray-300 transition duration-300">Login</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </nav>
            <div className="pt-20 container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<UserHome />} />
                {/* <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/addevent" element={<AddTutorial />} />  Change to AddEvent if necessary 
              <Route path="/editevent/:id" element={<EditTutorial />} /> Change to EditEvent if necessary */}
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/register" element={<Register />} /> {/* Add Register Route */}
                <Route path="/login" element={<Login />} /> {/* Add Login Route */}
                <Route path="/events" element={<EventsMain />} /> {/* Add EventsMain Route */}
                <Route path="/events/upcoming/:id" element={<UpcomingEvents />} />
                <Route path="/events/past/:id" element={<PastEvents />} />
                <Route path="/events/details/:id" element={<EventsDetail />} /> {/* Route for event details */}
                <Route path="/events/sorting/:id" element={<EventsSorting />} />
                <Route path="/form" element={<MyForm />} />
                <Route path="/calendar" element={<Calendar />} />

                <Route path="/user/profile" element={<UserProfile />} />
                <Route path="/user/events" element={<UserEventsManagement />} />
                <Route path="/user/Calendar" element={<UserCalendar />} />
                <Route path="/user/rewards" element={<UserRewardsManagement />} />

                <Route path="/rewards/create" element={<AddReward />} />
                <Route path="/rewards" element={<RewardsMain />} />
                <Route path="/rewards/details/:id" element={<RewardsDetail />} />

                <Route element={<AdminRoutes />}>
                  <Route path="/admin/adminhome" element={<AdminHome />} />
                  <Route path="/admin/proposals" element={<AdminEventProposal />} /> {/* Route for Proposals from Event Organiser */}
                  <Route path="/admin/proposals/:eventId" element={<UpdateProposalsAdmin />} />
                  <Route path="/admin/event" element={<AdminEvents />} /> {/* Route for Admin events */}
                  <Route path="/admin/event/create" element={<AddEvent />} /> {/* Route for Adding of new event for Admin */}
                  <Route path="/admin/event/:eventId" element={<UpdateEvent />} />
                  <Route path="/admin/event/:eventId/attendance" element={<AdminAttendance />} />
                </Route>
                <Route element={<OrganiserRoutes />}>
                  <Route path="/organiser/proposal" element={<OrganiserEventProposal />} /> {/* Route for Proposals from Event Organiser */}
                  <Route path="/organiser/proposal/:eventId" element={<ViewProposalOrganiser />} />
                  <Route path="/organiser/proposal/update/:eventId" element={<UpdateProposalOrganiser />} />
                  <Route path="/organiser/event" element={<OrganiserEvents />} /> {/* Route for Organiser events */}
                  <Route path="/organiser/proposal/create" element={<AddEventOrganiser />} /> {/* Route for Adding of new proposal for Organiser */}
                  <Route path="/organiser/event/:eventId" element={<UpdateEventOrganiser />} />
                  <Route path="/organiser/event/:eventId/attendance" element={<OrganiserAttendance />} />
                </Route>
              </Routes>
            </div>
          </div>
        </Router>
        <PageFooter />
      </UserContext.Provider>
    </GoogleOAuthProvider>

  );
}

export default App;
