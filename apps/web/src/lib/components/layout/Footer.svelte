<!-- src/lib/components/layout/Footer.svelte -->
<script lang="ts">
	import ShareButton from '../shared/ShareButton.svelte';
	import QRCode from '../shared/QRCode.svelte';
	import Modal from '../ui/Modal.svelte';

	interface Props {
		minimal?: boolean;
	}

	let { minimal = false }: Props = $props();

	let showQRModal = $state(false);

	const currentYear = new Date().getFullYear();

	const partners = [
		{ name: 'CCI 93', logo: '/logos/cci93.png', url: 'https://www.cci93.fr' },
		{ name: 'Seine-Saint-Denis', logo: '/logos/departement93.png', url: 'https://seinesaintdenis.fr' },
		{ name: 'Région Île-de-France', logo: '/logos/region-idf.png', url: 'https://www.iledefrance.fr' },
		{ name: 'BPI France', logo: '/logos/bpifrance.png', url: 'https://www.bpifrance.fr' },
	];

	const footerLinks = {
		event: [
			{ name: 'Programme', href: '/programme' },
			{ name: 'Exposants', href: '/exposants' },
			{ name: 'Conférences', href: '/conferences' },
			{ name: 'Ateliers', href: '/ateliers' },
			{ name: 'Parcours', href: '/parcours' },
		],
		practical: [
			{ name: 'Informations pratiques', href: '/informations' },
			{ name: "Plan d'accès", href: '/acces' },
			{ name: 'Restauration', href: '/restauration' },
			{ name: 'Hébergements', href: '/hebergements' },
			{ name: 'FAQ', href: '/faq' },
		],
		about: [
			{ name: 'À propos', href: '/about' },
			{ name: 'Contact', href: '/contact' },
			{ name: 'Presse', href: '/presse' },
			{ name: 'Partenaires', href: '/partenaires' },
			{ name: 'Éditions précédentes', href: '/archives' },
		],
		legal: [
			{ name: 'Mentions légales', href: '/mentions-legales' },
			{ name: 'Politique de confidentialité', href: '/confidentialite' },
			{ name: 'CGU', href: '/cgu' },
			{ name: 'Cookies', href: '/cookies' },
			{ name: 'Accessibilité', href: '/accessibilite' },
		],
	};

	const socialLinks = [
		{
			name: 'LinkedIn',
			href: 'https://linkedin.com/company/effervescence93',
			icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
		},
		{
			name: 'Twitter',
			href: 'https://twitter.com/effervescence93',
			icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
		},
		{
			name: 'Facebook',
			href: 'https://facebook.com/effervescence93',
			icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
		},
		{
			name: 'Instagram',
			href: 'https://instagram.com/effervescence93',
			icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z',
		},
	];
</script>

<footer class="bg-gray-50 border-t border-gray-200 {minimal ? 'py-8' : 'pt-12 pb-8'}">
	{#if !minimal}
		<!-- Partners -->
		<div class="container-app mb-12">
			<div class="text-center mb-8">
				<h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Nos partenaires</h3>
				<div class="flex flex-wrap items-center justify-center gap-8">
					{#each partners as partner}
						<a
							href={partner.url}
							target="_blank"
							rel="noopener noreferrer"
							class="grayscale hover:grayscale-0 transition-all duration-300"
							aria-label={partner.name}
						>
							<img
								src={partner.logo}
								alt={partner.name}
								class="h-12 md:h-16 object-contain"
								loading="lazy"
							/>
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Main Footer Content -->
		<div class="container-app">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
				<!-- Event Section -->
				<div>
					<h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">L'événement</h3>
					<ul class="space-y-2">
						{#each footerLinks.event as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-gray-600 hover:text-primary-600 transition-colors"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Practical Section -->
				<div>
					<h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Infos pratiques</h3>
					<ul class="space-y-2">
						{#each footerLinks.practical as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-gray-600 hover:text-primary-600 transition-colors"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- About Section -->
				<div>
					<h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">À propos</h3>
					<ul class="space-y-2">
						{#each footerLinks.about as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-gray-600 hover:text-primary-600 transition-colors"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Contact & Social -->
				<div>
					<h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Restez connecté</h3>
					<div class="space-y-4">
						<!-- QR Code -->
						<button
							type="button"
							onclick={() => (showQRModal = true)}
							class="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h8m-4 0v.01M5 5h2m2 0h2M7 7V5m0 2H5m2 0v2m0-2h2m-2 2H5m2 2v2m0-2h2m0 0h2M7 7h2"
								/>
							</svg>
							<span>QR Code</span>
						</button>

						<!-- Share -->
						<div>
							<ShareButton variant="button" size="sm" />
						</div>

						<!-- Social Links -->
						<div class="flex gap-3">
							{#each socialLinks as social}
								<a
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									class="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-primary-600 hover:border-primary-600 transition-colors"
									aria-label={social.name}
								>
									<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
										<path d={social.icon} />
									</svg>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Bottom Bar -->
	<div class="container-app">
		<div class="pt-8 border-t border-gray-300">
			<div class="flex flex-col md:flex-row items-center justify-between gap-4">
				<div class="flex items-center gap-2">
					<div class="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
						<span class="text-white font-bold text-sm">E93</span>
					</div>
					<p class="text-sm text-gray-600">
						© {currentYear} Effervescence 93 - CCI Seine-Saint-Denis
					</p>
				</div>

				<!-- Legal Links -->
				<div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
					{#each footerLinks.legal as link, index}
						{#if index > 0}
							<span class="hidden sm:inline">•</span>
						{/if}
						<a href={link.href} class="hover:text-gray-700 transition-colors">
							{link.name}
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
</footer>

<!-- QR Code Modal -->
<Modal bind:open={showQRModal} title="QR Code du plan" size="sm">
	<div class="flex flex-col items-center py-4">
		<QRCode
			value={typeof window !== 'undefined' ? window.location.origin : 'https://plan.effervescence93.fr'}
			size={250}
			downloadable={true}
			downloadFilename="effervescence93-qrcode"
		/>
		<p class="mt-4 text-sm text-gray-600 text-center">
			Scannez ce QR code pour accéder directement au plan interactif
		</p>
	</div>
</Modal>

<style>
	.container-app {
		@apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
	}
</style>
