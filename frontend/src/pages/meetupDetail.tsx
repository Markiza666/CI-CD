import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Meetup, User } from '../interfaces'; 
import { useAuth } from '../context/authContext'; 
import { decodeJwt } from '../utils/jwt';
import { Link } from 'react-router-dom';
import styles from '../pages/meeetupDetail.module.scss';


// AC 3.2: Component responsible for displaying a single meetup and handling registration.
const MeetupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Get meetup ID from URL
    const navigate = useNavigate();
    
    const [meetup, setMeetup] = useState<Meetup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAttending, setIsAttending] = useState(false);
    
    // 1. USE AUTH CONTEXT
    // Get token and auth status from Context
    const { isAuthenticated, token } = useAuth();
    
    // GET ACTUAL USER ID FROM TOKEN
    const currentUserId = token ? decodeJwt(token)?._id : null; // CRITICAL CHANGE

    // --- Data Fetching (AC 3.2) ---
    useEffect(() => {
        if (!id) {
            setError('Meetup ID is missing.');
            setIsLoading(false);
            return;
        }

        const fetchMeetupDetails = async () => {
            try {
                // AC 3.2: Fetch specific meetup details (GET /api/meetups/:id)
                const response = await apiClient.get<Meetup>(`/meetups/${id}`);
                const fetchedMeetup = response.data;
                
                setMeetup(fetchedMeetup);
                
                // Determine if the current user is attending (AC 4.1)
                if (currentUserId) {
                    setIsAttending(fetchedMeetup.participants.includes(currentUserId));
                } else {
                    setIsAttending(false);
                }
            } catch (err) {
                console.error("Failed to fetch meetup details:", err);
                setError('Could not load meetup details. It may not exist.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeetupDetails();
    }, [id, currentUserId]); // Now dependent on currentUserId (which depends on token)

    // --- Registration Logic (AC 4.1) ---
    const handleRegisterToggle = async () => {
        if (!isAuthenticated || !meetup) { // isAuthenticated comes from Context
            alert('You must be logged in to register for a meetup.');
            navigate('/login');
            return;
        }
        
        // Safety check: Ensure we have a user ID before updating attendance
        if (!currentUserId) {
            alert('Cannot determine user ID.');
            return;
        }

        try {
            const endpoint = isAttending ? '/meetups/unregister' : '/meetups/register';
            
            // AC 4.1: Call the registration/unregistration endpoint
            await apiClient.post(endpoint, { meetupId: meetup._id });
            
            // Toggle local state and update participants count
            setIsAttending(!isAttending);
            if (meetup.participants) {
                const newParticipants = isAttending 
                    ? meetup.participants.filter(uid => uid !== currentUserId) // Unregister: remove ID
                    : [...meetup.participants, currentUserId];                 // Register: add ID
                
                setMeetup({...meetup, participants: newParticipants});
            }

            alert(isAttending ? 'Successfully unregistered.' : 'Successfully registered!');
        } catch (err: any) {
            console.error("Registration failed:", err);
            const msg = err.response?.data?.message || 'Failed to update registration status.';
            setError(msg);
        }
    };

    const formatDate = (dateString: Date | string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // --- Render States ---
    if (isLoading) return <p className="status-message loading">Loading meetup details...</p>;
    if (error) return <p className="status-message error">{error}</p>;
    if (!meetup) return <p className="status-message">Meetup not found.</p>;

    // --- Main Render (AC 3.2) ---
    return (
        <article className={styles.meetupDetailPage}>
            <header className={styles.detailHeader}>
                <h1 className={styles.detailTitle}>{meetup.title}</h1>
                <p className={styles.detailMeta}>
                    <span className={styles.metaItem}>{formatDate(meetup.date)}</span>
                    <span className={`${styles.metaItem} ${styles.location}`}>Location: {meetup.location}</span>
                </p>
                
                <div className={styles.actionButtonsGroup}>
                    {/* Registration Button (AC 4.1) */}
                    {isAuthenticated && (
                        <button 
                            onClick={handleRegisterToggle}
                            className={`${styles.toggleButton} ${isAttending ? styles.unregister : styles.register}`}
                        >
                            {isAttending ? 'Unregister' : 'Register for this Meetup'}
                        </button>
                    )}
                    
                    {/* Edit Button (AC 5.2) - Only shown to creator */}
                    {isAuthenticated && currentUserId === meetup.creator && (
                        <Link to={`/meetups/edit/${meetup._id}`} className={styles.editLinkButton}>
                            Edit Meetup
                        </Link>
                    )}
                </div>

            </header>
            
            <section className={`${styles.detailSection} ${styles.descriptionSection}`}>
                <h2 className={styles.sectionTitle}>Description</h2>
                <p className={styles.descriptionText}>{meetup.description}</p>
            </section>

            <section className={`${styles.detailSection} ${styles.participantsSection}`}>
                <h2 className={styles.sectionTitle}>Attendees ({meetup.participants.length})</h2>
                {meetup.participants.length === 0 ? (
                    <p className={styles.emptyMessage}>Be the first to join this meetup!</p>
                ) : (
                    <p className={styles.participantCount}>
                        {meetup.participants.length} people are attending.
                    </p>
                )}
            </section>
        </article>
    );
};

export default MeetupDetail;
