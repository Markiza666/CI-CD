// App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Calendar, Users, Star, LogIn, User, Filter } from 'lucide-react';
// Import the main SCSS file that handles the global structure and layout styles
import './App.scss';

// Import all required interfaces from the centralized definitions
import { Meetup } from './interfaces/index'; 

// --- MOCK DATA FOR DEMONSTRATION ---
// NOTE: This will be replaced by API calls to the backend later.
const DUMMY_MEETUPS: Meetup[] = [
    {
        _id: 'm1',
        title: 'Tech Meetup Västerbotten - Advanced React',
        description: 'Deep dive into React Hooks, Context, and state management in complex applications.',
        date: '2025-12-15',
        time: '18:00',
        location: 'Skellefteå Science City',
        creator: 'u1',
        host: 'Sven Svensson',
        participants: ['u2', 'u3', 'u4'],
        attendees: 3,
        capacity: 50,
        category: 'Technology',
        isAttending: false,
        isPast: false,
        rating: 4.5,
        reviews: [
            { user: 'u2', text: 'Very insightful presentation on custom hooks!', rating: 5 },
            { user: 'u4', text: 'Good content, but the pizza was late...', rating: 4 },
        ],
    },
    {
        _id: 'm2',
        title: 'Frontend Framework Showdown',
        description: 'A friendly comparison between Vue, Svelte, and Angular. Bring popcorn!',
        date: '2025-11-20',
        time: '19:30',
        location: 'Umeå Universitet, Sal C',
        creator: 'u5',
        host: 'Elin Andersson',
        participants: ['u1'],
        attendees: 1,
        capacity: 30,
        category: 'Technology',
        isAttending: true,
        isPast: false,
        rating: 4.0,
        reviews: [],
    },
    {
        _id: 'm3',
        title: 'Västerbotten Nature Photography Walk',
        description: 'A morning walk to capture the autumn colors near Tavelsjö. Bring your camera!',
        date: '2025-09-01',
        time: '10:00',
        location: 'Tavelsjöleden',
        creator: 'u6',
        host: 'Karin Björk',
        participants: ['u1', 'u5', 'u2'],
        attendees: 3,
        capacity: 15,
        category: 'Nature',
        isAttending: false,
        isPast: true, // Past meetup
        rating: 5.0,
        reviews: [
            { user: 'u1', text: 'Fantastic light and great company!', rating: 5 },
        ],
    },
];

// --- COMPONENTS ---

/**
 * Renders a single icon with its associated label.
 * @param Icon The Lucide icon component.
 * @param text The text label to display next to the icon.
 */
interface IconInfoProps {
    Icon: React.ElementType; // Use React.ElementType for the icon component
    text: string | number;
}

const IconInfo: React.FC<IconInfoProps> = ({ Icon, text }) => (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Icon className="w-4 h-4" />
        <span>{text}</span>
    </div>
);

/**
 * Renders the main card for a single meetup event.
 * Uses the 'meetup-card' class defined in SCSS for main structure.
 * @param meetup The Meetup object to render.
 */
const MeetupCard: React.FC<{ meetup: Meetup }> = ({ meetup }) => {
    // Helper function to format the date
    const formatDate = (date: Date | string): string => {
        return new Date(date).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const StatusPill: React.FC<{ isPast: boolean; isAttending: boolean }> = ({ isPast, isAttending }) => {
        let text = 'Upcoming';
        let color = 'bg-blue-100 text-blue-800';

        if (isPast) {
            text = 'Past Event';
            color = 'bg-gray-100 text-gray-800';
        } else if (isAttending) {
            text = 'Attending';
            color = 'bg-green-100 text-green-800';
        } else if (meetup.attendees >= meetup.capacity) {
            text = 'Full';
            color = 'bg-red-100 text-red-800';
        }

        return (
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${color}`}>
                {text}
            </span>
        );
    };

    return (
        // Use the SCSS class for the card container
        <div className="meetup-card">
            {/* Header/Title - uses 'card-header' SCSS class */}
            <div className="card-header">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{meetup.title}</h3>
                    <StatusPill isPast={meetup.isPast} isAttending={meetup.isAttending} />
                </div>
                <p className="text-sm text-gray-500 mt-1">{meetup.host} | {meetup.category}</p>
            </div>

            {/* Details Grid (still using Tailwind classes for micro-layout) */}
            <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
                <IconInfo Icon={Calendar} text={`${formatDate(meetup.date)} @ ${meetup.time}`} />
                <IconInfo Icon={MapPin} text={meetup.location} />
                <IconInfo Icon={Users} text={`${meetup.attendees}/${meetup.capacity} attending`} />
                <IconInfo Icon={Star} text={meetup.reviews.length > 0 ? `${meetup.rating.toFixed(1)} (${meetup.reviews.length})` : 'No ratings'} />
            </div>
            
            {/* Description and Actions */}
            <div className="p-4 pt-0">
                <p className="text-gray-700 mb-4 line-clamp-2">{meetup.description}</p>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => alert(`Showing details for: ${meetup.title}`)}
                    >
                        View Details
                    </button>
                    {/* Placeholder for Attend/Unattend Button */}
                    {!meetup.isPast && (
                        <button
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                                meetup.isAttending 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                            onClick={() => alert(`Toggling attendance for: ${meetup.title}`)}
                            disabled={meetup.attendees >= meetup.capacity && !meetup.isAttending}
                        >
                            {meetup.isAttending ? 'Unattend' : 'Attend'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


/**
 * Main application component.
 * Handles state, data fetching (mocked), and filtering.
 */
const App: React.FC = () => {
    // State to hold the list of meetups
    const [meetups, setMeetups] = useState<Meetup[]>([]);
    // State for user authentication (mocked)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // State for the search/filter term
    const [searchTerm, setSearchTerm] = useState('');

    // Mock fetching data on component mount
    useEffect(() => {
        // Simulating an API call delay
        const timer = setTimeout(() => {
            setMeetups(DUMMY_MEETUPS);
        }, 500);
        
        return () => clearTimeout(timer);
    }, []);

    // Filter the meetups based on the search term
    const filteredMeetups = useMemo(() => {
        if (!searchTerm) {
            return meetups;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        
        return meetups.filter(meetup => 
            meetup.title.toLowerCase().includes(lowerCaseSearch) ||
            meetup.description.toLowerCase().includes(lowerCaseSearch) ||
            meetup.location.toLowerCase().includes(lowerCaseSearch) ||
            meetup.host.toLowerCase().includes(lowerCaseSearch)
        );
    }, [meetups, searchTerm]);
    
    // Sort meetups: Upcoming first, then by date. Past events last.
    const sortedMeetups = useMemo(() => {
        return [...filteredMeetups].sort((a, b) => {
            // Put past events at the end
            if (a.isPast !== b.isPast) {
                return a.isPast ? 1 : -1;
            }
            // Sort by date for upcoming events
            if (!a.isPast && !b.isPast) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            // Sort by date for past events (most recent past first, optional)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [filteredMeetups]);


    // Placeholder for authentication handlers
    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);


    return (
        // Use the SCSS class for the main application container
        <div className="app-container">
            {/* Navigation Bar - uses 'app-header' SCSS class */}
            <header className="app-header">
                <div className="header-content">
                    <h1 className="text-2xl font-extrabold text-blue-600 tracking-wider">
                        Västerbotten Meetups
                    </h1>
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                <button 
                                    type='button' 
                                    className="user-profile-icon"
                                    title='View Profile Settings' 
                                >
                                    <User className="w-5 h-5" />
                                </button>
                                <button type='button'
                                    className="meetup-button meetup-button--secondary"
                                    onClick={handleLogout}
                                    title='Log out of the application'
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <button 
                                type='button'
                                className="login-button"
                                onClick={handleLogin}
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Log In</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area - uses 'main-content' SCSS class */}
            <main className="main-content">
                <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Find Your Next Meetup</h2>
                    <div className="flex space-x-4">
                        <div className="relative flex-grow">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title, location, or host..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {/* Placeholder for advanced filters (e.g., date, category) */}
                        <button 
                            type='button'
                            className="flex-shrink-0 flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {/* Meetup List Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {sortedMeetups.length} Meetups Found
                    </h2>
                </div>

                {/* Grid of Meetup Cards - uses the 'meetup-list-grid' SCSS class */}
                <div className="meetup-list-grid">
                    {sortedMeetups.length > 0 ? (
                        sortedMeetups.map((meetup) => (
                            <MeetupCard key={meetup._id} meetup={meetup} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 p-10 bg-white rounded-lg">
                            No meetups found matching your criteria.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
