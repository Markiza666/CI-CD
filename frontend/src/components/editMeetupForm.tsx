import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Meetup, NewMeetup } from '../interfaces'; 
import { useAuth } from '../context/authContext';
import { decodeJwt } from '../utils/jwt'; 

// AC 5.2 & 5.3: Component for editing or deleting an existing Meetup event.
const EditMeetupForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Meetup ID from URL
    const navigate = useNavigate();
    const { token } = useAuth();
    
    // Get the actual user ID from the token for authorization checks
    const currentUserId = token ? decodeJwt(token)?._id : null; 

    // State for form data, initialized as null until data is fetched
    const [formData, setFormData] = useState<NewMeetup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Data Fetching: Load existing Meetup details ---
    useEffect(() => {
        if (!id) {
            setError('Meetup ID is missing.');
            setLoading(false);
            return;
        }

        const fetchMeetup = async () => {
            try {
                const response = await apiClient.get<Meetup>(`/meetups/${id}`);
                const meetup = response.data;

                // CRITICAL AUTHORIZATION CHECK (AC 5.2 & 5.3): 
                // Only the creator should be able to edit/delete
                if (meetup.creator !== currentUserId) {
                    setError('You are not authorized to edit this meetup.');
                    setLoading(false);
                    return;
                }

                // Format the date for the HTML 'datetime-local' input (YYYY-MM-DDTHH:mm)
                const formattedDate = new Date(meetup.date).toISOString().slice(0, 16);

                // --- KORRIGERING: Inkludera alla fält från NewMeetup-typen ---
                setFormData({
                    title: meetup.title,
                    description: meetup.description,
                    date: formattedDate,
                    location: meetup.location,
                    category: meetup.category, // Saknades
                    time: meetup.time || '00:00', // Saknades (fall back om det inte finns)
                    capacity: meetup.capacity, // Saknades
                });
                
            } catch (err: any) {
                console.error("Failed to load meetup:", err);
                setError('Could not load meetup details for editing.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUserId) { // Ensure user ID is available before fetching and checking auth
            fetchMeetup();
        }

    }, [id, currentUserId, navigate]); 

    // --- Handler for form field changes ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        // Hantera konvertering av kapacitet till nummer
        const value = e.target.name === 'capacity' 
            ? parseInt(e.target.value) || 0 
            : e.target.value;

        setFormData({
            ...formData!, // We know it's not null when this is called
            [e.target.name]: value,
        });
    };

    // --- Handler for Edit Submission (AC 5.2) ---
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !id) return;

        setError(null);
        setIsSubmitting(true);

        try {
            // AC 5.2: Call the protected API endpoint (PUT /api/meetups/:id)
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
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render States ---
    if (loading) return <p className="status-message loading">Loading meetup for editing...</p>;
    if (error) return <p className="status-message error">{error}</p>;
    if (!formData) return <p className="status-message">Could not load meetup data.</p>;


    // --- Main Render ---
    return (
        <div className="edit-meetup-page">
            <h1 className="page-title">Edit Meetup: {formData.title}</h1>
            
            <form onSubmit={handleEditSubmit} className="meetup-form">
                
                {/* Form fields (Title, Location, Date, Description) are identical to CreateMeetupForm */}
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                {/* --- NYTT: Fält för Category (Krävs av NewMeetup) --- */}
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
                
                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date and Time</label>
                    <input 
                        type="datetime-local" 
                        id="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                {/* --- NYTT: Fält för Capacity (Krävs av NewMeetup) --- */}
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
