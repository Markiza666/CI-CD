import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Meetup } from '../interfaces/index';
import { useAuth } from '../context/authContext';
import { Link } from 'react-router-dom';
import styles from '../pages/profilePage.module.scss';

const ProfilePage: React.FC = () => {
	const { isAuthenticated, user, logout, updateUser } = useAuth();
	const [upcoming, setUpcoming] = useState<Meetup[]>([]);
	const [past, setPast] = useState<Meetup[]>([]);
	const [createdMeetups, setCreatedMeetups] = useState<Meetup[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 🔹 Hämtar profilinfo
	useEffect(() => {
		if (!isAuthenticated || !user?.id) {
			setIsLoading(false);
			setError('You must be logged in to view your profile.');
			return;
		}

		const fetchProfile = async () => {
			try {
				const profileResponse = await apiClient.get(`/profile`);
				const profileData = profileResponse.data;
				console.log("Profile API response:", profileData);
				/*updateUser({
					id: profileData.id,
					name: profileData.name,
					email: profileData.email,
					created_at: profileData.created_at,
				});*/
				updateUser({
					created_at: profileData.user.created_at,
					name: profileData.user.name,
					email: profileData.user.email,
				});
				//console.log("Efter updateUser, user i context:", user);

				setCreatedMeetups(profileData.createdMeetups);
			} catch (err: any) {
				console.error("Failed to fetch profile:", err);
				const msg = err.response?.data?.error || 'Could not load profile.';
				setError(msg);
			}
		};

		fetchProfile();
	}, [isAuthenticated, user?.id]);

	// 🔹 Hämtar meetups
	useEffect(() => {
		if (!isAuthenticated || !user?.id) return;

		const fetchMeetups = async () => {
			try {
				const registrationsResponse = await apiClient.get(`/meetups/users/${user.id}/registrations`);
				setUpcoming(registrationsResponse.data.upcoming);
				setPast(registrationsResponse.data.past);
			} catch (err: any) {
				console.error("Failed to fetch meetups:", err);
				const msg = err.response?.data?.error || 'Could not load meetups.';
				setError(msg);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMeetups();
	}, [isAuthenticated, user?.id]);

	const formatDate = (dateString: Date | string) => {
		return new Date(dateString).toLocaleDateString('sv-SE', {
			year: 'numeric', month: 'long', day: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	};

	const MeetupListSection: React.FC<{ title: string, meetups: Meetup[], showBadge?: boolean }> = ({ title, meetups, showBadge }) => (
		<section className={styles.meetupListSection}>
			<h2 className={styles.listTitle}>{title} ({meetups.length})</h2>
			{meetups.length === 0 ? (
				<p className={styles.emptyMessage}>No meetups found here.</p>
			) : (
				<ul className={styles.meetupList}>
					{meetups.map(meetup => (
						<li key={meetup.id} className={styles.meetupItem}>
							<Link to={`/meetups/${meetup.id}`} className={styles.meetupLink}>
								{meetup.title}
							</Link>
							<p className={styles.meetupDetails}>
								{formatDate(meetup.date_time)} at {meetup.location}
							</p>
							{showBadge && (
								<span className={styles.attendingBadge}>✔ You are attending</span>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);

	if (isLoading) return <p className="status-message loading">Loading profile...</p>;
	if (error) return <p className="status-message error">{error}</p>;

	return (
		<div className={styles.profilePage}>
			<header className={styles.profileHeader}>
				<h1 className={styles.title}>Welcome, {user?.name || user?.email}!</h1>
				<button type='button' onClick={logout} className={styles.logoutButton}>
					Logout
				</button>
			</header>

			<section className={styles.userDetails}>
				<h2 className={styles.sectionTitle}>Your Details</h2>
				<p><strong>Email:</strong> {user?.email}</p>
				<p><strong>Name:</strong> {user?.name}</p>
				<p><strong>Joined:</strong> {user?.created_at ? formatDate(user.created_at) : "N/A"}</p>
			</section>

			<MeetupListSection title="Upcoming Meetups" meetups={upcoming} showBadge />
			<hr className={styles.divider} />
			<MeetupListSection title="Past Meetups" meetups={past} showBadge />
			<hr className={styles.divider} />
			<MeetupListSection title="Meetups You Created" meetups={createdMeetups} />

			<footer className={styles.footer}>
				<Link to="/create-meetup" className={styles.createButton}>
					+ Create a New Meetup
				</Link>
			</footer>
		</div>
	);
};

export default ProfilePage;
