// src/lib/constants/map.ts

/**
 * Map configuration and constants
 */

// Map configuration
export const MAP_CONFIG = {
	// SVG viewBox
	viewBox: {
		x: 0,
		y: 0,
		width: 1200,
		height: 800,
	},

	// Zoom settings
	zoom: {
		default: 1,
		min: 0.5,
		max: 3,
		step: 0.1,
		wheelSensitivity: 0.001,
	},

	// Animation
	animation: {
		duration: 300,
		easing: 'ease-in-out',
	},
} as const;

// Map colors
export const MAP_COLORS = {
	// Background
	background: '#F9FAFB',
	grid: '#E5E7EB',

	// Booth states
	booth: {
		default: {
			fill: '#FFFFFF',
			stroke: '#D1D5DB',
			strokeWidth: 1,
		},
		hover: {
			fill: '#EFF6FF',
			stroke: '#3B82F6',
			strokeWidth: 2,
		},
		selected: {
			fill: '#DBEAFE',
			stroke: '#2563EB',
			strokeWidth: 3,
		},
		occupied: {
			fill: '#F3F4F6',
			stroke: '#9CA3AF',
			strokeWidth: 1,
		},
	},

	// Zone colors
	zones: {
		entrance: '#10B981',
		exit: '#EF4444',
		restroom: '#3B82F6',
		restaurant: '#F59E0B',
		stage: '#8B5CF6',
		info: '#6B7280',
		emergency: '#DC2626',
	},
} as const;

// Map legend
export const MAP_LEGEND = [
	{
		type: 'entrance',
		label: 'Entrée',
		color: MAP_COLORS.zones.entrance,
		icon: 'door-open',
	},
	{
		type: 'exit',
		label: 'Sortie',
		color: MAP_COLORS.zones.exit,
		icon: 'door-closed',
	},
	{
		type: 'restroom',
		label: 'Sanitaires',
		color: MAP_COLORS.zones.restroom,
		icon: 'restroom',
	},
	{
		type: 'restaurant',
		label: 'Restauration',
		color: MAP_COLORS.zones.restaurant,
		icon: 'utensils',
	},
	{
		type: 'stage',
		label: 'Scène',
		color: MAP_COLORS.zones.stage,
		icon: 'microphone',
	},
	{
		type: 'info',
		label: 'Accueil',
		color: MAP_COLORS.zones.info,
		icon: 'info',
	},
] as const;

// Polygon types
export const POLYGON_TYPES = {
	BOOTH: 'booth',
	ZONE: 'zone',
	PATH: 'path',
	WALL: 'wall',
} as const;

// Touch gestures configuration
export const TOUCH_CONFIG = {
	tapTolerance: 10,
	doubleTapDelay: 300,
	longPressDelay: 500,
	pinchThreshold: 10,
} as const;

// Control positions
export const CONTROL_POSITIONS = {
	TOP_LEFT: 'top-left',
	TOP_RIGHT: 'top-right',
	BOTTOM_LEFT: 'bottom-left',
	BOTTOM_RIGHT: 'bottom-right',
} as const;
