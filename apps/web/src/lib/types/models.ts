// User and Authentication
export interface User {
	id: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	createdAt: string;
	updatedAt: string;
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'USER';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Sector
export interface Sector {
	id: string;
	name: string;
	slug: string;
	colorHex: string;
	exhibitorCount?: number;
	createdAt: string;
	updatedAt: string;
}

// Booth
export interface Booth {
	id: string;
	number: string;
	polygonId: string;
	exhibitor?: Exhibitor;
	exhibitorId?: string;
	createdAt: string;
	updatedAt: string;
}

// Contact
export interface Contact {
	id?: string;
	firstName: string;
	lastName: string;
	role: string;
	email?: string;
	phone?: string;
}

// Exhibitor
export interface Exhibitor {
	id: string;
	name: string;
	slug: string;
	logoUrl?: string;
	description?: string;
	websiteUrl?: string;
	linkedinUrl?: string;
	pdfUrl?: string;
	sector?: Sector;
	sectorId: string;
	booth?: Booth;
	boothId?: string;
	contacts: Contact[];
	themes?: Theme[];
	viewCount?: number;
	favoriteCount?: number;
	createdAt: string;
	updatedAt: string;
}

// Theme (Parcours thématique)
export interface Theme {
	id: string;
	name: string;
	slug: string;
	description?: string;
	order: number;
	exhibitors?: Exhibitor[];
	exhibitorCount?: number;
	createdAt: string;
	updatedAt: string;
}

// Analytics
export interface AnalyticsEvent {
	id: string;
	type: EventType;
	sessionId: string;
	exhibitorId?: string;
	searchQuery?: string;
	userAgent?: string;
	payload?: Record<string, any>;
	createdAt: string;
}

export type EventType = 'view' | 'search' | 'filter' | 'share' | 'qr_scan' | 'favorite';

// Favorite
export interface Favorite {
	id: string;
	sessionId: string;
	exhibitorId: string;
	exhibitor?: Exhibitor;
	createdAt: string;
}

// Session
export interface Session {
	id: string;
	createdAt: Date;
	lastActivity?: Date;
}
