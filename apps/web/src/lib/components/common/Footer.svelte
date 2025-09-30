<!-- src/lib/components/common/Footer.svelte -->
<script lang="ts">
	export let variant: 'public' | 'admin' = 'public';

	const currentYear = new Date().getFullYear();
</script>

<footer class="footer {variant}">
	<div class="footer-container">
		{#if variant === 'public'}
			<div class="footer-grid">
				<!-- About -->
				<div class="footer-section">
					<h3 class="footer-title">Effervescence 93</h3>
					<p class="footer-text">
						Le salon économique de référence en Seine-Saint-Denis, organisé par la CCI 93.
					</p>
				</div>

				<!-- Quick Links -->
				<div class="footer-section">
					<h4 class="footer-subtitle">Liens rapides</h4>
					<nav class="footer-links">
						<a href="/" class="footer-link">Plan interactif</a>
						<a href="/favoris" class="footer-link">Mes favoris</a>
						<a href="/admin" class="footer-link">Espace Admin</a>
					</nav>
				</div>

				<!-- Partners -->
				<div class="footer-section">
					<h4 class="footer-subtitle">Partenaires</h4>
					<div class="partners">
						<img src="/logo-cci93.png" alt="CCI 93" class="partner-logo" />
						<img src="/logo-seine-saint-denis.png" alt="Seine-Saint-Denis" class="partner-logo" />
					</div>
				</div>

				<!-- Contact -->
				<div class="footer-section">
					<h4 class="footer-subtitle">Contact</h4>
					<p class="footer-text">
						CCI Seine-Saint-Denis<br />
						191 avenue Paul Vaillant-Couturier<br />
						93000 Bobigny
					</p>
				</div>
			</div>
		{/if}

		<!-- Bottom -->
		<div class="footer-bottom">
			<p class="copyright">
				© {currentYear} Effervescence 93 - CCI Seine-Saint-Denis
			</p>
			<p class="credits">
				Développé par <a href="https://syngertic.com" target="_blank" rel="noopener" class="link">
					Syngertic Solutions
				</a>
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		@apply bg-gray-50 border-t border-gray-200;
	}

	.footer.admin {
		@apply bg-gray-900 text-gray-400 border-gray-800;
	}

	.footer-container {
		@apply container-max py-8;
	}

	.footer-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8;
	}

	.footer-section {
		@apply space-y-3;
	}

	.footer-title {
		@apply text-lg font-bold text-primary;
	}

	.footer-subtitle {
		@apply font-semibold text-gray-900;
	}

	.admin .footer-subtitle {
		@apply text-gray-300;
	}

	.footer-text {
		@apply text-sm text-gray-600;
	}

	.admin .footer-text {
		@apply text-gray-500;
	}

	.footer-links {
		@apply flex flex-col gap-2;
	}

	.footer-link {
		@apply text-sm text-gray-600 hover:text-primary transition-colors;
	}

	.partners {
		@apply flex gap-4;
	}

	.partner-logo {
		@apply h-12 w-auto opacity-70 hover:opacity-100 transition-opacity;
	}

	.footer-bottom {
		@apply pt-6 border-t border-gray-200;
		@apply flex flex-col sm:flex-row justify-between items-center gap-4;
	}

	.admin .footer-bottom {
		@apply border-gray-800;
	}

	.copyright {
		@apply text-sm text-gray-600;
	}

	.credits {
		@apply text-sm text-gray-500;
	}

	.link {
		@apply text-primary hover:underline;
	}
</style>
