// Re-export all model types
export * from './models';

// Re-export all API types
export * from './api';

// Re-export all form types
export * from './forms';

// Additional utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Generic CRUD operations
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStatus<T = any> {
	state: LoadingState;
	data?: T;
	error?: Error | string;
}

// Sort and filter
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
	field: string;
	direction: SortDirection;
}

export interface FilterConfig {
	field: string;
	operator: FilterOperator;
	value: any;
}

export type FilterOperator =
	| 'equals'
	| 'not_equals'
	| 'contains'
	| 'not_contains'
	| 'starts_with'
	| 'ends_with'
	| 'greater_than'
	| 'greater_than_or_equal'
	| 'less_than'
	| 'less_than_or_equal'
	| 'in'
	| 'not_in'
	| 'is_null'
	| 'is_not_null';

// Map types
export interface MapViewport {
	x: number;
	y: number;
	width: number;
	height: number;
	zoom: number;
}

export interface MapPolygon {
	id: string;
	points: string;
	type: 'booth' | 'zone' | 'path';
	data?: Record<string, any>;
}

export interface MapMarker {
	id: string;
	x: number;
	y: number;
	type: string;
	label?: string;
	icon?: string;
}

// Theme types (for UI theming)
export interface ThemeColors {
	primary: string;
	secondary: string;
	success: string;
	warning: string;
	error: string;
	info: string;
	gray: string;
}

// Permission types
export type Permission =
	| 'exhibitors.view'
	| 'exhibitors.create'
	| 'exhibitors.update'
	| 'exhibitors.delete'
	| 'booths.view'
	| 'booths.create'
	| 'booths.update'
	| 'booths.delete'
	| 'sectors.view'
	| 'sectors.create'
	| 'sectors.update'
	| 'sectors.delete'
	| 'themes.view'
	| 'themes.create'
	| 'themes.update'
	| 'themes.delete'
	| 'users.view'
	| 'users.create'
	| 'users.update'
	| 'users.delete'
	| 'analytics.view'
	| 'settings.view'
	| 'settings.update';

// Response helpers
export type AsyncData<T> =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; data: T }
	| { status: 'error'; error: Error };

// Event handler types
export type ClickHandler = (event: MouseEvent) => void;
export type SubmitHandler = (event: SubmitEvent) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: Event & { currentTarget: T }) => void;
