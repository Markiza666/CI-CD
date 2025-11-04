import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { NewMeetup } from '../interfaces'; 
import { useAuth } from '../context/authContext'; 

// AC 5.1: Component for creating a new Meetup event.
const CreateMeetupForm: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // Used for an extra check

    const [formData, setFormData] = useState<NewMeetup>({
        title: '',
        description: '',
        // Recommended format: YYYY-MM-DDTHH:mm
        date: '', 
        location: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial security check (though ProtectedRoute should catch most)
    if (!isAuthenticated) {
        // Fallback or just a quick exit if context state hasn't updated yet
        navigate('/login');
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Simple validation check
        if (!formData.title || !formData.date || !formData.location) {
            setError('Please fill in Title, Date, and Location.');
            setIsSubmitting(false);
            return;
        }

        try {
            // AC 5.1: Call the protected API endpoint (POST /api/meetups)
            // The Auth interceptor adds the token automatically.
            const response = await apiClient.post('/meetups', formData);
            
            alert('Meetup successfully created!');
            
            // Redirect to the newly created meetup's detail page
            const newMeetupId = response.data._id; 
            navigate(`/meetups/${newMeetupId}`);

        } catch (err: any) {
            console.error("Failed to create meetup:", err);
            const msg = err.response?.data?.message || 'Failed to create meetup. Check your input.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-meetup-page">
            <h1 className="page-title">Create a New Meetup</h1>
            
            {error && <p className="status-message error">{error}</p>}
            
            <form onSubmit={handleSubmit} className="meetup-form">
                
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input 
                        type="text" 
                        id="location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date and Time</label>
                    {/* Using datetime-local input for easy ISO string format in browsers */}
                    <input 
                        type="datetime-local" 
                        id="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
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
                
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="submit-button"
                >
                    {isSubmitting ? 'Creating...' : 'Create Meetup'}
                </button>
            </form>
        </div>
    );
};

export default CreateMeetupForm;
