<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
	import Sidebar from '$lib/components/admin/Sidebar.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<div class="admin-container">
	<Sidebar user={data.user} />
	<main class="admin-main">
		<slot />
	</main>
</div>

<style>
	.admin-container {
		@apply min-h-screen bg-gray-50;
	}

	.admin-main {
		@apply min-h-screen;
		padding-top: 1rem;
	}

	/* Desktop: décalage pour la sidebar */
	@media (min-width: 1024px) {
		.admin-main {
			margin-left: 260px; /* Largeur de la sidebar */
		}
	}

	/* Mobile: pas de décalage */
	@media (max-width: 1023px) {
		.admin-main {
			padding-top: 4rem; /* Espace pour le bouton burger */
		}
	}
</style>
