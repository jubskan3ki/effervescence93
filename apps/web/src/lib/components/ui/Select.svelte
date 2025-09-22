<!-- src/lib/components/ui/Select.svelte -->
<script lang="ts">
	interface Props {
		value?: string;
		options?: Array<{ value: string; label: string }>;
		placeholder?: string;
		label?: string;
		error?: string;
		hint?: string;
		required?: boolean;
		disabled?: boolean;
		id?: string;
		onchange?: (e: Event) => void;
		onblur?: (e: FocusEvent) => void;
	}

	let {
		value = $bindable(),
		options = [],
		placeholder = 'Sélectionner...',
		label = '',
		error = '',
		hint = '',
		required = false,
		disabled = false,
		id = `select-${Math.random().toString(36).slice(2)}`,
		onchange,
		onblur,
		...restProps
	}: Props = $props();

	const hasError = $derived(!!error);
</script>

<div class="w-full">
	{#if label}
		<label for={id} class="block text-sm font-medium text-gray-700 mb-1">
			{label}
			{#if required}
				<span class="text-red-500 ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<select
		{id}
		bind:value
		{required}
		{disabled}
		{onchange}
		{onblur}
		class="
			block w-full rounded-lg border px-3 py-2
			text-gray-900 bg-white
			focus:outline-none focus:ring-2 focus:ring-offset-0
			disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
			transition-colors duration-200
			{hasError
			? 'border-red-300 focus:border-red-500 focus:ring-red-500'
			: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
		"
		aria-invalid={hasError}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		{...restProps}
	>
		<option value="" disabled selected>{placeholder}</option>
		{#each options as option}
			<option value={option.value}>
				{option.label}
			</option>
		{/each}
	</select>

	{#if error}
		<p id="{id}-error" class="mt-1 text-sm text-red-600">
			{error}
		</p>
	{:else if hint}
		<p id="{id}-hint" class="mt-1 text-sm text-gray-500">
			{hint}
		</p>
	{/if}
</div>
