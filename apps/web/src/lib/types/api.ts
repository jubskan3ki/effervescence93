// Generic API Response wrapper
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: ApiError;
}

// API Error
export interface ApiError {
	code: string;
	message: string;
	statusCode: number;
	details?: Record<string, any>;
}

// Pagination
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasMore: boolean;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	sort?: string;
	order?: 'asc' | 'desc';
}

// Auth responses
export interface LoginResponse {
	access_token: string;
	token_type: 'Bearer';
	user: {
		id: string;
		email: string;
		role: string;
		status: string;
	};
}

export interface SignupResponse {
	message: string;
	user: {
		id: string;
		email: string;
		status: string;
	};
}

// Search and filter params
export interface SearchParams extends PaginationParams {
	q?: string;
	sectorId?: string;
	themeId?: string;
	boothNumber?: string;
	hasLogo?: boolean;
}

export interface FilterOptions {
	sectors?: string[];
	themes?: string[];
	hasContacts?: boolean;
	hasWebsite?: boolean;
}

// Analytics
export interface AnalyticsStats {
	totalViews: number;
	uniqueSessions: number;
	totalSearches: number;
	averageSessionDuration: number;
	topExhibitors: TopExhibitor[];
	searchQueries: SearchQuery[];
	deviceBreakdown: DeviceBreakdown;
	dailyStats?: DailyStat[];
}

export interface TopExhibitor {
	exhibitorId: string;
	exhibitor?: any; // Can be populated with full exhibitor data
	viewCount: number;
	favoriteCount: number;
	shareCount: number;
}

export interface SearchQuery {
	query: string;
	count: number;
	lastSearched: string;
}

export interface DeviceBreakdown {
	mobile: number;
	desktop: number;
	tablet: number;
	unknown: number;
}

export interface DailyStat {
	date: string;
	views: number;
	sessions: number;
	searches: number;
	favorites: number;
}

// Bulk operations
export interface BulkOperation<T> {
	ids: string[];
	operation: 'delete' | 'update' | 'archive';
	data?: Partial<T>;
}

export interface BulkOperationResult {
	success: string[];
	failed: Array<{
		id: string;
		error: string;
	}>;
	total: number;
}

// File upload
export interface FileUploadResponse {
	url: string;
	filename: string;
	size: number;
	mimeType: string;
}

// Export
export interface ExportParams {
	format: 'csv' | 'xlsx' | 'json' | 'pdf';
	fields?: string[];
	filters?: Record<string, any>;
}
