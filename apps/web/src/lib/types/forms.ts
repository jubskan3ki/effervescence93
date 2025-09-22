// Exhibitor forms
export interface ExhibitorFormData {
	name: string;
	logoUrl?: string;
	description?: string;
	websiteUrl?: string;
	linkedinUrl?: string;
	pdfUrl?: string;
	sectorId: string;
	boothId?: string;
	contacts: ContactFormData[];
}

export interface ContactFormData {
	firstName: string;
	lastName: string;
	role: string;
	email?: string;
	phone?: string;
}

// Sector forms
export interface SectorFormData {
	name: string;
	colorHex: string;
}

// Booth forms
export interface BoothFormData {
	number: string;
	polygonId: string;
	exhibitorId?: string;
}

// Theme forms
export interface ThemeFormData {
	name: string;
	description?: string;
	order: number;
	exhibitorIds?: string[];
}

// User forms
export interface LoginFormData {
	email: string;
	password: string;
	remember?: boolean;
}

export interface SignupFormData {
	email: string;
	password: string;
	confirmPassword: string;
	acceptTerms: boolean;
}

export interface RegisterFormData {
	email: string;
	password: string;
	role: 'EDITOR' | 'USER';
}

export interface UserUpdateFormData {
	email?: string;
	role?: 'ADMIN' | 'EDITOR' | 'USER';
	status?: 'APPROVED' | 'REJECTED';
}

// Analytics forms
export interface TrackEventFormData {
	type: 'view' | 'search' | 'filter' | 'share' | 'qr_scan';
	sessionId?: string;
	exhibitorId?: string;
	searchQuery?: string;
	userAgent?: string;
	payload?: Record<string, any>;
}

// Settings forms
export interface MapSettingsFormData {
	defaultZoom: number;
	minZoom: number;
	maxZoom: number;
	enableClustering: boolean;
	showLegend: boolean;
	showMinimap: boolean;
}

export interface NotificationSettingsFormData {
	emailNotifications: boolean;
	smsNotifications: boolean;
	pushNotifications: boolean;
	notifyOnNewExhibitor: boolean;
	notifyOnAnalytics: boolean;
}

// Import/Export forms
export interface ImportFormData {
	file: File;
	format: 'csv' | 'xlsx' | 'json';
	mapping?: Record<string, string>;
	skipDuplicates: boolean;
	updateExisting: boolean;
}

export interface ExportFormData {
	format: 'csv' | 'xlsx' | 'json' | 'pdf';
	includeContacts: boolean;
	includeAnalytics: boolean;
	dateRange?: {
		start: string;
		end: string;
	};
}
