import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient'; // Korrigerad relativ sökväg
import { ProfileData, Meetup } from '../interfaces/index'; 
import { useAuth } from '../context/authContext'; // Korrigerad relativ sökväg
import { Link } from 'react-router-dom';
// VIKTIGT: Importera din SCSS-fil här
import styles from '../pages/profilePage.module.scss';

// AC 7.3: Component responsible for displaying the user's profile and activities.
const ProfilePage: React.FC = () => {
    // Get the login status and token status from the AuthContext
    const { isAuthenticated, logout } = useAuth();
    
    // State to hold the fetched profile data
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) { 
            setIsLoading(false);
            setError('You must be logged in to view your profile.');
            return;
        }

        const fetchProfileData = async () => {
            try {
                // AC 7.3: Fetch comprehensive user data and related meetups (GET /api/profile)
                // HÄR ANVÄNDS apiClient
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
    }, [isAuthenticated]); 

    // Helper function to format the date
    const formatDate = (dateString: Date | string) => {
        return new Date(dateString).toLocaleDateString('sv-SE', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    
    // Helper component to render a list of meetups
    const MeetupListSection: React.FC<{ title: string, meetups: Meetup[] }> = ({ title, meetups }) => (
        <section className={styles.meetupListSection}>
            <h2 className={styles.listTitle}>{title} ({meetups.length})</h2>
            {meetups.length === 0 ? (
                <p className={styles.emptyMessage}>No meetups found here.</p>
            ) : (
                <ul className={styles.meetupList}>
                    {meetups.map(meetup => (
                        <li key={meetup._id} className={styles.meetupItem}>
                            <Link to={`/meetups/${meetup._id}`} className={styles.meetupLink}>
                                {meetup.title}
                            </Link>
                            <p className={styles.meetupDetails}>{formatDate(meetup.date_time)} at {meetup.location}</p>
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
       <div className={styles.profilePage}> {/* Huvudklass för hela sidan */}
            <header className={styles.profileHeader}>
                <h1 className={styles.title}>Welcome, {user.firstName || user.email}!</h1>
                console.log("User info:", user);
                <button type='button'
                    onClick={logout} 
                    className={styles.logoutButton}
                >
                    Logout
                </button>
            </header>
            
            <section className={styles.userDetails}>
                <h2 className={styles.sectionTitle}>Your Details</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Location:</strong> {user.city || 'Not specified'}</p>
            </section>
            
            {/* Meetups the user is attending (AC 7.3) */}
            <MeetupListSection 
                title="Meetups You Are Attending" 
                meetups={attendingMeetups} 
            />
            
            <hr className={styles.divider} />

            {/* Meetups the user created (AC 7.3) */}
            <MeetupListSection 
                title="Meetups You Created" 
                meetups={createdMeetups} 
            />

            <footer className={styles.footer}>
                <Link to="/create-meetup" className={styles.createButton}>
                    + Create a New Meetup
                </Link>
            </footer>
        </div>
    );
};

export default ProfilePage;
