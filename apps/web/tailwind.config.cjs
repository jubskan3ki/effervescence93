/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Couleurs principales - Identité Effervescence 93
				primary: {
					DEFAULT: '#E20A16',
					50: '#FEF2F2',
					100: '#FEE2E2',
					200: '#FECACA',
					300: '#FCA5A5',
					400: '#F87171',
					500: '#E20A16',
					600: '#C80913',
					700: '#A00810',
					800: '#7F0A0E',
					900: '#5C0A0B',
					950: '#3A0605',
				},
				secondary: {
					DEFAULT: '#004B87',
					50: '#EFF6FF',
					100: '#DBEAFE',
					200: '#BFDBFE',
					300: '#93C5FD',
					400: '#60A5FA',
					500: '#004B87',
					600: '#003D6F',
					700: '#002F57',
					800: '#002143',
					900: '#001835',
					950: '#001020',
				},
				// Couleurs d'accent
				accent: {
					purple: '#8B5CF6',
					emerald: '#10B981',
					amber: '#F59E0B',
					blue: '#3B82F6',
					rose: '#EC4899',
					coral: '#FF6B6B',
					teal: '#14B8A6',
				},
				// Secteurs d'activité
				sector: {
					innovation: '#8B5CF6',
					finance: '#10B981',
					commerce: '#F59E0B',
					service: '#3B82F6',
					industrie: '#EF4444',
					artisanat: '#EC4899',
					numerique: '#06B6D4',
					sante: '#84CC16',
					immobilier: '#A855F7',
					transport: '#0EA5E9',
					energie: '#22C55E',
					education: '#6366F1',
					default: '#6B7280',
				},
				// Statuts système
				status: {
					pending: '#F59E0B',
					approved: '#10B981',
					rejected: '#EF4444',
					draft: '#6B7280',
					active: '#3B82F6',
				},
				// Surface et background
				surface: {
					DEFAULT: '#FFFFFF',
					50: '#FAFAFA',
					100: '#F4F4F5',
					200: '#E4E4E7',
					300: '#D4D4D8',
					dark: '#18181B',
					'dark-50': '#27272A',
					'dark-100': '#3F3F46',
					'dark-200': '#52525B',
				},
				// Couleurs sémantiques
				success: {
					50: '#F0FDF4',
					100: '#DCFCE7',
					500: '#22C55E',
					600: '#16A34A',
					700: '#15803D',
				},
				warning: {
					50: '#FFFBEB',
					100: '#FEF3C7',
					500: '#F59E0B',
					600: '#D97706',
					700: '#B45309',
				},
				error: {
					50: '#FEF2F2',
					100: '#FEE2E2',
					500: '#EF4444',
					600: '#DC2626',
					700: '#B91C1C',
				},
				info: {
					50: '#EFF6FF',
					100: '#DBEAFE',
					500: '#3B82F6',
					600: '#2563EB',
					700: '#1D4ED8',
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				display: ['Cabinet Grotesk', 'Inter', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				xs: ['0.75rem', { lineHeight: '1rem' }],
				sm: ['0.875rem', { lineHeight: '1.25rem' }],
				base: ['1rem', { lineHeight: '1.5rem' }],
				lg: ['1.125rem', { lineHeight: '1.75rem' }],
				xl: ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1.15' }],
				'6xl': ['3.75rem', { lineHeight: '1.1' }],
				'7xl': ['4.5rem', { lineHeight: '1.1' }],
			},
			spacing: {
				18: '4.5rem',
				88: '22rem',
				120: '30rem',
				128: '32rem',
				144: '36rem',
			},
			borderRadius: {
				xs: '0.125rem',
				sm: '0.25rem',
				md: '0.375rem',
				lg: '0.5rem',
				xl: '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			boxShadow: {
				xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
				'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
				inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
				glow: '0 0 20px rgba(226, 10, 22, 0.15)',
				'glow-lg': '0 0 40px rgba(226, 10, 22, 0.2)',
				'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.1)',
				'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.12)',
				'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.15)',
				'elevation-4': '0 12px 24px rgba(0, 0, 0, 0.18)',
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'fade-out': 'fadeOut 0.3s ease-in-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
				'slide-in-right': 'slideInRight 0.3s ease-out',
				'slide-in-left': 'slideInLeft 0.3s ease-out',
				'scale-in': 'scaleIn 0.2s ease-out',
				'scale-out': 'scaleOut 0.2s ease-in',
				'spin-slow': 'spin 3s linear infinite',
				'bounce-slow': 'bounce 2s infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				shimmer: 'shimmer 2s linear infinite',
				glow: 'glow 2s ease-in-out infinite alternate',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideInRight: {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				slideInLeft: {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				scaleOut: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.9)', opacity: '0' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' },
				},
				glow: {
					'0%': { boxShadow: '0 0 5px rgba(226, 10, 22, 0.2)' },
					'100%': { boxShadow: '0 0 20px rgba(226, 10, 22, 0.4), 0 0 40px rgba(226, 10, 22, 0.2)' },
				},
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-brand': 'linear-gradient(135deg, #E20A16 0%, #004B87 100%)',
				'gradient-warm': 'linear-gradient(135deg, #E20A16 0%, #F59E0B 100%)',
				'gradient-cool': 'linear-gradient(135deg, #004B87 0%, #3B82F6 100%)',
				'mesh-gradient': `radial-gradient(at 40% 20%, hsla(354, 92%, 46%, 0.3) 0px, transparent 50%),
                          radial-gradient(at 80% 0%, hsla(206, 100%, 27%, 0.2) 0px, transparent 50%),
                          radial-gradient(at 0% 50%, hsla(354, 92%, 46%, 0.2) 0px, transparent 50%),
                          radial-gradient(at 80% 100%, hsla(206, 100%, 27%, 0.15) 0px, transparent 50%),
                          radial-gradient(at 0% 100%, hsla(354, 92%, 46%, 0.1) 0px, transparent 50%)`,
				shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
			},
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				md: '8px',
				lg: '12px',
				xl: '16px',
				'2xl': '24px',
			},
			transitionDuration: {
				400: '400ms',
				600: '600ms',
				800: '800ms',
				900: '900ms',
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
			},
			zIndex: {
				1: '1',
				2: '2',
				60: '60',
				70: '70',
				80: '80',
				90: '90',
				100: '100',
			},
			screens: {
				xs: '475px',
				'3xl': '1920px',
			},
			gridTemplateColumns: {
				'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
				'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
		// Plugin personnalisé pour les utilities spécifiques
		function ({ addUtilities, theme }) {
			const newUtilities = {
				// Glass morphism
				'.glass': {
					background: 'rgba(255, 255, 255, 0.7)',
					backdropFilter: 'blur(10px)',
					borderRadius: theme('borderRadius.xl'),
					border: '1px solid rgba(255, 255, 255, 0.2)',
				},
				'.glass-dark': {
					background: 'rgba(0, 0, 0, 0.5)',
					backdropFilter: 'blur(10px)',
					borderRadius: theme('borderRadius.xl'),
					border: '1px solid rgba(255, 255, 255, 0.1)',
				},
				// Neon effect
				'.neon-primary': {
					color: theme('colors.primary.500'),
					textShadow: `0 0 10px ${theme('colors.primary.500')}, 0 0 20px ${theme('colors.primary.500')}, 0 0 30px ${theme('colors.primary.500')}`,
				},
				// Gradient text
				'.gradient-text': {
					background: 'linear-gradient(135deg, #E20A16 0%, #004B87 100%)',
					'-webkit-background-clip': 'text',
					'-webkit-text-fill-color': 'transparent',
					backgroundClip: 'text',
				},
				// Smooth scroll
				'.smooth-scroll': {
					scrollBehavior: 'smooth',
				},
				// Hide scrollbar
				'.no-scrollbar': {
					'-ms-overflow-style': 'none',
					scrollbarWidth: 'none',
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
				// Custom scrollbar
				'.custom-scrollbar': {
					'&::-webkit-scrollbar': {
						width: '8px',
						height: '8px',
					},
					'&::-webkit-scrollbar-track': {
						background: theme('colors.gray.100'),
						borderRadius: theme('borderRadius.full'),
					},
					'&::-webkit-scrollbar-thumb': {
						background: theme('colors.gray.400'),
						borderRadius: theme('borderRadius.full'),
						'&:hover': {
							background: theme('colors.gray.500'),
						},
					},
				},
			};
			addUtilities(newUtilities);
		},
	],
	future: {
		hoverOnlyWhenSupported: true,
	},
};
