<!-- src/lib/components/map/BoothPopup.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { favorites, favoriteIds } from '$lib/stores/favorites';
	import { analytics } from '$lib/api/analytics';
	import type { Booth, Exhibitor } from '$lib/types';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let booth: Booth | null = null;
	export let exhibitor: Exhibitor | null = null;

	const dispatch = createEventDispatcher();

	$: isFavorite = exhibitor ? $favoriteIds.has(exhibitor.id) : false;

	function toggleFavorite() {
		if (exhibitor) {
			favorites.toggle(exhibitor);
			analytics.trackFavorite(exhibitor.id, isFavorite ? 'remove' : 'add');
		}
	}

	function viewDetails() {
		if (exhibitor) {
			dispatch('viewExhibitor', exhibitor);
			analytics.trackView(exhibitor.id, 'popup');
		}
	}

	async function share() {
		if (booth && exhibitor) {
			const url = `${window.location.origin}?stand=${booth.number}`;

			try {
				if (navigator.share) {
					await navigator.share({
						title: exhibitor.name,
						text: `Stand ${booth.number} - ${exhibitor.name}`,
						url: url,
					});
					analytics.trackShare(exhibitor.id, 'native');
				} else {
					await navigator.clipboard.writeText(url);
					analytics.trackShare(exhibitor.id, 'clipboard');
				}
			} catch (err) {
				console.error('Share failed:', err);
			}
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			dispatch('close');
		}
	}
</script>

{#if booth}
	<div class="popup-overlay" on:click={handleOverlayClick} transition:fade={{ duration: 200 }}>
		<div class="popup-card" transition:fly={{ y: 30, duration: 250, easing: quintOut }}>
			{#if exhibitor}
				<div class="popup-header">
					<div class="header-content">
						<div class="stand-badge">Stand {booth.number}</div>
						{#if exhibitor.sector}
							<div class="sector-badge" style="--sector-color: {exhibitor.sector.colorHex}">
								<span class="sector-dot" style="background: {exhibitor.sector.colorHex}"></span>
								{exhibitor.sector.name}
							</div>
						{/if}
					</div>
					<button class="close-btn" on:click={() => dispatch('close')}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="popup-body">
					{#if exhibitor.logoUrl}
						<div class="logo-container">
							<img src={exhibitor.logoUrl} alt={exhibitor.name} class="logo" />
						</div>
					{/if}

					<div class="company-section">
						<h2 class="company-name">{exhibitor.name}</h2>

						{#if exhibitor.description}
							<p class="company-description">
								{exhibitor.description.length > 200
									? exhibitor.description.substring(0, 200) + '...'
									: exhibitor.description}
							</p>
						{/if}

						{#if exhibitor.websiteUrl || exhibitor.linkedinUrl}
							<div class="links">
								{#if exhibitor.websiteUrl}
									<a href={exhibitor.websiteUrl} target="_blank" rel="noopener" class="link">
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
											/>
										</svg>
										Site web
									</a>
								{/if}
								{#if exhibitor.linkedinUrl}
									<a href={exhibitor.linkedinUrl} target="_blank" rel="noopener" class="link">
										<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
											<path
												d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
											/>
										</svg>
										LinkedIn
									</a>
								{/if}
							</div>
						{/if}
					</div>

					{#if exhibitor.contacts?.length}
						<div class="contacts-section">
							<h3 class="section-title">Contacts sur place</h3>
							<div class="contacts-list">
								{#each exhibitor.contacts.slice(0, 2) as contact}
									<div class="contact-item">
										<div class="contact-info">
											<div class="contact-name">
												{contact.firstName}
												{contact.lastName}
											</div>
											{#if contact.role}
												<div class="contact-role">{contact.role}</div>
											{/if}
										</div>
										<div class="contact-actions">
											{#if contact.email}
												<a href="mailto:{contact.email}" class="contact-btn" title="Email">
													<svg
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
													>
														<path
															d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
														/>
													</svg>
												</a>
											{/if}
											{#if contact.phone}
												<a href="tel:{contact.phone}" class="contact-btn" title="Téléphone">
													<svg
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
													>
														<path
															d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
														/>
													</svg>
												</a>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="popup-footer">
					<div class="actions-group">
						<button
							class="action-btn"
							class:active={isFavorite}
							on:click={toggleFavorite}
							title="{isFavorite ? 'Retirer des' : 'Ajouter aux'} favoris"
						>
							<svg
								width="18"
								height="18"
								fill={isFavorite ? 'currentColor' : 'none'}
								stroke="currentColor"
								viewBox="0 0 24 24"
								stroke-width="2"
							>
								<path
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</button>

						<button class="action-btn" on:click={share} title="Partager">
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
								/>
							</svg>
						</button>
					</div>

					<button class="primary-btn" on:click={viewDetails}>
						Voir la fiche
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			{:else}
				<div class="popup-empty">
					<button class="close-btn" on:click={() => dispatch('close')}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>

					<div class="empty-content">
						<div class="empty-icon">
							<svg
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<h3 class="empty-title">Stand {booth.number}</h3>
						<p class="empty-text">Ce stand est actuellement disponible</p>
						<span class="empty-badge">Disponible</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.popup-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}

	.popup-card {
		width: 100%;
		max-width: 480px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.popup-header {
		padding: 16px;
		border-bottom: 1px solid #f3f4f6;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.stand-badge {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: #111827;
		letter-spacing: 0.05em;
	}

	.sector-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		background: color-mix(in srgb, var(--sector-color) 8%, transparent);
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		color: #374151;
		width: fit-content;
	}

	.sector-dot {
		width: 6px;
		height: 6px;
		border-radius: 1px;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.popup-body {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.logo-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: #fafafa;
		border-radius: 8px;
		margin-bottom: 16px;
	}

	.logo {
		max-height: 56px;
		max-width: 100%;
		object-fit: contain;
	}

	.company-section {
		margin-bottom: 16px;
	}

	.company-name {
		font-size: 20px;
		font-weight: 600;
		color: #111827;
		margin: 0 0 8px 0;
		line-height: 1.3;
	}

	.company-description {
		font-size: 14px;
		line-height: 1.6;
		color: #6b7280;
		margin: 0 0 12px 0;
	}

	.links {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		color: #374151;
		text-decoration: none;
		transition: all 0.15s;
	}

	.link:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.contacts-section {
		padding-top: 16px;
		border-top: 1px solid #f3f4f6;
	}

	.section-title {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: #6b7280;
		margin: 0 0 12px 0;
		letter-spacing: 0.05em;
	}

	.contacts-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.contact-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px;
		background: #fafafa;
		border-radius: 6px;
	}

	.contact-info {
		flex: 1;
		min-width: 0;
	}

	.contact-name {
		font-size: 14px;
		font-weight: 500;
		color: #111827;
		margin-bottom: 2px;
	}

	.contact-role {
		font-size: 12px;
		color: #6b7280;
	}

	.contact-actions {
		display: flex;
		gap: 4px;
	}

	.contact-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		color: #6b7280;
		transition: all 0.15s;
	}

	.contact-btn:hover {
		background: #f9fafb;
		color: #111827;
		border-color: #d1d5db;
	}

	.popup-footer {
		padding: 16px;
		border-top: 1px solid #f3f4f6;
		background: #fafafa;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.actions-group {
		display: flex;
		gap: 4px;
	}

	.action-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	.action-btn:hover {
		background: #f9fafb;
		color: #111827;
		border-color: #d1d5db;
	}

	.action-btn.active {
		color: #ef4444;
		border-color: #ef4444;
		background: #fef2f2;
	}

	.primary-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 16px;
		background: #111827;
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.primary-btn:hover {
		background: #1f2937;
		transform: translateY(-1px);
	}

	.popup-empty {
		padding: 16px;
		position: relative;
	}

	.empty-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 48px 24px;
	}

	.empty-icon {
		width: 64px;
		height: 64px;
		background: #f9fafb;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		margin-bottom: 16px;
	}

	.empty-title {
		font-size: 18px;
		font-weight: 600;
		color: #111827;
		margin: 0 0 8px 0;
	}

	.empty-text {
		font-size: 14px;
		color: #6b7280;
		margin: 0 0 16px 0;
	}

	.empty-badge {
		padding: 6px 12px;
		background: #f0fdf4;
		color: #16a34a;
		font-size: 12px;
		font-weight: 600;
		border-radius: 6px;
	}

	@media (max-width: 640px) {
		.popup-card {
			max-height: 80vh;
		}
	}
</style>
