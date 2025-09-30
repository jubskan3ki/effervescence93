// src/lib/types/index.ts

// Types de base
export type ID = string;
export type ISODateTime = string;
export type HexColor = string;

// Enums
export enum UserRole {
	ADMIN = 'ADMIN',
	EDITOR = 'EDITOR',
	VIEWER = 'VIEWER',
}

export enum UserStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
}

export enum AnalyticsEventType {
	VIEW = 'view',
	SEARCH = 'search',
	FAVORITE = 'favorite',
	SHARE = 'share',
	CONTACT = 'contact',
}

// User & Auth
export interface User {
	id: ID;
	email: string;
	role: UserRole;
	status: UserStatus;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface LoginResponse {
	access_token: string;
	user: User;
}

export interface SignupResponse {
	message: string;
	user: User;
}

// Sector
export interface Sector {
	id: ID;
	name: string;
	colorHex: HexColor;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface SectorWithStats extends Sector {
	_count?: {
		exhibitors: number;
	};
	totalViews?: number;
}

// Booth
export interface Booth {
	id: string;
	number: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation?: number;
	polygonId?: string;
	exhibitor?: Exhibitor;
	exhibitorId?: string;
	isAvailable?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface BoothStats {
	total: number;
	occupied: number;
	available: number;
}

// Contact
export interface Contact {
	id?: ID;
	firstName: string;
	lastName: string;
	role?: string;
	email?: string;
	phone?: string;
	exhibitorId?: ID;
}

// Exhibitor
export interface Exhibitor {
	id: ID;
	slug: string;
	name: string;
	logoUrl?: string;
	description?: string;
	websiteUrl?: string;
	linkedinUrl?: string;
	pdfUrl?: string;
	sectorId: ID;
	boothId?: ID;
	sector?: Sector;
	booth?: Booth;
	contacts: Contact[];
	themes?: Theme[];
	viewCount?: number;
	favoriteCount?: number;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

// Theme (Parcours)
export interface Theme {
	id: ID;
	name: string;
	description?: string;
	order: number;
	exhibitors?: Exhibitor[];
	exhibitorIds: ID[];
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

// Favorites
export interface FavoriteItem {
	exhibitorId: ID;
	exhibitor?: Exhibitor;
	sessionId: string;
	createdAt: ISODateTime;
}

// Analytics
export interface AnalyticsEvent {
	id: ID;
	type: AnalyticsEventType;
	sessionId: string;
	exhibitorId?: ID;
	searchQuery?: string;
	payload?: Record<string, any>;
	createdAt: ISODateTime;
}

export interface AnalyticsStats {
	totalViews: number;
	uniqueSessions: number;
	totalSearches: number;
	totalFavorites: number;
	topSearchTerms: Array<{
		term: string;
		count: number;
	}>;
	viewsByDay?: Array<{
		date: string;
		count: number;
	}>;
}

export interface TopExhibitor {
	id: ID;
	name: string;
	slug: string;
	views: number;
	favorites: number;
	sector?: Sector;
}

// User Stats
export interface UserStats {
	total: number;
	byStatus: {
		[K in UserStatus]: number;
	};
	byRole: {
		[K in UserRole]: number;
	};
}

// Pagination
export interface Paged<T> {
	items: T[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
}

// Filters
export interface ExhibitorFilters {
	q?: string;
	sectorId?: ID;
	themeId?: ID;
	hasBooth?: boolean;
}

export interface MapViewport {
	x: number;
	y: number;
	zoom: number;
}

export interface MapBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

// Forms
export interface ExhibitorFormData {
	name: string;
	logoUrl?: string;
	description?: string;
	websiteUrl?: string;
	linkedinUrl?: string;
	pdfUrl?: string;
	sectorId: ID;
	boothId?: ID;
	contacts?: Omit<Contact, 'id' | 'exhibitorId'>[];
}

export interface ThemeFormData {
	name: string;
	description?: string;
	order?: number;
	exhibitorIds?: ID[];
}

export interface SectorFormData {
	name: string;
	colorHex: HexColor;
}

export interface BoothFormData {
	number: string;
	polygonId: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation?: number;
}

// API Response
export interface ApiError {
	status: number;
	message: string;
	errors?: Record<string, string[]>;
}

// Map Zones
export interface MapZone {
	id: string;
	type: 'entrance' | 'exit' | 'restaurant' | 'toilets' | 'scene' | 'info' | 'partner';
	label: string;
	x: number;
	y: number;
	icon?: string;
}
