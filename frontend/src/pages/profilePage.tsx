import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Meetup, ProfileData } from '../interfaces/index';
import { useAuth } from '../context/authContext';
import { Link } from 'react-router-dom';
import styles from '../pages/profilePage.module.scss';

const ProfilePage: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth(); 
    
    const [upcoming, setUpcoming] = useState<Meetup[]>([]);
    const [past, setPast] = useState<Meetup[]>([]);
    const [createdMeetups, setCreatedMeetups] = useState<Meetup[]>([]);

    const [profileDetails, setProfileDetails] = useState<{ email: string; firstName: string; created_at?: string }>({
        email: user?.email ?? '',
        firstName: user?.name ?? '',
        created_at: user?.created_at
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setIsLoading(false);
            setError('You must be logged in to view your profile.');
            return;
        }

        const fetchProfile = async () => {
            try {
                const profileResponse = await apiClient.get<ProfileData>(`/profile`);
                const profileData = profileResponse.data;

                setProfileDetails({
                    email: profileData.user.email ?? '',
                    firstName: profileData.user.name ?? '',
                    created_at: profileData.user.created_at,
                });
                
                setCreatedMeetups(profileData.createdMeetups);
            } catch (err: any) {
                console.error("Failed to fetch profile:", err);
                const msg = err.response?.data?.error || 'Could not load profile details.';
                setError(msg);
            }
        };

        fetchProfile();
    }, [isAuthenticated, user?.id]);

    // 🔹 Fetch meetups (Registrations)
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const fetchMeetups = async () => {
            try {
                // NOTE: Using a specific user ID route, assuming this is correct in your backend.
                const registrationsResponse = await apiClient.get(`/meetups/users/${user.id}/registrations`);
                setUpcoming(registrationsResponse.data.upcoming);
                setPast(registrationsResponse.data.past);
            } catch (err: any) {
                console.error("Failed to fetch meetups:", err);
                const msg = err.response?.data?.error || 'Could not load meetups.';
                setError(msg);
            } finally {
                setIsLoading(false); 
            }
        };

        fetchMeetups();
    }, [isAuthenticated, user?.id]);

    // Helper function to format the date
    const formatDate = (dateString: Date | string) => {
        // Formats date using Swedish locale
        return new Date(dateString).toLocaleDateString('sv-SE', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Component for rendering meetup lists
    const MeetupListSection: React.FC<{ title: string, meetups: Meetup[], showBadge?: boolean }> = ({ title, meetups, showBadge }) => (
        <section className={styles.meetupListSection}>
            <h2 className={styles.listTitle}>{title} ({meetups.length})</h2>
            {meetups.length === 0 ? (
                <p className={styles.emptyMessage}>No meetups found here.</p>
            ) : (
                <ul className={styles.meetupList}>
                    {meetups.map(meetup => (
                        <li key={meetup.id} className={styles.meetupItem}>
                            <Link to={`/meetups/${meetup.id}`} className={styles.meetupLink}>
                                {meetup.title}
                            </Link>
                            <p className={styles.meetupDetails}>
                                {formatDate(meetup.date_time)} at {meetup.location}
                            </p>
                            {showBadge && (
                                <span className={styles.attendingBadge}>✔ You are attending</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );

    if (isLoading) return <p className="status-message loading">Loading profile...</p>;
    if (error) return <p className="status-message error">{error}</p>;

    return (
        <div className={styles.profilePage}>
            <header className={styles.profileHeader}>
                <h1 className={styles.title}>Welcome, {profileDetails.firstName || profileDetails.email}!</h1>
                <button type='button' onClick={logout} className={styles.logoutButton}>
                    Logout
                </button>
            </header>

            <section className={styles.userDetails}>
                <h2 className={styles.sectionTitle}>Your Details</h2>
                <p><strong>Email:</strong> {profileDetails.email}</p>
                <p><strong>Name:</strong> {profileDetails.firstName}</p>
                <p><strong>Joined:</strong> {profileDetails.created_at ? formatDate(profileDetails.created_at) : "N/A"}</p>
            </section>

            <MeetupListSection title="Upcoming Meetups" meetups={upcoming} showBadge />
            <hr className={styles.divider} />
            <MeetupListSection title="Past Meetups" meetups={past} showBadge />
            <hr className={styles.divider} />
            <MeetupListSection title="Meetups You Created" meetups={createdMeetups} />

            <footer className={styles.footer}>
                <Link to="/create-meetup" className={styles.createButton}>
                    + Create a New Meetup
                </Link>
            </footer>
        </div>
    );
};

export default ProfilePage;
