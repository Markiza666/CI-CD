import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importing our new components
import { AuthProvider } from './context/authContext'; 
import ProtectedRoute from './components/protectedRoute';

// Importing all major components
import RegisterForm from './components/registerForm'; 
import LoginForm from './components/loginForm';     
import MeetupList from './components/meetupList';   
import ProfilePage from './pages/profilePage';      
import MeetupDetail from './pages/meetupDetail'; 
import Header from './components/header';           
import CreateMeetupForm from './components/createMeetupForm';
import EditMeetupForm from './components/editMeetupForm';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <main className="container mx-auto p-4 max-w-4xl">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<MeetupList />} /> 
                        <Route path="/register" element={<RegisterForm />} />
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/meetups/:id" element={<MeetupDetail />} />

                        {/* ========================================== */}
                        {/* Protected Routes - All routes inside this <Route> require authentication */}
                        {/* 1. Set the element to the ProtectedRoute component. */}
                        <Route element={<ProtectedRoute />}>
                            {/* 2. This route will only render if isAuthenticated is true */}
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/create-meetup" element={<CreateMeetupForm />} />
                            <Route path="/meetups/edit/:id" element={<EditMeetupForm />} /> 
                        </Route>
                        {/* ========================================== */}

                        {/* Catch-all/404 Page */}
                        <Route path="*" element={
                            <h2 className="text-3xl text-red-600 mt-10">
                                404 - Page is not found!
                            </h2>
                        } />
                    </Routes>
                </main>
            </Router>
        </AuthProvider>
    );
};

export default App;
