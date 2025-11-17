// -----------------------------------------------------------------------------
// 1. User and Authentication Interfaces (US 1, 2, 7)
// -----------------------------------------------------------------------------


export interface User {
  id: string;        // Unique ID, primary key
  email: string;      // User's email (unique)
  name: string;  // Mappas från DB-kolumn 'name' via SQL alias
  created_at: string   // ISO date string from DB 
}


export interface JwtPayload {
  id?: string;        // The user's ID, used by the backend
  sub?: string;
  userId?: string;
  username?: string;
  email?: string;
  iat?: number;        // Issued At timestamp
  exp?: number;        // Expiration timestamp
}

// -----------------------------------------------------------------------------
// 2. Profile Interfaces (US 7.3)
// -----------------------------------------------------------------------------
export interface ProfileData {
    user: User;
    attendingMeetups: Meetup[];
    createdMeetups: Meetup[]; 
}

// -----------------------------------------------------------------------------
// 3. Meetup Interfaces (US 3, 4, 8)
// -----------------------------------------------------------------------------


export interface Review {
    user: string; // ID för användaren som skrivit recensionen
    text: string;
    rating: number; // T.ex. 1 till 5
}

export interface Participant {
	id: string;
	name: string;
	email: string;
	registered_at: string;
}
export interface Meetup {
    id: string;
    title: string;
    description: string;
	date_time: string;   // ISO date string
    location: string;
	category: string;
	max_capacity: number;
	host_id: string;
	created_at: string;  // ISO date string
	participants: Participant[];

	// UI/extra fields (optional)
	organizer?: string;
	creator?: string;
	time?: string;
	host?: string;
	attendees?: string;
	isAttending?: boolean;
	isPast?: boolean;
	rating?: number;
	reviews?: Review[];
}

// -----------------------------------------------------------------------------
// 4. Meetup Creation & Filtering Interfaces (US 5, US 4)
// -----------------------------------------------------------------------------

export interface NewMeetup {
    title: string;
    description: string;
    date_time: string; 
    location: string;
    category: string;
    max_capacity: number;
}


export interface MeetupFilter {
    searchQuery: string;
    location?: string;
    date_time?: Date | string;
    isAttending?: boolean;
}