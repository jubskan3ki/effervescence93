<!-- src/lib/components/exhibitor/ExhibitorCard.svelte -->
<script lang="ts">
	import Card from '../ui/Card.svelte';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import FavoriteButton from '../shared/FavoriteButton.svelte';
	import ShareButton from '../shared/ShareButton.svelte';

	interface Exhibitor {
		id: string;
		name: string;
		slug?: string;
		description?: string;
		logo?: string;
		standNumber?: string;
		sector?: { id: string; name: string; color?: string };
		themes?: Array<{ id: string; name: string }>;
		contacts?: Array<{ name: string; role?: string }>;
		website?: string;
		featured?: boolean;
	}

	interface Props {
		exhibitor: Exhibitor;
		variant?: 'default' | 'compact' | 'featured';
		showActions?: boolean;
		onClick?: (exhibitor: Exhibitor) => void;
		onContactClick?: (exhibitor: Exhibitor) => void;
	}

	let { exhibitor, variant = 'default', showActions = true, onClick, onContactClick }: Props = $props();

	const exhibitorUrl = $derived(`/exposant/${exhibitor.slug || exhibitor.id}`);
	const shareUrl = $derived(typeof window !== 'undefined' ? `${window.location.origin}${exhibitorUrl}` : '');

	function handleClick() {
		if (onClick) {
			onClick(exhibitor);
		}
	}

	function handleContactClick(e: Event) {
		e.stopPropagation();
		onContactClick?.(exhibitor);
	}
</script>

{#if variant === 'compact'}
	<!-- Compact variant -->
	<button
		type="button"
		class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer w-full text-left"
		onclick={handleClick}
	>
		<div class="flex items-center gap-3">
			{#if exhibitor.logo}
				<img src={exhibitor.logo} alt={exhibitor.name} class="h-10 w-10 object-contain" />
			{:else}
				<div class="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
					<span class="text-xs font-medium text-gray-500">
						{exhibitor.name.substring(0, 2).toUpperCase()}
					</span>
				</div>
			{/if}

			<div>
				<h4 class="font-medium text-gray-900">{exhibitor.name}</h4>
				<div class="flex items-center gap-2 text-sm text-gray-500">
					{#if exhibitor.standNumber}
						<span>Stand {exhibitor.standNumber}</span>
					{/if}
					{#if exhibitor.sector}
						<span>• {exhibitor.sector.name}</span>
					{/if}
				</div>
			</div>
		</div>

		{#if showActions}
			<FavoriteButton exhibitorId={exhibitor.id} size="sm" variant="icon" />
		{/if}
	</button>
{:else if variant === 'featured'}
	<!-- Featured variant -->
	<Card hoverable clickable onclick={handleClick}>
		<div class="relative">
			{#if exhibitor.featured}
				<div class="absolute top-2 right-2 z-10">
					<Badge variant="warning" size="sm">⭐ En vedette</Badge>
				</div>
			{/if}

			{#if exhibitor.logo}
				<div
					class="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center"
				>
					<img src={exhibitor.logo} alt={exhibitor.name} class="max-h-32 max-w-full object-contain" />
				</div>
			{:else}
				<div
					class="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center"
				>
					<span class="text-4xl font-bold text-primary-600">
						{exhibitor.name.substring(0, 2).toUpperCase()}
					</span>
				</div>
			{/if}
		</div>

		<div class="p-4">
			<div class="flex items-start justify-between mb-2">
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-gray-900 mb-1">
						{exhibitor.name}
					</h3>
					<div class="flex items-center gap-2 text-sm">
						{#if exhibitor.standNumber}
							<Badge variant="secondary" size="sm">
								📍 Stand {exhibitor.standNumber}
							</Badge>
						{/if}
						{#if exhibitor.sector}
							<Badge variant="primary" size="sm">
								{exhibitor.sector.name}
							</Badge>
						{/if}
					</div>
				</div>
			</div>

			{#if exhibitor.description}
				<p class="text-sm text-gray-600 mb-3 line-clamp-2">
					{exhibitor.description}
				</p>
			{/if}

			{#if exhibitor.themes && exhibitor.themes.length > 0}
				<div class="flex flex-wrap gap-1 mb-3">
					{#each exhibitor.themes.slice(0, 3) as theme}
						<span class="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
							{theme.name}
						</span>
					{/each}
					{#if exhibitor.themes.length > 3}
						<span class="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
							+{exhibitor.themes.length - 3}
						</span>
					{/if}
				</div>
			{/if}

			<div class="flex items-center justify-between pt-3 border-t border-gray-100">
				<div class="flex gap-2">
					<Button variant="primary" size="sm" href={exhibitorUrl}>Voir détails</Button>
					{#if exhibitor.contacts && exhibitor.contacts.length > 0}
						<Button variant="outline" size="sm" onclick={handleContactClick}>
							<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							Contact
						</Button>
					{/if}
				</div>

				{#if showActions}
					<div class="flex gap-1">
						<FavoriteButton exhibitorId={exhibitor.id} size="sm" variant="icon" />
						<ShareButton
							title={exhibitor.name}
							text={exhibitor.description || ''}
							url={shareUrl}
							size="sm"
							variant="icon"
						/>
					</div>
				{/if}
			</div>
		</div>
	</Card>
{:else}
	<!-- Default variant -->
	<Card hoverable clickable onclick={handleClick}>
		<div class="p-4">
			<div class="flex gap-4">
				{#if exhibitor.logo}
					<div class="flex-shrink-0">
						<img
							src={exhibitor.logo}
							alt={exhibitor.name}
							class="h-16 w-16 object-contain bg-gray-50 rounded-lg p-2"
						/>
					</div>
				{:else}
					<div class="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
						<span class="text-lg font-medium text-gray-500">
							{exhibitor.name.substring(0, 2).toUpperCase()}
						</span>
					</div>
				{/if}

				<div class="flex-1 min-w-0">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900">
								{exhibitor.name}
							</h3>
							<div class="flex items-center gap-2 mt-1">
								{#if exhibitor.standNumber}
									<span class="text-sm text-gray-500">
										Stand {exhibitor.standNumber}
									</span>
								{/if}
								{#if exhibitor.sector}
									<Badge variant="primary" size="sm">
										{exhibitor.sector.name}
									</Badge>
								{/if}
							</div>
						</div>

						{#if showActions}
							<FavoriteButton exhibitorId={exhibitor.id} size="sm" variant="icon" />
						{/if}
					</div>

					{#if exhibitor.description}
						<p class="text-sm text-gray-600 mt-2 line-clamp-2">
							{exhibitor.description}
						</p>
					{/if}

					{#if exhibitor.themes && exhibitor.themes.length > 0}
						<div class="flex flex-wrap gap-1 mt-2">
							{#each exhibitor.themes.slice(0, 4) as theme}
								<span
									class="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
								>
									{theme.name}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</Card>
{/if}
