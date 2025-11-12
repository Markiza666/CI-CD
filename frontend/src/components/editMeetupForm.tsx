import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Meetup, NewMeetup } from '../interfaces'; 
// FIX: Använd useAuth för att få ut den avkodade användaren, inte token och decodeJwt manuellt
import { useAuth } from '../context/authContext'; 
// FIX: decodeJwt behöver inte importeras här längre
// import { decodeJwt } from '../utils/jwt'; 

// AC 5.2 & 5.3: Component for editing or deleting an existing Meetup event.
const EditMeetupForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Meetup ID from URL
    const navigate = useNavigate();
    
    // FIX: Hämta user-objektet (som är null om inte inloggad) och loading state
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    
    // Get the actual user ID from the Context for authorization checks
    // Detta är säkrare än manuell tokenavkodning
    const currentUserId = user?.id || null; 

    // State for form data, initialized as null until data is fetched
    const [formData, setFormData] = useState<NewMeetup | null>(null);
    const [loading, setLoading] = useState(true); // Lokal loading state för datahämtning
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Data Fetching: Load existing Meetup details ---
    const fetchMeetup = useCallback(async () => {
        if (!id || !currentUserId) {
            // Detta hanteras av yttre logik (useEffect) och ProtectedRoute
            return;
        }

        try {
            const response = await apiClient.get<Meetup>(`/meetups/${id}`);
            const meetup = response.data;

            // CRITICAL AUTHORIZATION CHECK (AC 5.2 & 5.3): 
            if (meetup.creator !== currentUserId) {
                setError('You are not authorized to edit this meetup.');
                setLoading(false);
                return;
            }

            // Format the date for the HTML 'datetime-local' input (YYYY-MM-DDTHH:mm)
            // Se till att tiden är i UTC eller anpassas efter vad servern förväntar sig.
            const formattedDate = new Date(meetup.date_time).toISOString().slice(0, 16);

            setFormData({
                title: meetup.title,
                description: meetup.description,
                date_time: formattedDate,
                location: meetup.location,
                category: meetup.category,
                capacity: Number(meetup.capacity),
            });
            
        } catch (err: any) {
            console.error("Failed to load meetup:", err);
            const status = err.response?.status;
            let msg = 'Could not load meetup details for editing.';

            if (status === 404) {
                 msg = 'Meetup not found.';
            } else if (status === 401 || status === 403) {
                 msg = 'Authorization required. Please check your login status.';
                 // Eventuellt: navigate('/login');
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [id, currentUserId]); 

    // --- Effekt: Vänta på AuthContext och User ID ---
    useEffect(() => {
        // Om AuthContext laddar, gör inget ännu.
        if (authLoading) return;

        // Kontrollera om ID saknas (navigeringsfel)
        if (!id) {
            setError('Meetup ID is missing.');
            setLoading(false);
            navigate('/');
            return;
        }
        
        // Kontrollera om användaren inte är inloggad eller om ID saknas i token
        if (!isAuthenticated || !currentUserId) {
            setError('You must be logged in to edit meetups.');
            setLoading(false);
            // Eftersom denna sida är skyddad av <ProtectedRoute />, 
            // kan vi lita på att omdirigering sker där.
            return;
        }

        // Auth är klart och vi har ID, hämta data
        fetchMeetup();

    }, [id, currentUserId, authLoading, isAuthenticated, fetchMeetup, navigate]); 

    // --- Handler for form field changes ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        // Hantera konvertering av kapacitet till nummer
        const value = e.target.name === 'capacity' 
            ? parseInt(e.target.value) || 0 
            : e.target.value;

        setFormData(prev => ({
            ...prev!, 
            [e.target.name]: value,
        }));
    };

    // --- Handler for Edit Submission (AC 5.2) ---
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !id || isSubmitting) return;

        setError(null);
        setIsSubmitting(true);

        try {
            // AC 5.2: Call the protected API endpoint (PUT /api/meetups/:id)
            // Token läggs till automatiskt av Axios Interceptor
            await apiClient.put(`/meetups/${id}`, formData);
            
            alert('Meetup successfully updated!');
            navigate(`/meetups/${id}`); // Redirect back to detail page

        } catch (err: any) {
            console.error("Failed to update meetup:", err);
            const msg = err.response?.data?.message || 'Failed to update meetup.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- Handler for Delete (AC 5.3) ---
    const handleDelete = async () => {
        if (!id || !window.confirm('Are you sure you want to delete this meetup?')) return;
        
        setError(null);
        setIsSubmitting(true);

        try {
            // AC 5.3: Call the protected API endpoint (DELETE /api/meetups/:id)
            await apiClient.delete(`/meetups/${id}`);
            
            alert('Meetup successfully deleted!');
            navigate('/'); // Redirect to the main list page

        } catch (err: any) {
            console.error("Failed to delete meetup:", err);
            const msg = err.response?.data?.message || 'Failed to delete meetup.';
            setError(msg);
            setIsSubmitting(false);
        }
    };

    // --- Render States ---
    if (authLoading || loading) return <p className="status-message loading">Loading authentication and meetup data...</p>;
    
    if (error) return <p className="status-message error">{error}</p>; 
    
    if (!formData) return <p className="status-message">Could not load meetup data.</p>;


    // --- Main Render ---
    return (
        <div className="edit-meetup-page">
            <h1 className="page-title">Edit Meetup: {formData.title}</h1>
            
            <form onSubmit={handleEditSubmit} className="meetup-form">
                
                {/* Fält för Category */}
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select 
                        id="category" 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void} 
                        required
                    >
                        {/* Lägg till dina faktiska kategorier här */}
                        <option value="Technology">Technology</option>
                        <option value="Nature">Nature</option>
                        <option value="Art">Art & Culture</option>
                        <option value="Food">Food & Drink</option>
                    </select>
                </div>
                
                {/* Title */}
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                {/* Location */}
                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
                </div>

                {/* Date and Time */}
                <div className="form-group">
                    <label htmlFor="date">Date and Time</label>
                    <input 
                        type="datetime-local" 
                        id="date" 
                        name="date" 
                        value={formData.date_time} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                {/* Capacity */}
                <div className="form-group">
                    <label htmlFor="capacity">Max Participants (Capacity)</label>
                    <input 
                        type="number" 
                        id="capacity" 
                        name="capacity" 
                        value={formData.capacity} 
                        onChange={handleChange} 
                        min="1"
                        required 
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea 
                        id="description" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows={5}
                    ></textarea>
                </div>
                
                <div className="button-group">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="submit-button primary"
                    >
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="submit-button delete-button"
                    >
                        Delete Meetup
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMeetupForm;
