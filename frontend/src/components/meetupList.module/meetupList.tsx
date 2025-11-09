import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ProfileData, Meetup } from '../../interfaces/index'; 
import { useAuth } from '../../context/authContext';
import { Link } from 'react-router-dom';

// AC 7.3: Component responsible for displaying the user's profile and activities.
const ProfilePage: React.FC = () => {
    // Get the login status and token status from the AuthContext
    const { isAuthenticated, logout } = useAuth();
    
    // State to hold the fetched profile data
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redundant check, but good practice since ProtectedRoute might not have fired yet
        if (!isAuthenticated) { 
            // If not authenticated, the ProtectedRoute should handle redirecting, 
            // but we ensure a clear error state here.
            setIsLoading(false);
            setError('You must be logged in to view your profile.');
            return;
        }

        const fetchProfileData = async () => {
            try {
                // AC 7.3: Fetch comprehensive user data and related meetups (GET /api/profile)
                // This assumes your backend provides user data, attending, AND created meetups.
                const response = await apiClient.get<ProfileData>('/profile');
                setProfileData(response.data);
            } catch (err: any) {
                console.error("Failed to fetch profile data:", err);
                const msg = err.response?.data?.message || 'Could not load profile data.';
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [isAuthenticated]); // Rerun fetch if authentication status changes

    // Helper function to format the date (copied from MeetupList/Detail)
    const formatDate = (dateString: Date | string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    
    // Helper component to render a list of meetups
    const MeetupListSection: React.FC<{ title: string, meetups: Meetup[] }> = ({ title, meetups }) => (
        <section className="profile-meetup-list mb-8 p-4 border rounded shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{title} ({meetups.length})</h2>
            {meetups.length === 0 ? (
                <p className="text-gray-500">No meetups found here.</p>
            ) : (
                <ul className="space-y-3">
                    {meetups.map(meetup => (
                        <li key={meetup._id} className="border-l-4 border-indigo-500 pl-3">
                            <Link to={`/meetups/${meetup._id}`} className="text-indigo-600 hover:text-indigo-800 font-medium block">
                                {meetup.title}
                            </Link>
                            <p className="text-sm text-gray-600">{formatDate(meetup.date)} at {meetup.location}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );

    // --- Render States ---
    if (isLoading) return <p className="status-message loading">Loading profile...</p>;
    if (error) return <p className="status-message error">{error}</p>;
    if (!profileData) return <p className="status-message">Profile data is unavailable.</p>;

    const { user, attendingMeetups, createdMeetups } = profileData;

    // --- Main Render (AC 7.3) ---
    return (
        <div className="profile-page mt-10">
            <header className="profile-header mb-8 pb-4 border-b flex justify-between items-center">
                <h1 className="text-4xl font-bold">Welcome, {user.firstName || user.email}!</h1>
                <button 
                    onClick={logout} 
                    className="logout-button bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                >
                    Logout
                </button>
            </header>
            
            <section className="user-details mb-8 p-6 bg-gray-50 rounded shadow-inner">
                <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Location:</strong> {user.city || 'Not specified'}</p>
                {/* You might add an "Edit Profile" button here later */}
            </section>
            
            {/* Meetups the user is attending (AC 7.3) */}
            <MeetupListSection 
                title="Meetups You Are Attending" 
                meetups={attendingMeetups} 
            />
            
            <hr className="my-8" />

            {/* Meetups the user created (AC 7.3) */}
            <MeetupListSection 
                title="Meetups You Created" 
                meetups={createdMeetups} 
            />

            <footer className="mt-10">
                <Link to="/create-meetup" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    + Create a New Meetup
                </Link>
            </footer>
        </div>
    );
};

export default ProfilePage;
