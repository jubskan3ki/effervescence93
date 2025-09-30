<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/api/auth';

	let email = '';
	let password = '';
	let remember = false;
	let loading = false;
	let error = '';
	let showPassword = false;

	$: redirectTo = $page.url.searchParams.get('redirect') || '/admin';

	async function handleLogin() {
		loading = true;
		error = '';

		try {
			await auth.login(email, password, { remember });
			await goto(redirectTo);
		} catch (err: any) {
			if (err.status === 401) {
				error = 'Email ou mot de passe incorrect';
			} else if (err.status === 403) {
				error = 'Votre compte est en attente de validation';
			} else {
				error = 'Une erreur est survenue';
			}
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Connexion - Effervescence 93</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Titre -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Connexion</h1>
			<p class="mt-2 text-gray-600">Accédez à votre espace administrateur</p>
		</div>

		<!-- Card -->
		<div class="bg-white rounded-lg shadow p-8">
			<form on:submit|preventDefault={handleLogin}>
				<!-- Erreur -->
				{#if error}
					<div class="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
						{error}
					</div>
				{/if}

				<!-- Email -->
				<div class="mb-4">
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						disabled={loading}
						placeholder="vous@exemple.com"
						class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
					/>
				</div>

				<!-- Mot de passe -->
				<div class="mb-4">
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Mot de passe
					</label>
					<div class="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							disabled={loading}
							placeholder="••••••••"
							class="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						/>
						<button
							type="button"
							on:click={() => showPassword = !showPassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{#if showPassword}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
								{/if}
							</svg>
						</button>
					</div>
				</div>

				<!-- Remember -->
				<div class="mb-6">
					<label class="flex items-center">
						<input
							type="checkbox"
							bind:checked={remember}
							disabled={loading}
							class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
						/>
						<span class="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
					</label>
				</div>

				<!-- Bouton -->
				<button
					type="submit"
					disabled={loading || !email || !password}
					class="w-full py-2.5 px-4 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if loading}
						<span class="flex items-center justify-center">
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Connexion...
						</span>
					{:else}
						Se connecter
					{/if}
				</button>
			</form>

			<div class="mt-6 pt-6 border-t border-gray-200 text-center">
				<span class="text-sm text-gray-600">Pas encore de compte ?</span>
				{' '}
				<a href="/auth/register" class="text-sm font-medium text-primary-600 hover:text-primary-500">
					S'inscrire
				</a>
			</div>
		</div>
	</div>
</div>
