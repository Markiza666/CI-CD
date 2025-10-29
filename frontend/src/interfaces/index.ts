// -----------------------------------------------------------------------------
// 1. User and Authentication Interfaces (US 1, 2, 7)
// -----------------------------------------------------------------------------

/**
 * Defines the structure of a User object received from the backend.
 * NOTE: The password hash should NEVER be sent to the frontend.
 */
export interface User {
    _id: string;        // Postgres unique ID, used as primary key
    email: string;      // User's email (unique)
    firstName?: string; // Optional user details
    lastName?: string;  // Optional user details
    city?: string;      // Optional user location
}

/**
 * Defines the comprehensive data structure for the Profile Page response (AC 7.3).
 * This usually contains the user object and a list of related meetups.
 */
export interface ProfileData {
    user: User;
    // We reuse the Meetup interface here
    attendingMeetups: Meetup[];
    // add createdMeetups: Meetup[] here later if needed
}

// -----------------------------------------------------------------------------
// 2. Meetup Interfaces (US 3, 4, 8)
// -----------------------------------------------------------------------------

/**
 * Defines the structure of a single Meetup event.
 */
export interface Meetup {
    _id: string;
    title: string;
    description: string;
    date: Date | string; // Date object or ISO string (recommended for API data)
    location: string;
    // Participants array holds the IDs of the users attending (strings, likely User._id)
    participants: string[]; 
    creatorId: string;        // ID of the user who created the meetup (string, likely User._id)
}

/**
 * Defines the structure for creating a new Meetup (AC 5.1).
 * NOTE: 'creatorId' and 'participants' are handled by the backend.
 */
export interface NewMeetup {
    title: string;
    description: string;
    date: string; // Typically sent as an ISO string
    location: string;
}

/**
 * Defines the structure for search/filter criteria (US 4).
 */
export interface MeetupFilter {
    searchQuery: string;
    city?: string;
    date?: Date | string;
    isAttending?: boolean;
}
// -----------------------------------------------------------------------------
