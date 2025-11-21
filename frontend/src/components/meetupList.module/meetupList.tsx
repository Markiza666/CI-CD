import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Meetup, MeetupFilter } from '../../interfaces/index';
import styles from '../meetupList.module/meetupList.module.scss';
import { useAuth } from '../../context/authContext';
import MeetupFilterForm from '../meetupFilterForm/meetupFilterForm';

const MeetupList: React.FC = () => {
	const [meetups, setMeetups] = useState<Meetup[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { isAuthenticated } = useAuth();

	// --- Filters state ---
	const [filters, setFilters] = useState<MeetupFilter>({
		searchQuery: '',
		location: '',
		isAttending: false,
	});

	const fetchMeetups = async () => {
		setIsLoading(true);
		try {
			// Bygg query‑params baserat på filters
			const params = new URLSearchParams();
			if (filters.searchQuery) params.append("q", filters.searchQuery);
			if (filters.location) params.append("location", filters.location);
			if (filters.isAttending) params.append("attending", "true");

			const response = await apiClient.get<Meetup[]>('/meetups?' + params.toString());
			setMeetups(response.data);
		} catch (err: any) {
			console.error("Failed to fetch meetups:", err);
			const msg = err.response?.data?.message || 'Could not load meetups.';
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	};

	// Kör fetchMeetups varje gång filters ändras
	useEffect(() => {
		fetchMeetups();
	}, [filters]);

	// Helper function to format the date
	const formatDate = (dateString: Date | string) => {
		return new Date(dateString).toLocaleDateString('sv-SE', {
			year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	};

	// --- Render States ---
	if (isLoading) return <p className={`${styles.statusMessage} ${styles.loading}`}>Loading meetups...</p>;
	if (error) return <p className={`${styles.statusMessage} ${styles.error}`}>{error}</p>;

	// --- Main Render ---
	return (
		<div className={styles.meetupListPage}>
			<div className={styles.actionContainer}>
				<Link
					to="/create-meetup"
					className={styles.createButton}
					title={isAuthenticated ? 'Create a new meetup' : 'Log in required to create a meetup'}
				>
					Create a New Meetup
				</Link>
			</div>

			{/* Filterformulär */}
			<MeetupFilterForm
				currentFilters={filters}
				onFilterChange={setFilters}
			/>

			<h1 className={styles.pageTitle}>All Available Meetups ({meetups.length})</h1>

			{meetups.length === 0 ? (
				<p className={`${styles.statusMessage} ${styles.info}`}>No meetups have been created yet. Be the first!</p>
			) : (
				<div className={styles.meetupGrid}>
					{meetups.map(meetup => (
						<div key={meetup.id} className={styles.meetupCard}>
							<Link to={`/meetups/${meetup.id}`} className={styles.cardLink}>
								{meetup.title}
							</Link>
							<p className={styles.cardDate}>{formatDate(meetup.date_time)}</p>
							<p className={styles.cardLocation}>Location: {meetup.location}</p>
							<p className={styles.cardDescription}>{meetup.description}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MeetupList;

