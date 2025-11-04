import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Meetup, MeetupFilter } from '../interfaces';
import MeetupFilterForm from './meetupFilterForm';
import { Link } from 'react-router-dom';

// AC 3.1: Component responsible for displaying a list of meetups.
const MeetupList: React.FC = () => {
    const [meetups, setMeetups] = useState<Meetup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Default filter state (US 4.1)
    const [filters, setFilters] = useState<MeetupFilter>({
        searchQuery: '',
        city: undefined,
        date: undefined,
        isAttending: false,
    });
    
    // Function to handle changes received from MeetupFilterForm
    const handleFilterChange = (newFilters: MeetupFilter) => {
        setFilters(newFilters);
        // We don't call fetchMeetups here, we rely on the useEffect dependency
    };

    // --- Data Fetching (AC 3.1) ---
    // The fetch function now depends on the 'filters' state
    useEffect(() => {
        const fetchMeetups = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // AC 3.1, 4.1, 4.2, 4.3: Send filter criteria as query parameters to the API
                const response = await apiClient.get<Meetup[]>('/meetups', {
                    params: filters 
                    // Axios automatically converts the filters object into 
                    // a query string: /meetups?searchQuery=...&city=...
                });
                
                setMeetups(response.data);
            } catch (err: any) {
                console.error("Failed to fetch meetups:", err);
                setError('Failed to load meetups. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeetups();
    }, [filters]); // Rerun effect whenever the filter state changes

    // Helper function to format the date 
    const formatDate = (dateString: Date | string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // --- Main Render ---
    return (
        <div className="meetup-list-page mt-10">
            <h1 className="text-4xl font-bold mb-6">Upcoming Meetups</h1>
            
            {/* Render the filter form */}
            <MeetupFilterForm 
                onFilterChange={handleFilterChange}
                currentFilters={filters}
            />

            {isLoading && <p className="status-message loading">Loading meetups...</p>}
            {error && <p className="status-message error">{error}</p>}

            {!isLoading && !error && meetups.length === 0 && (
                <p className="status-message info">No meetups found matching your criteria.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetups.map(meetup => (
                    <div key={meetup._id} className="meetup-card p-4 border rounded shadow-lg transition duration-300 hover:shadow-xl">
                        <Link to={`/meetups/${meetup._id}`} className="text-xl font-semibold text-indigo-600 hover:text-indigo-800 block mb-2">
                            {meetup.title}
                        </Link>
                        <p className="text-sm text-gray-600 mb-1">
                            {formatDate(meetup.date)}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                            Location: {meetup.location}
                        </p>
                        <p className="text-gray-700 line-clamp-2">{meetup.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MeetupList;
