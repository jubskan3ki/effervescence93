<!-- src/lib/components/shared/Analytics.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	interface AnalyticsEvent {
		event: string;
		category?: string;
		action?: string;
		label?: string;
		value?: number;
		properties?: Record<string, any>;
	}

	interface Props {
		gaId?: string; // Google Analytics ID
		debug?: boolean;
	}

	let { gaId = '', debug = false }: Props = $props();

	// Track page views
	function trackPageView(url: string) {
		if (!browser) return;

		const data = {
			page_path: url,
			page_title: document.title,
			page_location: window.location.href,
		};

		if (debug) {
			console.log('📊 Analytics: Page View', data);
		}

		// Send to Google Analytics if available
		if ((window as any).gtag && gaId) {
			(window as any).gtag('config', gaId, {
				page_path: url,
			});
		}

		// Send to custom analytics endpoint
		sendToAnalytics('page_view', data);
	}

	// Track custom events
	export function trackEvent(event: AnalyticsEvent) {
		if (!browser) return;

		const data = {
			event_name: event.event,
			event_category: event.category,
			event_action: event.action,
			event_label: event.label,
			event_value: event.value,
			...event.properties,
			timestamp: new Date().toISOString(),
			url: window.location.href,
			user_agent: navigator.userAgent,
			screen_resolution: `${window.screen.width}x${window.screen.height}`,
			viewport_size: `${window.innerWidth}x${window.innerHeight}`,
			referrer: document.referrer,
		};

		if (debug) {
			console.log('📊 Analytics: Event', data);
		}

		// Send to Google Analytics if available
		if ((window as any).gtag && gaId) {
			(window as any).gtag('event', event.event, {
				event_category: event.category,
				event_label: event.label,
				value: event.value,
				...event.properties,
			});
		}

		// Send to custom analytics endpoint
		sendToAnalytics('event', data);
	}

	// Track exhibitor views
	export function trackExhibitorView(exhibitorId: string, exhibitorName: string) {
		trackEvent({
			event: 'exhibitor_view',
			category: 'Exhibitor',
			action: 'View',
			label: exhibitorName,
			properties: {
				exhibitor_id: exhibitorId,
				exhibitor_name: exhibitorName,
			},
		});
	}

	// Track search
	export function trackSearch(query: string, resultsCount: number) {
		trackEvent({
			event: 'search',
			category: 'Search',
			action: 'Search',
			label: query,
			value: resultsCount,
			properties: {
				search_query: query,
				results_count: resultsCount,
			},
		});
	}

	// Track favorite actions
	export function trackFavorite(exhibitorId: string, action: 'add' | 'remove') {
		trackEvent({
			event: action === 'add' ? 'add_to_favorites' : 'remove_from_favorites',
			category: 'Favorites',
			action: action === 'add' ? 'Add' : 'Remove',
			label: exhibitorId,
			properties: {
				exhibitor_id: exhibitorId,
			},
		});
	}

	// Track share actions
	export function trackShare(content: string, method: string) {
		trackEvent({
			event: 'share',
			category: 'Share',
			action: method,
			label: content,
			properties: {
				share_content: content,
				share_method: method,
			},
		});
	}

	// Track QR code scans
	export function trackQRScan(standId: string) {
		trackEvent({
			event: 'qr_scan',
			category: 'QR',
			action: 'Scan',
			label: standId,
			properties: {
				stand_id: standId,
				source: 'qr_code',
			},
		});
	}

	// Track map interactions
	export function trackMapInteraction(action: string, details?: any) {
		trackEvent({
			event: 'map_interaction',
			category: 'Map',
			action: action,
			properties: {
				interaction_type: action,
				...details,
			},
		});
	}

	// Send data to analytics endpoint
	async function sendToAnalytics(type: string, data: any) {
		if (!browser) return;

		try {
			// Store in session storage for batch sending
			const analyticsQueue = JSON.parse(sessionStorage.getItem('analytics_queue') || '[]');

			analyticsQueue.push({
				type,
				data,
				session_id: getSessionId(),
			});

			sessionStorage.setItem('analytics_queue', JSON.stringify(analyticsQueue));

			// Send batch if queue is large enough
			if (analyticsQueue.length >= 10) {
				await flushAnalytics();
			}
		} catch (error) {
			if (debug) {
				console.error('Analytics error:', error);
			}
		}
	}

	// Flush analytics queue
	async function flushAnalytics() {
		if (!browser) return;

		try {
			const analyticsQueue = JSON.parse(sessionStorage.getItem('analytics_queue') || '[]');

			if (analyticsQueue.length === 0) return;

			// Send to API endpoint
			const response = await fetch('/api/analytics', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					events: analyticsQueue,
				}),
			});

			if (response.ok) {
				// Clear queue on success
				sessionStorage.setItem('analytics_queue', '[]');
			}
		} catch (error) {
			if (debug) {
				console.error('Analytics flush error:', error);
			}
		}
	}

	// Get or create session ID
	function getSessionId(): string {
		if (!browser) return '';

		let sessionId = sessionStorage.getItem('session_id');
		if (!sessionId) {
			sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			sessionStorage.setItem('session_id', sessionId);
		}
		return sessionId;
	}

	// Track time on page
	let startTime: number;
	let isVisible = true;

	function trackTimeOnPage() {
		if (!browser || !startTime) return;

		const timeOnPage = Math.round((Date.now() - startTime) / 1000);

		trackEvent({
			event: 'time_on_page',
			category: 'Engagement',
			action: 'Time',
			value: timeOnPage,
			properties: {
				page_url: window.location.href,
				time_seconds: timeOnPage,
			},
		});
	}

	// Initialize
	onMount(() => {
		if (!browser) return;

		startTime = Date.now();

		// Track initial page view
		trackPageView($page.url.pathname);

		// Track visibility changes
		document.addEventListener('visibilitychange', () => {
			isVisible = !document.hidden;
			if (!isVisible) {
				trackTimeOnPage();
				flushAnalytics();
			} else {
				startTime = Date.now();
			}
		});

		// Flush analytics on page unload
		window.addEventListener('beforeunload', () => {
			trackTimeOnPage();
			flushAnalytics();
		});

		// Flush analytics periodically
		const flushInterval = setInterval(flushAnalytics, 30000); // Every 30 seconds

		// Check for QR code scan parameter
		const urlParams = new URLSearchParams(window.location.search);
		const standId = urlParams.get('stand');
		if (standId) {
			trackQRScan(standId);
		}

		// Subscribe to page changes
		const unsubscribe = page.subscribe(($page) => {
			trackPageView($page.url.pathname);
		});

		// Add Google Analytics script if gaId provided
		if (gaId && !document.querySelector(`script[src*="${gaId}"]`)) {
			// Create GA script
			const script = document.createElement('script');
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
			document.head.appendChild(script);

			// Initialize gtag
			(window as any).dataLayer = (window as any).dataLayer || [];
			function gtag(..._args: any[]) {
				(window as any).dataLayer.push(arguments);
			}
			(window as any).gtag = gtag;
			gtag('js', new Date());
			gtag('config', gaId);
		}

		return () => {
			unsubscribe();
			clearInterval(flushInterval);
			trackTimeOnPage();
			flushAnalytics();
		};
	});
</script>
