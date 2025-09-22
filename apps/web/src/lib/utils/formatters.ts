// src/lib/utils/formatters.ts

/**
 * String and data formatting utilities
 */

export const formatters = {
	// Date formatting
	date(value: string | Date | null, format = 'short'): string {
		if (!value) return '';

		const date = new Date(value);

		switch (format) {
			case 'short':
				return date.toLocaleDateString('fr-FR');
			case 'long':
				return date.toLocaleDateString('fr-FR', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				});
			case 'time':
				return date.toLocaleTimeString('fr-FR', {
					hour: '2-digit',
					minute: '2-digit',
				});
			case 'datetime':
				return date.toLocaleString('fr-FR');
			case 'relative':
				return this.relativeDate(date);
			default:
				return date.toLocaleDateString('fr-FR');
		}
	},

	relativeDate(date: Date | string): string {
		const now = new Date();
		const target = new Date(date);
		const diffMs = now.getTime() - target.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);

		if (diffSec < 60) return "À l'instant";
		if (diffMin < 60) return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
		if (diffHour < 24) return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
		if (diffDay < 30) return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;

		return target.toLocaleDateString('fr-FR');
	},

	// Phone formatting
	phone(value: string): string {
		if (!value) return '';

		// Remove all non-digit characters
		const cleaned = value.replace(/\D/g, '');

		// French phone number formatting
		if (cleaned.startsWith('33')) {
			// International format: +33 1 23 45 67 89
			const parts = cleaned.match(/^(33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
			if (parts) {
				return `+${parts[1]} ${parts[2]} ${parts[3]} ${parts[4]} ${parts[5]} ${parts[6]}`;
			}
		} else if (cleaned.length === 10) {
			// National format: 01 23 45 67 89
			const parts = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
			if (parts) {
				return `${parts[1]} ${parts[2]} ${parts[3]} ${parts[4]} ${parts[5]}`;
			}
		}

		return value;
	},

	// Number formatting
	number(value: number, decimals = 0): string {
		return new Intl.NumberFormat('fr-FR', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(value);
	},

	// Currency formatting
	currency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
		}).format(value);
	},

	// Percentage formatting
	percent(value: number, decimals = 0): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'percent',
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(value / 100);
	},

	// File size formatting
	fileSize(bytes: number): string {
		if (bytes === 0) return '0 B';

		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		const k = 1024;
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
	},

	// Text formatting
	truncate(text: string, maxLength: number, suffix = '...'): string {
		if (!text || text.length <= maxLength) return text;
		return text.slice(0, maxLength - suffix.length).trim() + suffix;
	},

	// Slug generation
	slug(text: string): string {
		if (!text) return '';

		return text
			.toLowerCase()
			.normalize('NFD') // Decompose accented characters
			.replace(/[\u0300-\u036f]/g, '') // Remove accents
			.replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
			.replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
			.replace(/-+/g, '-'); // Replace multiple dashes with single
	},

	// Initials from names
	initials(firstName?: string, lastName?: string): string {
		const f = firstName?.charAt(0).toUpperCase() || '';
		const l = lastName?.charAt(0).toUpperCase() || '';
		return f + l;
	},

	// Capitalize first letter
	capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	},

	// Title case
	titleCase(text: string): string {
		if (!text) return '';
		return text
			.toLowerCase()
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	},

	// Remove HTML tags
	stripHtml(html: string): string {
		if (!html) return '';
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent || div.innerText || '';
	},

	// Pluralize
	pluralize(count: number, singular: string, plural?: string): string {
		if (count === 1) return `${count} ${singular}`;
		return `${count} ${plural || singular + 's'}`;
	},

	// Format list as text
	list(items: string[], conjunction = 'et'): string {
		if (items.length === 0) return '';
		if (items.length === 1) return items[0];
		if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

		const last = items.pop();
		return `${items.join(', ')} ${conjunction} ${last}`;
	},

	// Format booth number
	booth(number: string): string {
		if (!number) return '';
		return `Stand ${number.toUpperCase()}`;
	},

	// Format duration in milliseconds to human readable
	duration(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return this.pluralize(days, 'jour');
		if (hours > 0) return this.pluralize(hours, 'heure');
		if (minutes > 0) return this.pluralize(minutes, 'minute');
		return this.pluralize(seconds, 'seconde');
	},
};
