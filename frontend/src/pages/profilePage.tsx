import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { ProfileData, Meetup } from '../interfaces/index';
import { useAuth } from '../context/authContext';
import { Link } from 'react-router-dom';
import styles from '../pages/profilePage.module.scss';

// AC 5.3: Profile page showing user details and meetups.

const ProfilePage: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
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
                const response = await apiClient.get<ProfileData>('/profile');
                setProfileData(response.data);
                console.log("User info:", response.data.user);
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

    const formatDate = (dateString: Date | string) => {
        return new Date(dateString).toLocaleDateString('sv-SE', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const MeetupListSection: React.FC<{ title: string, meetups: Meetup[] }> = ({ title, meetups }) => (
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
                            <p className={styles.meetupDetails}>{formatDate(meetup.date_time)} at {meetup.location}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );

    if (isLoading) return <p className="status-message loading">Loading profile...</p>;
    if (error) return <p className="status-message error">{error}</p>;
    if (!profileData) return <p className="status-message">Profile data is unavailable.</p>;

    const { user, attendingMeetups, createdMeetups } = profileData;

    return (
        <div className={styles.profilePage}>
            <header className={styles.profileHeader}>
                <h1 className={styles.title}>Welcome, {user.firstName || user.email}!</h1>
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
                <p><strong>Name:</strong> {user.firstName}</p>
                <p><strong>Joined:</strong> {formatDate(user.created_at)}</p>
            </section>

            <MeetupListSection title="Meetups You Are Attending" meetups={attendingMeetups} />
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
