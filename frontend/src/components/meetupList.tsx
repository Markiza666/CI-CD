import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Meetup } from '../interfaces'; // AC 3.1: Uses Meetup interface for type safety
import { Link } from 'react-router-dom';

// AC 3.1: Component responsible for displaying a list of all meetups.
const MeetupList: React.FC = () => {
    // Initialize state with the Meetup interface array
    const [meetups, setMeetups] = useState<Meetup[]>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMeetups = async () => {
            try {
                // AC 3.1: Fetch list of meetups (P1 API: GET /api/meetups)
                const response = await apiClient.get('/meetups');
                setMeetups(response.data);
                setLoading(false);
            } catch (err: any) {
                console.error("Failed to fetch meetups:", err);
                setError('Could not load meetups. Please try again later.');
                setLoading(false);
            }
        };

        fetchMeetups();
    }, []);

    // Helper function to format the date
    const formatDate = (dateString: Date | string) => {
        // Simple formatting, adjust as needed (e.g., using date-fns)
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        // AC 3.1: Loading state
        return <div className="status-message loading">Loading meetups...</div>; 
    }

    if (error) {
        // AC 3.1: Error state
        return <div className="status-message error">{error}</div>; 
    }

    return (
        <div className="meetup-list-page"> {/* Main container for the page */}
            <h1 className="page-title">Upcoming Meetups</h1>
            
            {meetups.length === 0 ? (
                // AC 3.1: Empty state
                <p className="empty-message">No upcoming meetups found.</p>
            ) : (
                <div className="meetups-grid"> {/* Container for the list of items */}
                    {meetups.map((meetup) => (
                        <article 
                            key={meetup._id} 
                            className="meetup-card"
                        >
                            {/* AC 3.1: Link to detailed view */}
                            <Link to={`/meetups/${meetup._id}`} className="card-link">
                                <h2 className="card-title">{meetup.title}</h2>
                            </Link>
                            <p className="card-date-location">
                                {formatDate(meetup.date)} in {meetup.location}
                            </p>
                            <p className="card-description">
                                {meetup.description}
                            </p>
                            
                            <footer className="card-footer">
                                <span className="card-participants">
                                    {meetup.participants.length} attending
                                </span> 
                                <Link 
                                    to={`/meetups/${meetup._id}`}
                                    className="details-link"
                                >
                                    View Details &rarr;
                                </Link>
                            </footer>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MeetupList;
