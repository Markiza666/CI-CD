// -----------------------------------------------------------------------------
// 1. User and Authentication Interfaces (US 1, 2, 7)
// -----------------------------------------------------------------------------

/**
 * Defines the structure of a User object received from the backend.
 * NOTE: The password hash should NEVER be sent to the frontend.
 */
export interface User {
    _id: string;        // Unique ID, used as primary key
    email: string;      // User's email (unique)
    firstName?: string; // Optional user details
    lastName?: string;  // Optional user details
    city?: string;      // Optional user location
}

/**
 * Defines the structure of the JWT payload after decoding the token.
 * This is used client-side to extract critical data like the user ID.
 */
export interface JwtPayload {
    _id: string;        // The user's ID, used by the backend
    email: string;
    iat: number;        // Issued At timestamp
    exp: number;        // Expiration timestamp
}

/**
 * Defines the comprehensive data structure for the Profile Page response (AC 7.3).
 * This usually contains the user object and a list of related meetups.
 */
export interface ProfileData {
    user: User;
    attendingMeetups: Meetup[];
    createdMeetups: Meetup[]; // Har lagt till denna för att det är logiskt
}

// -----------------------------------------------------------------------------
// 2. Meetup Interfaces (US 3, 4, 8)
// -----------------------------------------------------------------------------

/**
 * Defines the structure of a single Meetup event.
 * FIX: Index signature [x: string]: string | null | undefined; is REMOVED
 * to resolve conflicts with 'participants: string[]'.
 * NOTE: The creator field from the backend is often named 'creator' or 'creatorId'.
 * Vi använder 'creator' i EditMeetupForm.tsx, så jag uppdaterar här.
 */
export interface Meetup {
    _id: string;
    title: string;
    description: string;
    date: Date | string; 
    location: string;
    
    // Använder 'creator' för att matcha vad som kommer från backenden, 
    // baserat på hur EditMeetupForm.tsx kontrollerar auktorisering.
    creator: string;        
    
    // Participants array holds the IDs of the users attending.
    participants: string[]; 
}

/**
 * Defines the structure for creating a new Meetup (AC 5.1) 
 * and updating an existing one (AC 5.2).
 * NOTE: 'creator' and 'participants' are handled by the backend.
 */
export interface NewMeetup {
    title: string;
    description: string;
    date: string; // Typically sent as an ISO string (e.g., from datetime-local input)
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