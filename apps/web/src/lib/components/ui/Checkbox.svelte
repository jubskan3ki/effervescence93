<!-- src/lib/components/ui/Checkbox.svelte -->
<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		hint?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		id?: string;
		onchange?: (e: Event) => void;
	}

	let {
		checked = $bindable(false),
		label = '',
		hint = '',
		disabled = false,
		required = false,
		error = '',
		id = `checkbox-${Math.random().toString(36).slice(2)}`,
		onchange,
		...restProps
	}: Props = $props();
</script>

<div class="relative">
	<div class="flex items-start">
		<div class="flex items-center h-5">
			<input
				{id}
				type="checkbox"
				bind:checked
				{disabled}
				{required}
				{onchange}
				class="
					h-4 w-4 rounded border-gray-300 text-primary-600
					focus:ring-2 focus:ring-primary-500 focus:ring-offset-0
					disabled:cursor-not-allowed disabled:opacity-50
					transition duration-200
				"
				aria-describedby={hint ? `${id}-hint` : undefined}
				{...restProps}
			/>
		</div>
		{#if label}
			<div class="ml-3 text-sm">
				<label for={id} class="font-medium text-gray-700 select-none cursor-pointer">
					{label}
					{#if required}
						<span class="text-red-500 ml-0.5">*</span>
					{/if}
				</label>
				{#if hint}
					<p id="{id}-hint" class="text-gray-500">
						{hint}
					</p>
				{/if}
			</div>
		{/if}
	</div>
	{#if error}
		<p class="mt-1 text-sm text-red-600 ml-7">
			{error}
		</p>
	{/if}
</div>
