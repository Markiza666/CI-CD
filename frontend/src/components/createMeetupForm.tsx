import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { NewMeetup } from '../interfaces'; 
import { useAuth } from '../context/authContext'; 

// Hjälpfunktion för att formatera ISO till datetime-local
const formatForDateTimeLocal = (isoString: string) => {
	if (!isoString) return "";
	const date = new Date(isoString);
	// Tar bort sekunder och tidszon
	return date.toISOString().slice(0, 16);
};


// AC 5.1: Component for creating a new Meetup event.
const CreateMeetupForm: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // Used for an extra check

    const [formData, setFormData] = useState<NewMeetup>({
        title: '',
        description: '',
        date_time: '', 
        location: '',
        category: 'Technology',
        max_capacity: 50,
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial security check (though ProtectedRoute should catch most)
    if (!isAuthenticated) {
        // Fallback or just a quick exit if context state hasn't updated yet
        navigate('/login');
        return null;
    }

    // --- KORRIGERING: Lägg till HTMLSelectElement i typen ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue: string | number;
		if (name === "date_time") {
			const localDate = new Date(value);
			const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
			newValue = utcDate.toISOString();
		} else if (name === "max_capacity") {
			newValue = parseInt(value) || 0;
		} else {
			newValue = value;
		}

        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Simple validation check
        if (!formData.title || !formData.date_time || !formData.location) {
            setError('Please fill in Title, Date, and Location.');
            setIsSubmitting(false);
            return;
        }
		// 🔹 Ny validering: datumet måste vara idag eller framåt
		const selectedDate = new Date(formData.date_time);
		const now = new Date();
		if (selectedDate < now) {
			setError("You cannot create a meetup in the past.");
			setIsSubmitting(false);
			return;
		}

        try {
			console.log("Sending meetup:", formData); //Test log
            const response = await apiClient.post('/meetups', formData);
            alert('Meetup successfully created!');
            const newMeetupId = response.data.id; 
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
                    <label htmlFor="category">Category</label>
                    {/* NOTE: Tvingade konverteringen 'as (e: React.ChangeEvent<HTMLSelectElement>) => void' är nu borttagen */}
                    <select 
                        id="category" 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        required
                    >
                        {/* Lägg till dina faktiska kategorier här */}
                        <option value="Technology">Technology</option>
                        <option value="Nature">Nature</option>
						<option value="Art & Culture">Art & Culture</option>
						<option value="Food & Drink">Food & Drink</option>
                    </select>
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
                    <label htmlFor="date_time">Date and Time</label>
                    {/* Using datetime-local input for easy ISO string format in browsers */}
                    <input 
                        type="datetime-local" 
                        id="date_time" 
                        name="date_time" 
						value={formatForDateTimeLocal(formData.date_time)} 
                        onChange={handleChange} 
                        required 
						min={new Date().toISOString().slice(0, 16)} // 🔹 dagens datum/tid
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="max_capacity">Max Participants (Capacity)</label>
                    <input 
                        type="number" 
                        id="max_capacity" 
                        name="max_capacity" 
                        value={formData.max_capacity} 
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
