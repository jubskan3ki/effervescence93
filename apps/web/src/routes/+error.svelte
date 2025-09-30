<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	// Messages personnalisés selon le code d'erreur
	const errorMessages: Record<number, { title: string; description: string; icon: string }> = {
		404: {
			title: 'Page introuvable',
			description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
			icon: 'M9 17v1a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h4a1 1 0 011 1v1m0 10l5-5m0 0l-5-5m5 5H3'
		},
		403: {
			title: 'Accès refusé',
			description: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
			icon: 'M12 15v2m0 0v2m0-2h2m-2 0h-2m5.73-3.61A7.002 7.002 0 0112 5a7 7 0 00-5.73 11.61m11.46 0A9 9 0 1112 3a9 9 0 015.73 14.39'
		},
		500: {
			title: 'Erreur serveur',
			description: 'Une erreur inattendue s\'est produite. Nos équipes ont été notifiées.',
			icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		503: {
			title: 'Service indisponible',
			description: 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.',
			icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
		}
	};

	$: errorInfo = errorMessages[$page.status] || {
		title: `Erreur ${$page.status}`,
		description: $page.error?.message || 'Une erreur est survenue',
		icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
	};

	// Actions suggérées selon le contexte
	$: suggestedActions = getSuggestedActions($page.status, $page.route?.id);

	function getSuggestedActions(status: number, routeId?: string | null) {
		const actions = [
			{ href: '/', label: 'Accueil', primary: true },
			{ href: '/favoris', label: 'Mes favoris', primary: false }
		];

		if (status === 403 || status === 401) {
			actions.unshift({ href: '/auth/login', label: 'Se connecter', primary: true });
		}

		if (routeId?.includes('admin')) {
			actions.push({ href: '/admin', label: 'Tableau de bord', primary: false });
		}

		return actions;
	}
</script>

<svelte:head>
	<title>Erreur {$page.status} - Effervescence 93</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
	<div class="max-w-lg w-full">

		<!-- Card d'erreur -->
		<div class="bg-white rounded-lg shadow-sm p-8 text-center">
			<!-- Icon d'erreur -->
			<div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
				{#if $page.status === 404}
					<svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h-.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if $page.status === 403}
					<svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				{:else if $page.status >= 500}
					<svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else}
					<svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				{/if}
			</div>

			<!-- Code d'erreur -->
			<div class="text-6xl font-bold text-gray-200 mb-4">
				{$page.status}
			</div>

			<!-- Titre -->
			<h1 class="text-2xl font-semibold text-gray-900 mb-2">
				{errorInfo.title}
			</h1>

			<!-- Description -->
			<p class="text-gray-600 mb-8">
				{errorInfo.description}
			</p>

			<!-- Actions -->
			<div class="flex flex-col sm:flex-row gap-3 justify-center">
				{#each suggestedActions.slice(0, 2) as action}
					<a
						href={action.href}
						class="px-4 py-2 rounded-md font-medium transition-colors {action.primary ?
							'bg-primary text-white hover:bg-primary-600' :
							'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						{action.label}
					</a>
				{/each}
			</div>

			<!-- Liens supplémentaires -->
			{#if suggestedActions.length > 2}
				<div class="mt-6 pt-6 border-t border-gray-200">
					<div class="text-sm text-gray-500 mb-3">Autres pages :</div>
					<div class="flex flex-wrap gap-3 justify-center">
						{#each suggestedActions.slice(2) as action}
							<a href={action.href} class="text-sm text-primary hover:underline">
								{action.label}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Mode dev : détails de l'erreur -->
		{#if dev && $page.error}
			<details class="mt-8 bg-gray-900 text-gray-100 rounded-lg p-4">
				<summary class="cursor-pointer font-mono text-sm hover:text-white">
					[DEV] Détails techniques
				</summary>
				<div class="mt-4 space-y-4">
					{#if $page.error.message}
						<div>
							<div class="text-xs text-gray-400 mb-1">Message:</div>
							<pre class="text-xs bg-black rounded p-2 overflow-x-auto">{$page.error.message}</pre>
						</div>
					{/if}

					<div>
						<div class="text-xs text-gray-400 mb-1">Full error object:</div>
						<pre class="text-xs bg-black rounded p-2 overflow-x-auto">{JSON.stringify($page.error, null, 2)}</pre>
					</div>
				</div>
			</details>
		{/if}
	</div>
</div>
