<!-- src/lib/components/exhibitor/ExhibitorDetails.svelte -->
<script lang="ts">
	import Badge from '../ui/Badge.svelte';
	import Card from '../ui/Card.svelte';
	import FavoriteButton from '../shared/FavoriteButton.svelte';
	import ShareButton from '../shared/ShareButton.svelte';
	import QRCode from '../shared/QRCode.svelte';
	import ContactCard from './ContactCard.svelte';

	interface Contact {
		id: string;
		name: string;
		role?: string;
		email?: string;
		phone?: string;
		linkedin?: string;
	}

	interface Exhibitor {
		id: string;
		name: string;
		slug?: string;
		description?: string;
		logo?: string;
		standNumber?: string;
		standSize?: string;
		sector?: { id: string; name: string; color?: string };
		themes?: Array<{ id: string; name: string }>;
		contacts?: Contact[];
		website?: string;
		socialMedia?: {
			linkedin?: string;
			twitter?: string;
			facebook?: string;
			instagram?: string;
		};
		documents?: Array<{
			id: string;
			name: string;
			type: string;
			url: string;
		}>;
		products?: Array<{
			id: string;
			name: string;
			description?: string;
			image?: string;
		}>;
		certifications?: string[];
		yearFounded?: number;
		employeeCount?: string;
		featured?: boolean;
	}

	interface Props {
		exhibitor: Exhibitor;
		showQRCode?: boolean;
		onMapClick?: () => void;
		onContactClick?: (contact: Contact) => void;
	}

	let { exhibitor, showQRCode = true, onMapClick, onContactClick }: Props = $props();

	let activeTab = $state<'about' | 'contacts' | 'products' | 'documents'>('about');

	const exhibitorUrl = $derived(
		`${typeof window !== 'undefined' ? window.location.origin : ''}/exposant/${exhibitor.slug || exhibitor.id}`
	);
</script>

<div class="exhibitor-details">
	<!-- Header -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
		<div class="flex flex-col lg:flex-row gap-6">
			<!-- Logo and basic info -->
			<div class="flex-shrink-0">
				{#if exhibitor.logo}
					<img
						src={exhibitor.logo}
						alt={exhibitor.name}
						class="h-32 w-32 object-contain bg-gray-50 rounded-lg p-4"
					/>
				{:else}
					<div
						class="h-32 w-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center"
					>
						<span class="text-3xl font-bold text-primary-700">
							{exhibitor.name.substring(0, 2).toUpperCase()}
						</span>
					</div>
				{/if}
			</div>

			<!-- Main info -->
			<div class="flex-1">
				<div class="flex items-start justify-between mb-4">
					<div>
						<h1 class="text-2xl font-bold text-gray-900 mb-2">
							{exhibitor.name}
						</h1>
						<div class="flex flex-wrap items-center gap-3">
							{#if exhibitor.featured}
								<Badge variant="warning">⭐ Exposant vedette</Badge>
							{/if}
							{#if exhibitor.sector}
								<Badge variant="primary">
									{exhibitor.sector.name}
								</Badge>
							{/if}
							{#if exhibitor.standNumber}
								<Badge variant="secondary">
									📍 Stand {exhibitor.standNumber}
								</Badge>
							{/if}
							{#if exhibitor.standSize}
								<span class="text-sm text-gray-500">
									{exhibitor.standSize}
								</span>
							{/if}
						</div>
					</div>

					<!-- Actions -->
					<div class="flex gap-2">
						<FavoriteButton exhibitorId={exhibitor.id} variant="button" size="sm" />
						<ShareButton
							title={exhibitor.name}
							text={exhibitor.description || ''}
							url={exhibitorUrl}
							variant="button"
							size="sm"
						/>
					</div>
				</div>

				{#if exhibitor.description}
					<p class="text-gray-600 mb-4">
						{exhibitor.description}
					</p>
				{/if}

				<!-- Quick info -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
					{#if exhibitor.yearFounded}
						<div>
							<p class="text-xs text-gray-500 uppercase">Fondée en</p>
							<p class="font-semibold text-gray-900">{exhibitor.yearFounded}</p>
						</div>
					{/if}
					{#if exhibitor.employeeCount}
						<div>
							<p class="text-xs text-gray-500 uppercase">Effectif</p>
							<p class="font-semibold text-gray-900">{exhibitor.employeeCount}</p>
						</div>
					{/if}
					{#if exhibitor.website}
						<div>
							<p class="text-xs text-gray-500 uppercase">Site web</p>
							<a
								href={exhibitor.website}
								target="_blank"
								rel="noopener noreferrer"
								class="font-semibold text-primary-600 hover:text-primary-700 truncate block"
							>
								Visiter
							</a>
						</div>
					{/if}
					{#if exhibitor.standNumber}
						<div>
							<p class="text-xs text-gray-500 uppercase">Localisation</p>
							<button
								type="button"
								onclick={onMapClick}
								class="font-semibold text-primary-600 hover:text-primary-700"
							>
								Voir sur le plan
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- QR Code -->
			{#if showQRCode}
				<div class="flex-shrink-0">
					<Card padding="sm">
						<div class="text-center">
							<QRCode
								value={exhibitorUrl}
								size={120}
								downloadable
								downloadFilename={`qr-${exhibitor.slug || exhibitor.id}`}
							/>
							<p class="text-xs text-gray-500 mt-2">QR Code du stand</p>
						</div>
					</Card>
				</div>
			{/if}
		</div>

		<!-- Themes -->
		{#if exhibitor.themes && exhibitor.themes.length > 0}
			<div class="mt-4 pt-4 border-t border-gray-200">
				<p class="text-sm font-medium text-gray-700 mb-2">Thématiques</p>
				<div class="flex flex-wrap gap-2">
					{#each exhibitor.themes as theme}
						<Badge variant="secondary" size="sm">
							{theme.name}
						</Badge>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Social media -->
		{#if exhibitor.socialMedia}
			<div class="mt-4 pt-4 border-t border-gray-200">
				<p class="text-sm font-medium text-gray-700 mb-2">Réseaux sociaux</p>
				<div class="flex gap-2">
					{#if exhibitor.socialMedia.linkedin}
						<a
							href={exhibitor.socialMedia.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							class="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
							aria-label="LinkedIn"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
								/>
							</svg>
						</a>
					{/if}
					{#if exhibitor.socialMedia.twitter}
						<a
							href={exhibitor.socialMedia.twitter}
							target="_blank"
							rel="noopener noreferrer"
							class="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
							aria-label="Twitter"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
								/>
							</svg>
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Tabs -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200">
		<!-- Tab navigation -->
		<div class="border-b border-gray-200">
			<nav class="flex -mb-px">
				<button
					type="button"
					onclick={() => (activeTab = 'about')}
					class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'about'
						? 'border-primary-500 text-primary-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					À propos
				</button>

				{#if exhibitor.contacts && exhibitor.contacts.length > 0}
					<button
						type="button"
						onclick={() => (activeTab = 'contacts')}
						class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'contacts'
							? 'border-primary-500 text-primary-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					>
						Contacts ({exhibitor.contacts.length})
					</button>
				{/if}

				{#if exhibitor.products && exhibitor.products.length > 0}
					<button
						type="button"
						onclick={() => (activeTab = 'products')}
						class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'products'
							? 'border-primary-500 text-primary-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					>
						Produits ({exhibitor.products.length})
					</button>
				{/if}

				{#if exhibitor.documents && exhibitor.documents.length > 0}
					<button
						type="button"
						onclick={() => (activeTab = 'documents')}
						class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'documents'
							? 'border-primary-500 text-primary-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					>
						Documents ({exhibitor.documents.length})
					</button>
				{/if}
			</nav>
		</div>

		<!-- Tab content -->
		<div class="p-6">
			{#if activeTab === 'about'}
				<div class="prose prose-sm max-w-none">
					{#if exhibitor.description}
						<p>{exhibitor.description}</p>
					{/if}

					{#if exhibitor.certifications && exhibitor.certifications.length > 0}
						<div class="mt-6">
							<h3 class="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
							<div class="flex flex-wrap gap-2">
								{#each exhibitor.certifications as cert}
									<Badge variant="success">
										✓ {cert}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'contacts' && exhibitor.contacts}
				<div class="grid gap-4 md:grid-cols-2">
					{#each exhibitor.contacts as contact}
						<ContactCard {contact} onclick={() => onContactClick?.(contact)} />
					{/each}
				</div>
			{:else if activeTab === 'products' && exhibitor.products}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each exhibitor.products as product}
						<Card>
							{#if product.image}
								<img
									src={product.image}
									alt={product.name}
									class="w-full h-32 object-cover rounded-t-lg"
								/>
							{/if}
							<div class="p-4">
								<h4 class="font-semibold text-gray-900">{product.name}</h4>
								{#if product.description}
									<p class="text-sm text-gray-600 mt-1">{product.description}</p>
								{/if}
							</div>
						</Card>
					{/each}
				</div>
			{:else if activeTab === 'documents' && exhibitor.documents}
				<div class="space-y-2">
					{#each exhibitor.documents as doc}
						<a
							href={doc.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
						>
							<div class="flex items-center gap-3">
								<svg
									class="h-8 w-8 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								<div>
									<p class="font-medium text-gray-900">{doc.name}</p>
									<p class="text-sm text-gray-500">{doc.type}</p>
								</div>
							</div>
							<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
