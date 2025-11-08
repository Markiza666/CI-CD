import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { ProfileData, Meetup, User } from '../interfaces'; 
import { useAuth } from '../context/authContext';
import { Link, useNavigate } from 'react-router-dom';

const MOCK_PROFILE_DATA: ProfileData = {
    user: {
        _id: 'mock-user-1',
        email: 'markiza.swe@example.com',
        username: 'markiza_dev',
        firstName: 'Markiza',
        city: 'Västerbotten',
    },
    attendingMeetups: [
        {
            _id: 'm1',
            title: 'Frontend State Management Workshop',
            location: 'Online via Zoom',
            date: new Date(Date.now() + 86400000).toISOString(), 
        } as Meetup,
        {
            _id: 'm3',
            title: 'Sass & BEM Deep Dive',
            location: 'Umeå Stadsbibliotek',
            date: new Date(Date.now() + 5 * 86400000).toISOString(),
        } as Meetup,
    ],
    createdMeetups: [
        {
            _id: 'm2',
            title: 'Första React-träffen i Skellefteå',
            location: 'Co-working Space, Skellefteå',
            date: new Date(Date.now() + 10 * 86400000).toISOString(),
        } as Meetup,
    ],
};

// AC 7.3: Component responsible for displaying the user's profile and activities.
const ProfilePage: React.FC = () => {
    const { isAuthenticated, logout, user: authUser } = useAuth(); // Använd 'user' från AuthContext för fallback
    const navigate = useNavigate();
    
    // State to hold the fetched profile data
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hantera utloggning och omdirigering
    const handleLogout = () => {
        logout();
        navigate('/'); // Skickar användaren till startsidan efter utloggning
    };

    useEffect(() => {
        if (!isAuthenticated) { 
            setIsLoading(false);
            setError('You must be logged in to view your profile.');
            return;
        }

        const fetchProfileData = async () => {
            try {
                // --- BÖRJAN AV MOCK-LOGIKEN (ersätter det riktiga API-anropet) ---
                
                // 1. Simulerar ett API-anrop med en liten fördröjning
                await new Promise(resolve => setTimeout(resolve, 800)); 
                
                // 2. Sätt mock-datan istället för en riktig response
                setProfileData(MOCK_PROFILE_DATA); 
                
                // --- SLUT MOCK-LOGIK ---

                // ORIGINAL KOD: const response = await apiClient.get<ProfileData>('/profile');
                // setProfileData(response.data);

                setError(null);
            } catch (err: any) {
                // Denna del av koden skulle köras vid riktigt API-fel
                console.error("Failed to fetch profile data:", err);
                const msg = err.response?.data?.message || 'Could not load profile data.';
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [isAuthenticated]); 

    // Helper function to format the date 
    const formatDate = (dateString: Date | string) => {
        // Kontrollera att datumet är giltigt innan formatering
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    
    // Helper component to render a list of meetups (Som du skrev den)
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
    
    // Använd mockData om den finns, annars AuthContext's user
    const userToDisplay = profileData?.user || authUser; 

    if (!userToDisplay) return <p className="status-message">Profile data is unavailable.</p>;

    const { attendingMeetups, createdMeetups } = profileData || { attendingMeetups: [], createdMeetups: [] };
    
    // --- Main Render (AC 7.3) ---
    return (
        <div className="profile-page mt-10">
            <header className="profile-header mb-8 pb-4 border-b flex justify-between items-center">
                <h1 className="text-4xl font-bold">Welcome, {userToDisplay.firstName || userToDisplay.email}!</h1>
                <button 
                    onClick={handleLogout} 
                    className="logout-button bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                >
                    Logout
                </button>
            </header>
            
            <section className="user-details mb-8 p-6 bg-gray-50 rounded shadow-inner">
                <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
                <p><strong>Email:</strong> {userToDisplay.email}</p>
                <p><strong>Location:</strong> {userToDisplay.city || 'Not specified'}</p>
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
