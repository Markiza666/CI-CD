import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
// AC 3.2 & 4.1: Import the common interfaces
import { Meetup, User } from '../interfaces'; 

// Function to get the current user's ID from the JWT token (or local storage payload)
// NOTE: This is a placeholder; real implementation needs a JWT decoder utility.
const getCurrentUserId = (): string | null => {
    // In a real app, you'd decode the JWT token from localStorage to get the ID.
    // For now, we return a mock ID or null if not logged in.
    return 'mockUserId123'; 
};

// AC 3.2: Component responsible for displaying a single meetup and handling registration.
const MeetupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Get meetup ID from URL
    const navigate = useNavigate();
    
    const [meetup, setMeetup] = useState<Meetup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAttending, setIsAttending] = useState(false);
    
    // Get the current user's ID (used to check registration status and for action)
    const currentUserId = getCurrentUserId();
    const isAuthenticated = !!localStorage.getItem('authToken');

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
                }
            } catch (err) {
                console.error("Failed to fetch meetup details:", err);
                setError('Could not load meetup details. It may not exist.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeetupDetails();
    }, [id, currentUserId]);

    // --- Registration Logic (AC 4.1) ---
    const handleRegisterToggle = async () => {
        if (!isAuthenticated || !meetup) {
            alert('You must be logged in to register for a meetup.');
            navigate('/login');
            return;
        }

        try {
            const endpoint = isAttending ? '/meetups/unregister' : '/meetups/register';
            
            // AC 4.1: Call the registration/unregistration endpoint (POST /api/meetups/register/unregister)
            await apiClient.post(endpoint, { meetupId: meetup._id });
            
            // Toggle local state and update participants count
            setIsAttending(!isAttending);
            if (meetup.participants) {
                const newParticipants = isAttending 
                    ? meetup.participants.filter(uid => uid !== currentUserId) // Unregister: remove ID
                    : [...meetup.participants, currentUserId!];                 // Register: add ID
                
                setMeetup({...meetup, participants: newParticipants});
            }

            alert(isAttending ? 'Successfully unregistered.' : 'Successfully registered!');
        } catch (err: any) {
            console.error("Registration failed:", err);
            const msg = err.response?.data?.message || 'Failed to update registration status.';
            setError(msg);
        }
    };

    // --- Helper function (same as in MeetupList) ---
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
        <article className="meetup-detail-page">
            <header className="detail-header">
                <h1 className="detail-title">{meetup.title}</h1>
                <p className="detail-meta">
                    <span className="meta-item">{formatDate(meetup.date)}</span>
                    <span className="meta-item location">Location: {meetup.location}</span>
                </p>
                
                {/* Registration Button (AC 4.1) */}
                {isAuthenticated && (
                    <button 
                        type="button"
                        onClick={handleRegisterToggle}
                        className={isAttending ? "toggle-button unregister" : "toggle-button register"}
                    >
                        {isAttending ? 'Unregister' : 'Register for this Meetup'}
                    </button>
                )}
            </header>
            
            <section className="detail-section description-section">
                <h2 className="section-title">Description</h2>
                <p className="description-text">{meetup.description}</p>
            </section>

            <section className="detail-section participants-section">
                <h2 className="section-title">Attendees ({meetup.participants.length})</h2>
                {meetup.participants.length === 0 ? (
                    <p className="empty-message">Be the first to join this meetup!</p>
                ) : (
                    <p className="participant-count">
                        {/* Note: Ideally, you'd fetch User objects for names/emails here. */}
                        {meetup.participants.length} people are attending.
                    </p>
                )}
            </section>
        </article>
    );
};

export default MeetupDetail;
