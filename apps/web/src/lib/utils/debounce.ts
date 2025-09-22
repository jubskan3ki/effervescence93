// src/lib/utils/debounce.ts

/**
 * Debounce and throttle utilities for performance optimization
 */

/**
 * Debounce: Delays function execution until after wait milliseconds
 * have elapsed since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	wait: number,
	options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: Parameters<T> | undefined;
	let lastThis: any;
	let lastCallTime: number | undefined;
	let lastInvokeTime = 0;
	const leading = options?.leading ?? false;
	const trailing = options?.trailing ?? true;
	const maxWait = options?.maxWait;

	const invokeFunc = (time: number) => {
		const args = lastArgs;
		const thisArg = lastThis;

		lastArgs = lastThis = undefined;
		lastInvokeTime = time;

		if (args) {
			fn.apply(thisArg, args);
		}
	};

	const leadingEdge = (time: number) => {
		lastInvokeTime = time;
		timeout = setTimeout(timerExpired, wait);
		return leading ? invokeFunc(time) : undefined;
	};

	const timerExpired = () => {
		const time = Date.now();

		if (shouldInvoke(time)) {
			return trailingEdge(time);
		}

		timeout = setTimeout(timerExpired, remainingWait(time));
	};

	const trailingEdge = (time: number) => {
		timeout = undefined;

		if (trailing && lastArgs) {
			return invokeFunc(time);
		}

		lastArgs = lastThis = undefined;
	};

	const shouldInvoke = (time: number) => {
		const timeSinceLastCall = lastCallTime === undefined ? 0 : time - lastCallTime;
		const timeSinceLastInvoke = time - lastInvokeTime;

		return (
			lastCallTime === undefined ||
			timeSinceLastCall >= wait ||
			timeSinceLastCall < 0 ||
			(maxWait !== undefined && timeSinceLastInvoke >= maxWait)
		);
	};

	const remainingWait = (time: number) => {
		const timeSinceLastCall = time - (lastCallTime ?? 0);
		const timeSinceLastInvoke = time - lastInvokeTime;
		const timeWaiting = wait - timeSinceLastCall;

		return maxWait !== undefined ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
	};

	const debounced = function (this: any, ...args: Parameters<T>) {
		const time = Date.now();
		const isInvoking = shouldInvoke(time);

		lastArgs = args;
		lastThis = this;
		lastCallTime = time;

		if (isInvoking) {
			if (timeout === undefined) {
				return leadingEdge(lastCallTime);
			}

			if (maxWait !== undefined) {
				timeout = setTimeout(timerExpired, wait);
				return invokeFunc(lastCallTime);
			}
		}

		if (timeout === undefined) {
			timeout = setTimeout(timerExpired, wait);
		}
	};

	// Add cancel method
	(debounced as any).cancel = () => {
		if (timeout !== undefined) {
			clearTimeout(timeout);
		}
		lastInvokeTime = 0;
		lastArgs = lastCallTime = lastThis = timeout = undefined;
	};

	// Add flush method
	(debounced as any).flush = () => {
		return timeout === undefined ? undefined : trailingEdge(Date.now());
	};

	// Add pending method
	(debounced as any).pending = () => {
		return timeout !== undefined;
	};

	return debounced;
}

/**
 * Throttle: Ensures function is called at most once per wait milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
	fn: T,
	wait: number,
	options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void {
	let lastCallTime = 0;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: Parameters<T> | undefined;
	let lastThis: any;

	const leading = options?.leading ?? true;
	const trailing = options?.trailing ?? true;

	const throttled = function (this: any, ...args: Parameters<T>) {
		const now = Date.now();

		if (!lastCallTime && !leading) {
			lastCallTime = now;
		}

		const remaining = wait - (now - lastCallTime);

		lastArgs = args;
		lastThis = this;

		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = undefined;
			}
			lastCallTime = now;
			fn.apply(lastThis, lastArgs);
			lastArgs = lastThis = undefined;
		} else if (!timeout && trailing) {
			timeout = setTimeout(() => {
				lastCallTime = leading ? Date.now() : 0;
				timeout = undefined;
				if (lastArgs) {
					fn.apply(lastThis, lastArgs);
					lastArgs = lastThis = undefined;
				}
			}, remaining);
		}
	};

	// Add cancel method
	(throttled as any).cancel = () => {
		if (timeout) {
			clearTimeout(timeout);
		}
		lastCallTime = 0;
		timeout = lastArgs = lastThis = undefined;
	};

	return throttled;
}

/**
 * Simple debounce for common use cases
 */
export function simpleDebounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;

	return function (...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

/**
 * Simple throttle for common use cases
 */
export function simpleThrottle<T extends (...args: any[]) => any>(
	fn: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle = false;

	return function (...args: Parameters<T>) {
		if (!inThrottle) {
			fn(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}

/**
 * Request animation frame throttle
 */
export function rafThrottle<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => void {
	let rafId: number | null = null;
	let lastArgs: Parameters<T> | null = null;

	const throttled = function (...args: Parameters<T>) {
		lastArgs = args;

		if (rafId === null) {
			rafId = requestAnimationFrame(() => {
				if (lastArgs) {
					fn(...lastArgs);
				}
				rafId = null;
			});
		}
	};

	(throttled as any).cancel = () => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		lastArgs = null;
	};

	return throttled;
}
