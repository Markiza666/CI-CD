// -----------------------------------------------------------------------------
// 1. User and Authentication Interfaces (US 1, 2, 7)
// -----------------------------------------------------------------------------

/**
 * Defines the structure of a User object received from the backend.
 * NOTE: The password hash should NEVER be sent to the frontend.
 */
export interface User {
    _id: string;        // Unique ID, used as primary key
    email?: string;      // User's email (unique)
    username: string;
    firstName?: string; // Optional user details
    lastName?: string;  // Optional user details
    city?: string;      // Optional user location
}

/**
 * Defines the structure of the JWT payload after decoding the token.
 * This is used client-side to extract critical data like the user ID.
 */
export interface JwtPayload {
    _id?: string;        // The user's ID, used by the backend
    sub?: string;
    userId?: string;
    username?: string;
    email?: string;
    iat?: number;        // Issued At timestamp
    exp?: number;        // Expiration timestamp
}

/**
 * Defines the comprehensive data structure for the Profile Page response (AC 7.3).
 * This usually contains the user object and a list of related meetups.
 */
export interface ProfileData {
    user: User;
    attendingMeetups: Meetup[];
    createdMeetups: Meetup[]; 
}

// -----------------------------------------------------------------------------
// 2. Meetup Interfaces (US 3, 4, 8)
// -----------------------------------------------------------------------------

/**
 * Defines the structure for a single review/rating on a meetup.
 */
export interface Review {
    user: string; // ID för användaren som skrivit recensionen
    text: string;
    rating: number; // T.ex. 1 till 5
}

/**
 * Defines the structure of a single Meetup event.
 * This interface has now been extended to include all fields used
 * in App.tsx (UI rendering) and mock data.
 */
export interface Meetup {
    _id: string;
    title: string;
    description: string;
    date: string; 
    location: string;
    organizer: string; // User ID
    
    // Existing Backend fields:
    creator: string;        
    participants: string[]; 
    
    // New fields for the UI (retrieved from the mock data in App.tsx):
    category: string; 
    time: string; // E.g. "18:00"
    host: string; // The name of the host (can be the same as creator, but easier to render)
    capacity: number;
    attendees: string;
    isAttending: boolean; // Flag for current user
    isPast: boolean; // Flag to indicate if the meeting has passed
    rating: number; // Average rating from reviews
    reviews: Review[]; // Array with all reviews
}

/**
 * Defines the structure for creating a new Meetup (AC 5.1) 
 * and updating an existing one (AC 5.2).
 * 
 * 
 * 
 * FIX: adds fields needed when creating/editing to the form.
 * Note: we may need to add 'category', 'time', 'capacity' here based on your form.
 */
export interface NewMeetup {
    title: string;
    description: string;
    date: string; // Typically sent as an ISO string (e.g., from datetime-local input)
    location: string;
    category: string;
    time: string;
    capacity: number;
}

/**
 * Defines the structure for search/filter criteria (US 4).
 */
export interface MeetupFilter {
    searchQuery: string;
    city?: string;
    date?: Date | string;
    isAttending?: boolean;
    // we may want to add filters for category, rating, etc. in the future.
}