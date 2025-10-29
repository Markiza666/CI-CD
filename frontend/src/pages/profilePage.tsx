import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
// AC 7.3: Import the common interfaces for consistency
import { User, Meetup } from '../interfaces'; 

// AC 7.2: Component responsible for displaying protected user data.
const ProfilePage: React.FC = () => {
    // State now uses the imported types User and Meetup
    const [user, setUser] = useState<User | null>(null);
    const [attendingMeetups, setAttendingMeetups] = useState<Meetup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        
        // AC 7.1: Security Check 1 - If no token exists, redirect to login
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // AC 7.2 & 7.3: Call P1's protected API (GET /api/user/profile)
                const response = await apiClient.get('/user/profile');
                const { user, attendingMeetups } = response.data;
                
                setUser(user);
                setAttendingMeetups(attendingMeetups || []);
            } catch (err: any) {
                // AC 7.2: Security Check 2 - Handle token expiration or invalid token (401/403 errors)
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                } else {
                    setError('Could not load profile data. Please try again later.'); 
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);
    
    // Loading state
    if (isLoading) return <p className="status-message loading">Loading your profile...</p>;
    
    // Error state
    if (error) return <p className="status-message error">{error}</p>;
    
    // Not Logged In state
    if (!user) return <p className="status-message">You must be logged in to view this page.</p>;

    return (
        <div className="profile-page"> 
            <h1 className="page-title">My Profile</h1>
            
            {/* User Information (AC 7.3) */}
            <section className="profile-section user-info-card"> 
                <h2 className="section-title">User Information</h2>
                <p><strong>Email:</strong> {user.email}</p>
                {/* Assuming user has an 'id' property or similar */}
                <p><strong>User ID:</strong> {user._id || 'N/A'}</p> 
            </section>

            {/* Attending Meetups (AC 7.3) */}
            <section className="profile-section meetups-card">
                <h2 className="section-title">My Registered Meetups</h2>
                
                {attendingMeetups.length > 0 ? (
                    <ul className="meetup-list">
                        {attendingMeetups.map((meetup) => (
                            // FIX: Using meetup._id if that's what the API returns, or meetup.id if that's in your shared interface.
                            // I'm using meetup._id which is standard, assuming your shared interface uses it.
                            <li key={meetup._id} className="meetup-list-item"> 
                                {/* FIX: Using meetup._id for the Link, too. */}
                                <Link to={`/meetups/${meetup._id}`} className="meetup-title-link"> 
                                    {meetup.title}
                                </Link>
                                <span className="meetup-date-location">
                                    {new Date(meetup.date).toLocaleDateString()}
                                    {meetup.location}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-message">You are not registered for any meetups yet.</p>
                )}
            </section>
        </div>
    );
};

export default ProfilePage;
