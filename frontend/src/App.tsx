import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importing all major components
import RegisterForm from './components/registerForm';
import LoginForm from './components/loginForm';     // US 2: Login
import MeetupList from './components/meetupList';   // US 3 & 4: Meetup Listing
import ProfilePage from './pages/profilePage';      // US 7: User Profile
import MeetupDetail from './components/meetupList';    // US 8: Meetup Details
import Header from './components/header';           // Navigation Component

const App: React.FC = () => {
    return (
        <Router>
            <Header />
            <main className="container mx-auto p-4 max-w-4xl">
                <Routes>
                    {/* Main View - List of upcoming meetups (US 3) */}
                    <Route path="/" element={
                        <MeetupList />
                    } /> 
                
                    {/* Authentication Routes (US 1 & 2) */}
                    <Route path="/register" element={
                        <RegisterForm />
                    } />
                    <Route path="/login" element={
                        <LoginForm />
                    } />

                    {/* Meetup Detail Page (US 8) - :id is the Meetup ID */}
                    <Route path="/meetups/:id" element={
                        <MeetupDetail />
                    } />

                    {/* Profile Page (US 7) - Authentication check will be handled inside ProfilePage */}
                    <Route path="/profile" element={
                        <ProfilePage />
                    } />

                    {/* Catch-all/404 Page */}
                    <Route path="*" element={
                        <h2 className="text-3xl text-red-600 mt-10">
                            404 - Page is not found!
                        </h2>
                    } />
                </Routes>
            </main>
        </Router>
    );
};

export default App;
