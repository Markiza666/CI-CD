import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Meetup, NewMeetup } from '../interfaces';
import { useAuth } from '../context/authContext';

// Hjälpfunktion för att formatera ISO till datetime-local
const formatForDateTimeLocal = (isoString: string) => {
	if (!isoString) return "";
	const date = new Date(isoString);
	return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);
};

const EditMeetupForm: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const currentUserId = user?.id || null;

	const [formData, setFormData] = useState<NewMeetup | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// --- Data Fetching ---
	const fetchMeetup = useCallback(async () => {
		if (!id || !currentUserId) return;

		try {
			const response = await apiClient.get<Meetup>(`/meetups/${id}`);
			const meetup = response.data;

			if (meetup.creator !== currentUserId) {
				setError('You are not authorized to edit this meetup.');
				setLoading(false);
				return;
			}

			const formattedDate = formatForDateTimeLocal(meetup.date_time);

			setFormData({
				title: meetup.title,
				description: meetup.description,
				date_time: formattedDate,
				location: meetup.location,
				category: meetup.category,
				max_capacity: Number(meetup.max_capacity),
			});
		} catch (err: any) {
			console.error("Failed to load meetup:", err);
			const status = err.response?.status;
			let msg = 'Could not load meetup details for editing.';

			if (status === 404) msg = 'Meetup not found.';
			else if (status === 401 || status === 403) msg = 'Authorization required. Please check your login status.';

			setError(msg);
		} finally {
			setLoading(false);
		}
	}, [id, currentUserId]);

	useEffect(() => {
		if (authLoading) return;
		if (!id) {
			setError('Meetup ID is missing.');
			setLoading(false);
			navigate('/');
			return;
		}
		if (!isAuthenticated || !currentUserId) {
			setError('You must be logged in to edit meetups.');
			setLoading(false);
			return;
		}
		fetchMeetup();
	}, [id, currentUserId, authLoading, isAuthenticated, fetchMeetup, navigate]);

	// --- Handle Change ---
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		let value: string | number = e.target.value;

		if (e.target.name === "date_time") {
			const localDate = new Date(value);
			const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
			value = utcDate.toISOString(); // ✅ skickas som UTC
		} else if (e.target.name === "max_capacity") {
			value = parseInt(e.target.value) || 0;
		}

		setFormData(prev => ({
			...prev!,
			[e.target.name]: value,
		}));
	};

	// --- Submit Edit ---
	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData || !id || isSubmitting) return;

		setError(null);
		setIsSubmitting(true);

		try {
			await apiClient.put(`/meetups/${id}`, formData);
			alert('Meetup successfully updated!');
			navigate(`/meetups/${id}`);
		} catch (err: any) {
			console.error("Failed to update meetup:", err);
			const msg = err.response?.data?.message || 'Failed to update meetup.';
			setError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	// --- Delete ---
	const handleDelete = async () => {
		if (!id || !window.confirm('Are you sure you want to delete this meetup?')) return;
		setError(null);
		setIsSubmitting(true);

		try {
			await apiClient.delete(`/meetups/${id}`);
			alert('Meetup successfully deleted!');
			navigate('/');
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
				<div className="form-group">
					<label htmlFor="category">Category</label>
					<select
						id="category"
						name="category"
						value={formData.category}
						onChange={handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
						required
					>
						<option value="Technology">Technology</option>
						<option value="Nature">Nature</option>
						<option value="Art & Culture">Art & Culture</option>
						<option value="Food & Drink">Food & Drink</option>
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="title">Title</label>
					<input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
				</div>

				<div className="form-group">
					<label htmlFor="location">Location</label>
					<input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
				</div>

				<div className="form-group">
					<label htmlFor="date_time">Date and Time</label>
					<input
						type="datetime-local"
						id="date_time"
						name="date_time"
						value={formatForDateTimeLocal(formData.date_time)}
						onChange={handleChange}
						required
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

				<div className="button-group">
					<button type="submit" disabled={isSubmitting} className="submit-button primary">
						{isSubmitting ? 'Updating...' : 'Save Changes'}
					</button>

					<button type="button" onClick={handleDelete} disabled={isSubmitting} className="submit-button delete-button">
						Delete Meetup
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditMeetupForm;
