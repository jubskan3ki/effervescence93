<!-- src/lib/components/exhibitor/ExhibitorForm.svelte -->
<script lang="ts">
	import Input from '../ui/Input.svelte';
	import Textarea from '../ui/Textarea.svelte';
	import Select from '../ui/Select.svelte';
	import Checkbox from '../ui/Checkbox.svelte';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import Badge from '../ui/Badge.svelte';

	interface Contact {
		id?: string;
		name: string;
		role?: string;
		email?: string;
		phone?: string;
		mobile?: string;
		isPrimary?: boolean;
	}

	interface Exhibitor {
		id?: string;
		name: string;
		slug?: string;
		description?: string;
		logo?: string;
		standNumber?: string;
		standSize?: string;
		sectorId?: string;
		themeIds?: string[];
		contacts?: Contact[];
		website?: string;
		socialMedia?: {
			linkedin?: string;
			twitter?: string;
			facebook?: string;
			instagram?: string;
		};
		yearFounded?: number;
		employeeCount?: string;
		featured?: boolean;
	}

	interface Props {
		exhibitor?: Exhibitor;
		sectors?: Array<{ id: string; name: string }>;
		themes?: Array<{ id: string; name: string }>;
		mode?: 'create' | 'edit';
		onSubmit?: (exhibitor: Exhibitor) => void;
		onCancel?: () => void;
		loading?: boolean;
	}

	let {
		exhibitor: initialExhibitor,
		sectors = [],
		themes = [],
		mode = 'create',
		onSubmit,
		onCancel,
		loading = false,
	}: Props = $props();

	// Form state
	let formData = $state<Exhibitor>({
		name: '',
		description: '',
		standNumber: '',
		standSize: '',
		website: '',
		yearFounded: undefined,
		employeeCount: '',
		featured: false,
		contacts: [],
		themeIds: [],
		socialMedia: {
			linkedin: '',
			twitter: '',
			facebook: '',
			instagram: '',
		},
		...initialExhibitor,
	});

	// Ensure socialMedia is always defined
	if (!formData.socialMedia) {
		formData.socialMedia = {
			linkedin: '',
			twitter: '',
			facebook: '',
			instagram: '',
		};
	}

	let errors = $state<Record<string, string>>({});
	let currentContact = $state<Contact>({ name: '', role: '', email: '', phone: '' });
	let editingContactIndex = $state<number | null>(null);
	let showContactForm = $state(false);

	// State for yearFounded as string for the Input component
	let yearFoundedString = $state(formData.yearFounded?.toString() || '');

	// Sync yearFoundedString with formData.yearFounded
	$effect(() => {
		const year = yearFoundedString ? parseInt(yearFoundedString, 10) : undefined;
		if (!isNaN(year!) && year !== formData.yearFounded) {
			formData.yearFounded = year;
		} else if (!yearFoundedString && formData.yearFounded !== undefined) {
			formData.yearFounded = undefined;
		}
	});

	// Validation
	function validateForm(): boolean {
		const newErrors: Record<string, string> = {};

		if (!formData.name?.trim()) {
			newErrors.name = 'Le nom est requis';
		}

		if (!formData.standNumber?.trim()) {
			newErrors.standNumber = 'Le numéro de stand est requis';
		}

		if (formData.website && !isValidUrl(formData.website)) {
			newErrors.website = 'URL invalide';
		}

		if (formData.contacts?.length === 0) {
			newErrors.contacts = 'Au moins un contact est requis';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	function isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	function isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	// Contact management
	function addContact() {
		const contactErrors: Record<string, string> = {};

		if (!currentContact.name?.trim()) {
			contactErrors.contactName = 'Le nom du contact est requis';
		}

		if (currentContact.email && !isValidEmail(currentContact.email)) {
			contactErrors.contactEmail = 'Email invalide';
		}

		if (Object.keys(contactErrors).length > 0) {
			errors = { ...errors, ...contactErrors };
			return;
		}

		if (editingContactIndex !== null) {
			// Update existing contact
			if (formData.contacts) {
				formData.contacts[editingContactIndex] = { ...currentContact };
			}
			editingContactIndex = null;
		} else {
			// Add new contact
			formData.contacts = [...(formData.contacts || []), { ...currentContact }];
		}

		// Reset contact form
		currentContact = { name: '', role: '', email: '', phone: '' };
		showContactForm = false;
		errors = {};
	}

	function editContact(index: number) {
		if (formData.contacts) {
			currentContact = { ...formData.contacts[index] };
			editingContactIndex = index;
			showContactForm = true;
		}
	}

	function removeContact(index: number) {
		if (formData.contacts) {
			formData.contacts = formData.contacts.filter((_, i) => i !== index);
		}
	}

	function cancelContactEdit() {
		currentContact = { name: '', role: '', email: '', phone: '' };
		editingContactIndex = null;
		showContactForm = false;
	}

	// Theme selection
	function toggleTheme(themeId: string) {
		if (!formData.themeIds) {
			formData.themeIds = [];
		}

		if (formData.themeIds.includes(themeId)) {
			formData.themeIds = formData.themeIds.filter((id) => id !== themeId);
		} else {
			formData.themeIds = [...formData.themeIds, themeId];
		}
	}

	// Form submission
	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		onSubmit?.(formData);
	}

	function handleCancel() {
		onCancel?.();
	}

	// Handle file upload
	function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			if (!file.type.startsWith('image/')) {
				errors.logo = 'Le fichier doit être une image';
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				// 5MB
				errors.logo = "L'image ne doit pas dépasser 5MB";
				return;
			}

			// Preview image
			const reader = new FileReader();
			reader.onload = (e) => {
				formData.logo = e.target?.result as string;
			};
			reader.readAsDataURL(file);

			errors.logo = '';
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<!-- Basic Information -->
	<Card>
		{#snippet header()}
			<h3 class="text-lg font-semibold text-gray-900">Informations générales</h3>
		{/snippet}

		<div class="grid gap-4 md:grid-cols-2">
			<div class="md:col-span-2">
				<Input
					label="Nom de l'entreprise"
					bind:value={formData.name}
					error={errors.name}
					required
					placeholder="Ex: Tech Innovators SAS"
				/>
			</div>

			<Input
				label="Numéro de stand"
				bind:value={formData.standNumber}
				error={errors.standNumber}
				required
				placeholder="Ex: A12"
			/>

			<Input label="Taille du stand" bind:value={formData.standSize} placeholder="Ex: 9m²" />

			<div class="md:col-span-2">
				<Textarea
					label="Description"
					bind:value={formData.description}
					rows={4}
					placeholder="Décrivez votre entreprise, vos produits et services..."
				/>
			</div>

			<Select
				label="Secteur d'activité"
				bind:value={formData.sectorId}
				options={[
					{ value: '', label: 'Sélectionner un secteur' },
					...sectors.map((s) => ({ value: s.id, label: s.name })),
				]}
			/>

			<Select
				label="Effectif"
				bind:value={formData.employeeCount}
				options={[
					{ value: '', label: 'Sélectionner' },
					{ value: '1-9', label: '1-9 employés' },
					{ value: '10-49', label: '10-49 employés' },
					{ value: '50-249', label: '50-249 employés' },
					{ value: '250+', label: '250+ employés' },
				]}
			/>

			<Input type="number" label="Année de création" bind:value={yearFoundedString} placeholder="Ex: 2015" />

			<Input
				label="Site web"
				bind:value={formData.website}
				error={errors.website}
				placeholder="https://www.exemple.com"
			/>

			<div class="md:col-span-2">
				<Checkbox
					bind:checked={formData.featured}
					label="Exposant vedette"
					hint="Mettre en avant cet exposant sur le plan"
				/>
			</div>
		</div>
	</Card>

	<!-- Logo -->
	<Card>
		{#snippet header()}
			<h3 class="text-lg font-semibold text-gray-900">Logo</h3>
		{/snippet}

		<div class="space-y-4">
			{#if formData.logo}
				<div class="relative inline-block">
					<img
						src={formData.logo}
						alt="Logo preview"
						class="h-32 w-32 object-contain bg-gray-50 rounded-lg p-2"
					/>
					<button
						type="button"
						onclick={() => (formData.logo = '')}
						class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
						aria-label="Supprimer le logo"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<div>
				<input
					type="file"
					accept="image/*"
					onchange={handleLogoUpload}
					class="block w-full text-sm text-gray-500
						file:mr-4 file:py-2 file:px-4
						file:rounded-lg file:border-0
						file:text-sm file:font-semibold
						file:bg-primary-50 file:text-primary-700
						hover:file:bg-primary-100"
				/>
				{#if errors.logo}
					<p class="mt-1 text-sm text-red-600">{errors.logo}</p>
				{/if}
				<p class="mt-1 text-xs text-gray-500">PNG, JPG ou SVG. Max 5MB.</p>
			</div>
		</div>
	</Card>

	<!-- Themes -->
	{#if themes.length > 0}
		<Card>
			{#snippet header()}
				<h3 class="text-lg font-semibold text-gray-900">Thématiques</h3>
			{/snippet}

			<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
				{#each themes as theme}
					<label class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
						<input
							type="checkbox"
							checked={formData.themeIds?.includes(theme.id)}
							onchange={() => toggleTheme(theme.id)}
							class="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
						/>
						<span class="ml-2 text-sm text-gray-700">{theme.name}</span>
					</label>
				{/each}
			</div>
		</Card>
	{/if}

	<!-- Contacts -->
	<Card>
		{#snippet header()}
			<h3 class="text-lg font-semibold text-gray-900">
				Contacts ({formData.contacts?.length || 0})
			</h3>
		{/snippet}

		{#if errors.contacts}
			<p class="text-sm text-red-600 mb-4">{errors.contacts}</p>
		{/if}

		<!-- Contact list -->
		{#if formData.contacts && formData.contacts.length > 0}
			<div class="space-y-2 mb-4">
				{#each formData.contacts as contact, index}
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div>
							<p class="font-medium text-gray-900">
								{contact.name}
								{#if contact.isPrimary}
									<Badge variant="primary" size="sm">Principal</Badge>
								{/if}
							</p>
							<p class="text-sm text-gray-600">{contact.role}</p>
							<p class="text-sm text-gray-500">{contact.email} • {contact.phone}</p>
						</div>
						<div class="flex gap-1">
							<Button type="button" variant="ghost" size="sm" onclick={() => editContact(index)}>
								Modifier
							</Button>
							<Button type="button" variant="ghost" size="sm" onclick={() => removeContact(index)}>
								Supprimer
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Add/Edit contact form -->
		{#if showContactForm}
			<div class="p-4 border border-gray-200 rounded-lg space-y-4">
				<h4 class="font-medium text-gray-900">
					{editingContactIndex !== null ? 'Modifier le contact' : 'Ajouter un contact'}
				</h4>

				<div class="grid gap-4 md:grid-cols-2">
					<Input
						label="Nom"
						bind:value={currentContact.name}
						error={errors.contactName}
						placeholder="Prénom Nom"
					/>

					<Input label="Fonction" bind:value={currentContact.role} placeholder="Ex: Directeur commercial" />

					<Input
						type="email"
						label="Email"
						bind:value={currentContact.email}
						error={errors.contactEmail}
						placeholder="contact@exemple.com"
					/>

					<Input
						type="tel"
						label="Téléphone"
						bind:value={currentContact.phone}
						placeholder="+33 1 23 45 67 89"
					/>

					<div class="md:col-span-2">
						<Checkbox bind:checked={currentContact.isPrimary} label="Contact principal" />
					</div>
				</div>

				<div class="flex gap-2">
					<Button type="button" variant="primary" size="sm" onclick={addContact}>
						{editingContactIndex !== null ? 'Mettre à jour' : 'Ajouter'}
					</Button>
					<Button type="button" variant="outline" size="sm" onclick={cancelContactEdit}>Annuler</Button>
				</div>
			</div>
		{:else}
			<Button type="button" variant="outline" onclick={() => (showContactForm = true)}>
				<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Ajouter un contact
			</Button>
		{/if}
	</Card>

	<!-- Social Media -->
	<Card>
		{#snippet header()}
			<h3 class="text-lg font-semibold text-gray-900">Réseaux sociaux</h3>
		{/snippet}

		<div class="grid gap-4 md:grid-cols-2">
			<Input
				label="LinkedIn"
				bind:value={formData.socialMedia!.linkedin}
				placeholder="https://linkedin.com/company/..."
			/>

			<Input label="Twitter" bind:value={formData.socialMedia!.twitter} placeholder="https://twitter.com/..." />

			<Input
				label="Facebook"
				bind:value={formData.socialMedia!.facebook}
				placeholder="https://facebook.com/..."
			/>

			<Input
				label="Instagram"
				bind:value={formData.socialMedia!.instagram}
				placeholder="https://instagram.com/..."
			/>
		</div>
	</Card>

	<!-- Actions -->
	<div class="flex justify-end gap-3">
		<Button type="button" variant="outline" onclick={handleCancel} disabled={loading}>Annuler</Button>
		<Button type="submit" variant="primary" {loading}>
			{mode === 'create' ? "Créer l'exposant" : 'Enregistrer les modifications'}
		</Button>
	</div>
</form>
