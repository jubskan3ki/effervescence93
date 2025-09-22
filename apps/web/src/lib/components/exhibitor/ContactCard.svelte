<!-- src/lib/components/exhibitor/ContactCard.svelte -->
<script lang="ts">
	import Card from '../ui/Card.svelte';
	import Button from '../ui/Button.svelte';
	import Badge from '../ui/Badge.svelte';

	interface Contact {
		id?: string;
		name: string;
		role?: string;
		title?: string;
		email?: string;
		phone?: string;
		mobile?: string;
		linkedin?: string;
		avatar?: string;
		isPrimary?: boolean;
	}

	interface Props {
		contact: Contact;
		variant?: 'default' | 'compact' | 'detailed';
		showActions?: boolean;
		onclick?: (contact: Contact) => void;
		onEmailClick?: (email: string) => void;
		onPhoneClick?: (phone: string) => void;
	}

	let { contact, variant = 'default', showActions = true, onclick, onEmailClick, onPhoneClick }: Props = $props();

	function handleEmailClick(e: Event) {
		e.stopPropagation();
		if (contact.email) {
			if (onEmailClick) {
				onEmailClick(contact.email);
			} else {
				window.location.href = `mailto:${contact.email}`;
			}
		}
	}

	function handlePhoneClick(e: Event, phone: string) {
		e.stopPropagation();
		if (onPhoneClick) {
			onPhoneClick(phone);
		} else {
			window.location.href = `tel:${phone}`;
		}
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

{#if variant === 'compact'}
	<!-- Compact variant -->
	<div
		class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow {onclick
			? 'cursor-pointer'
			: ''}"
		onclick={() => onclick?.(contact)}
		role={onclick ? 'button' : undefined}
	>
		<div class="flex items-center gap-3">
			<!-- Avatar -->
			{#if contact.avatar}
				<img src={contact.avatar} alt={contact.name} class="h-10 w-10 rounded-full object-cover" />
			{:else}
				<div class="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
					<span class="text-sm font-medium text-primary-700">
						{getInitials(contact.name)}
					</span>
				</div>
			{/if}

			<!-- Info -->
			<div>
				<p class="font-medium text-gray-900">
					{contact.name}
					{#if contact.isPrimary}
						<Badge variant="primary" size="sm">Contact principal</Badge>
					{/if}
				</p>
				{#if contact.role || contact.title}
					<p class="text-sm text-gray-500">{contact.role || contact.title}</p>
				{/if}
			</div>
		</div>

		<!-- Quick actions -->
		{#if showActions}
			<div class="flex gap-1">
				{#if contact.email}
					<button
						type="button"
						onclick={handleEmailClick}
						class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
						aria-label="Envoyer un email"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</button>
				{/if}
				{#if contact.phone || contact.mobile}
					<button
						type="button"
						onclick={(e) => handlePhoneClick(e, contact.mobile || contact.phone || '')}
						class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
						aria-label="Appeler"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
							/>
						</svg>
					</button>
				{/if}
			</div>
		{/if}
	</div>
{:else if variant === 'detailed'}
	<!-- Detailed variant -->
	<Card hoverable={!!onclick} clickable={!!onclick} onclick={() => onclick?.(contact)}>
		<div class="p-4">
			<div class="flex items-start gap-4">
				<!-- Avatar -->
				{#if contact.avatar}
					<img src={contact.avatar} alt={contact.name} class="h-20 w-20 rounded-full object-cover" />
				{:else}
					<div
						class="h-20 w-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center"
					>
						<span class="text-xl font-bold text-primary-700">
							{getInitials(contact.name)}
						</span>
					</div>
				{/if}

				<!-- Info -->
				<div class="flex-1">
					<div class="mb-3">
						<h3 class="text-lg font-semibold text-gray-900">
							{contact.name}
						</h3>
						{#if contact.role || contact.title}
							<p class="text-gray-600">{contact.role || contact.title}</p>
						{/if}
						{#if contact.isPrimary}
							<Badge variant="primary" size="sm">Contact principal</Badge>
						{/if}
					</div>

					<!-- Contact details -->
					<div class="space-y-2">
						{#if contact.email}
							<div class="flex items-center gap-2 text-sm">
								<svg
									class="h-4 w-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<a
									href="mailto:{contact.email}"
									class="text-primary-600 hover:text-primary-700"
									onclick={handleEmailClick}
								>
									{contact.email}
								</a>
							</div>
						{/if}

						{#if contact.phone}
							<div class="flex items-center gap-2 text-sm">
								<svg
									class="h-4 w-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
								<a
									href="tel:{contact.phone}"
									class="text-primary-600 hover:text-primary-700"
									onclick={(e) => handlePhoneClick(e, contact.phone || '')}
								>
									{contact.phone}
								</a>
								<span class="text-gray-500">(Bureau)</span>
							</div>
						{/if}

						{#if contact.mobile}
							<div class="flex items-center gap-2 text-sm">
								<svg
									class="h-4 w-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
									/>
								</svg>
								<a
									href="tel:{contact.mobile}"
									class="text-primary-600 hover:text-primary-700"
									onclick={(e) => handlePhoneClick(e, contact.mobile || '')}
								>
									{contact.mobile}
								</a>
								<span class="text-gray-500">(Mobile)</span>
							</div>
						{/if}

						{#if contact.linkedin}
							<div class="flex items-center gap-2 text-sm">
								<svg class="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
									/>
								</svg>
								<a
									href={contact.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									class="text-primary-600 hover:text-primary-700"
								>
									Profil LinkedIn
								</a>
							</div>
						{/if}
					</div>

					<!-- Actions -->
					{#if showActions}
						<div class="flex gap-2 mt-4">
							{#if contact.email}
								<Button variant="primary" size="sm" onclick={handleEmailClick}>
									<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
									Envoyer un email
								</Button>
							{/if}
							{#if contact.phone || contact.mobile}
								<Button
									variant="outline"
									size="sm"
									onclick={(e) => handlePhoneClick(e, contact.mobile || contact.phone || '')}
								>
									<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
									Appeler
								</Button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</Card>
{:else}
	<!-- Default variant -->
	<Card hoverable={!!onclick} clickable={!!onclick} onclick={() => onclick?.(contact)}>
		<div class="p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<!-- Avatar -->
					{#if contact.avatar}
						<img src={contact.avatar} alt={contact.name} class="h-12 w-12 rounded-full object-cover" />
					{:else}
						<div class="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
							<span class="font-medium text-primary-700">
								{getInitials(contact.name)}
							</span>
						</div>
					{/if}

					<!-- Info -->
					<div>
						<p class="font-semibold text-gray-900">
							{contact.name}
							{#if contact.isPrimary}
								<Badge variant="primary" size="sm">Principal</Badge>
							{/if}
						</p>
						{#if contact.role || contact.title}
							<p class="text-sm text-gray-600">{contact.role || contact.title}</p>
						{/if}
						<div class="flex items-center gap-3 mt-1">
							{#if contact.email}
								<a
									href="mailto:{contact.email}"
									class="text-sm text-primary-600 hover:text-primary-700"
									onclick={handleEmailClick}
								>
									{contact.email}
								</a>
							{/if}
							{#if contact.phone}
								<a
									href="tel:{contact.phone}"
									class="text-sm text-primary-600 hover:text-primary-700"
									onclick={(e) => handlePhoneClick(e, contact.phone || '')}
								>
									{contact.phone}
								</a>
							{/if}
						</div>
					</div>
				</div>

				<!-- Actions -->
				{#if showActions}
					<div class="flex gap-1">
						{#if contact.email}
							<Button variant="ghost" size="sm" onclick={handleEmailClick}>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</Button>
						{/if}
						{#if contact.phone || contact.mobile}
							<Button
								variant="ghost"
								size="sm"
								onclick={(e) => handlePhoneClick(e, contact.mobile || contact.phone || '')}
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
							</Button>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</Card>
{/if}
