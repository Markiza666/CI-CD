import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Meetup, User } from '../interfaces'; 
import { useAuth } from '../context/authContext'; 
// FIX: decodeJwt behöver inte importeras här längre
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
    // FIX: Hämta user-objektet (som är null om inte inloggad) och loading-state.
    const { isAuthenticated, user, loading } = useAuth(); 
    
    // GET ACTUAL USER ID FROM CONTEXT (Säkrare än manuell avkodning)
    const currentUserId = user?.id || null; 

    // --- Data Fetching (AC 3.2) ---
    const fetchMeetupDetails = useCallback(async () => {
        if (!id) {
            setError('Meetup ID is missing.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            // FIX: Axios Interceptor sköter Authorization-headern
            const response = await apiClient.get<Meetup>(`/meetups/${id}`);
            const fetchedMeetup = response.data;
            
            setMeetup(fetchedMeetup);
            
            // Determine if the current user is attending (AC 4.1)
            // Låter denna köras även om currentUserId är null (görs i if-satsen nedan)
            if (currentUserId && fetchedMeetup.participants) {
                setIsAttending(fetchedMeetup.participants.includes(currentUserId));
            } else {
                setIsAttending(false);
            }
        } catch (err: any) {
            console.error("Failed to fetch meetup details:", err);
            const status = err.response?.status;
            let msg = 'Could not load meetup details. It may not exist.';

            if (status === 404) {
                msg = "The requested meetup could not be found."
            } else if (status) {
                msg = `Server Error (${status}). Could not load meetup.`;
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [id, currentUserId]); 

    useEffect(() => {
        // FIX: Vänta tills AuthContext har validerat tokenen (loading är false)
        if (!loading) {
            fetchMeetupDetails();
        }
    }, [loading, fetchMeetupDetails]); // Reagera på loading state från AuthContext

    // --- Registration Logic (AC 4.1) ---
    const handleRegisterToggle = async () => {
        if (!isAuthenticated || !meetup) { 
            alert('You must be logged in to register for a meetup.');
            navigate('/login');
            return;
        }
        
        if (!currentUserId) {
            alert('Cannot determine user ID. Please log in again.');
            return;
        }
		
       try {
            /*const endpoint = isAttending 
                ? `/meetups/${meetup.id}/unregister` 
                : `/meetups/${meetup.id}/register`;
            
            // AC 4.1: Call the registration/unregistration endpoint (token skickas via Interceptor)
            await apiClient.post(endpoint, {});*/
			   if (isAttending) {
				   // Unregister → DELETE /:id/register
				   await apiClient.delete(`/meetups/${meetup.id}/register`);
			   } else {
				   // Register → POST /:id/register
				   await apiClient.post(`/meetups/${meetup.id}/register`, {});
			   }
            
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
        return new Date(dateString).toLocaleDateString('sv-SE', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // --- Render States ---
    // Visa loading om AuthContext laddar ELLER om meetup-data laddar
    if (loading || isLoading) return <p className="status-message loading">Laddar detaljer...</p>;
    if (error) return <p className="status-message error">{error}</p>;
    if (!meetup) return <p className="status-message">Meetup hittades inte.</p>;

    // --- Main Render (AC 3.2) ---
    return (
        <article className={styles.meetupDetailPage}>
            <header className={styles.detailHeader}>
                <h1 className={styles.detailTitle}>{meetup.title}</h1>
                <p className={styles.detailMeta}>
                    <span className={styles.metaItem}>{formatDate(meetup.date_time)}</span>
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
                        <Link to={`/meetups/edit/${meetup.id}`} className={styles.editLinkButton}>
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
					<ul className={styles.participantList}>
						{meetup.participants.map((p: any) => (
							<li key={p.id} className={styles.participantItem}>
								<span className={styles.participantName}>{p.username}</span>
								<span className={styles.registeredAt}>
									(joined {new Date(p.registered_at).toLocaleDateString('sv-SE')})
								</span>
							</li>
						))}
					</ul>
				)}
			</section>
        </article>
    );
};

export default MeetupDetail;
