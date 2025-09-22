// src/lib/utils/validators.ts

/**
 * Form validation utilities
 */

// Individual validators
export const validators = {
	required(value: any): boolean {
		if (value === null || value === undefined) return false;
		if (typeof value === 'string') return value.trim().length > 0;
		if (Array.isArray(value)) return value.length > 0;
		return true;
	},

	email(value: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value);
	},

	phone(value: string): boolean {
		// French phone numbers
		const cleaned = value.replace(/[\s.-]/g, '');
		const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
		return phoneRegex.test(cleaned);
	},

	url(value: string): boolean {
		if (!value) return true; // URLs are often optional
		try {
			const url = new URL(value);
			return url.protocol === 'http:' || url.protocol === 'https:';
		} catch {
			return false;
		}
	},

	minLength(value: string, min: number): boolean {
		return value.length >= min;
	},

	maxLength(value: string, max: number): boolean {
		return value.length <= max;
	},

	min(value: number, min: number): boolean {
		return value >= min;
	},

	max(value: number, max: number): boolean {
		return value <= max;
	},

	pattern(value: string, pattern: RegExp): boolean {
		return pattern.test(value);
	},

	hexColor(value: string): boolean {
		return /^#[0-9A-F]{6}$/i.test(value);
	},

	password(value: string): boolean {
		// At least 8 characters, 1 uppercase, 1 lowercase, 1 number
		return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
	},

	confirmPassword(value: string, password: string): boolean {
		return value === password;
	},
};

// Validation rule interface
interface ValidationRule {
	required?: boolean;
	email?: boolean;
	phone?: boolean;
	url?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: RegExp;
	custom?: (value: any) => boolean | string;
	message?: string;
}

interface ValidationRules {
	[field: string]: ValidationRule;
}

interface ValidationResult {
	valid: boolean;
	errors: Record<string, string>;
}

// Main validation function
export function validateForm(data: Record<string, any>, rules: ValidationRules): ValidationResult {
	const errors: Record<string, string> = {};

	for (const [field, rule] of Object.entries(rules)) {
		const value = data[field];

		// Required check
		if (rule.required && !validators.required(value)) {
			errors[field] = rule.message || 'Ce champ est requis';
			continue; // Skip other validations if required fails
		}

		// Skip validation if field is empty and not required
		if (!rule.required && !value) {
			continue;
		}

		// Email validation
		if (rule.email && !validators.email(value)) {
			errors[field] = rule.message || 'Email invalide';
		}

		// Phone validation
		if (rule.phone && !validators.phone(value)) {
			errors[field] = rule.message || 'Numéro de téléphone invalide';
		}

		// URL validation
		if (rule.url && value && !validators.url(value)) {
			errors[field] = rule.message || 'URL invalide';
		}

		// Length validations
		if (rule.minLength && !validators.minLength(value, rule.minLength)) {
			errors[field] = rule.message || `Minimum ${rule.minLength} caractères`;
		}

		if (rule.maxLength && !validators.maxLength(value, rule.maxLength)) {
			errors[field] = rule.message || `Maximum ${rule.maxLength} caractères`;
		}

		// Number validations
		if (rule.min !== undefined && !validators.min(value, rule.min)) {
			errors[field] = rule.message || `Minimum ${rule.min}`;
		}

		if (rule.max !== undefined && !validators.max(value, rule.max)) {
			errors[field] = rule.message || `Maximum ${rule.max}`;
		}

		// Pattern validation
		if (rule.pattern && !validators.pattern(value, rule.pattern)) {
			errors[field] = rule.message || 'Format invalide';
		}

		// Custom validation
		if (rule.custom) {
			const result = rule.custom(value);
			if (result !== true) {
				errors[field] = typeof result === 'string' ? result : 'Validation échouée';
			}
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
	};
}

// Preset validation schemas
export const validationSchemas = {
	login: {
		email: { required: true, email: true },
		password: { required: true, minLength: 8 },
	},

	signup: {
		email: { required: true, email: true },
		password: {
			required: true,
			custom: validators.password,
			message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
		},
		confirmPassword: {
			required: true,
			custom: (value: string) => value === (document.querySelector('#password') as HTMLInputElement)?.value,
			message: 'Les mots de passe ne correspondent pas',
		},
	},

	exhibitor: {
		name: { required: true, minLength: 2, maxLength: 100 },
		description: { maxLength: 800 },
		websiteUrl: { url: true },
		linkedinUrl: { url: true },
		pdfUrl: { url: true },
		sectorId: { required: true },
	},

	contact: {
		firstName: { required: true, minLength: 2, maxLength: 50 },
		lastName: { required: true, minLength: 2, maxLength: 50 },
		role: { required: true, maxLength: 100 },
		email: { email: true },
		phone: { phone: true },
	},

	sector: {
		name: { required: true, minLength: 2, maxLength: 50 },
		colorHex: {
			required: true,
			custom: validators.hexColor,
			message: 'Code couleur hexadécimal invalide (#RRGGBB)',
		},
	},

	booth: {
		number: { required: true, minLength: 1, maxLength: 10 },
		polygonId: { required: true },
	},
};

// Helper to get error message for a field
export function getFieldError(field: string, errors: Record<string, string>): string | undefined {
	return errors[field];
}

// Helper to check if a field has error
export function hasFieldError(field: string, errors: Record<string, string>): boolean {
	return !!errors[field];
}
