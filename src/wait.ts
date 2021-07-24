/* eslint-disable no-await-in-loop */
import {delay} from './delay'

type PromiseOrValue<T> = Promise<T> | T

function createCustomPromise<T>(): {
	promise: Promise<T>,
	resolve: (value: T) => void,
	reject: (reason?: any) => void,
} {
	let resolve: (value: T) => void = void 0
	let reject: (reason?: any) => void = void 0
	const promise = new Promise<T>((_resolve, _reject) => {
		resolve = _resolve
		reject = _reject
	})
	return {promise, resolve, reject}
}

function createAbortPromise<TResult>({
	abortSignal,
	abortPromiseSignal,
	getReason,
}: {
	abortSignal: AbortSignal,
	abortPromiseSignal?: AbortSignal,
	getReason: () => any,
}) {
	const {promise, reject} = createCustomPromise<TResult>()
	const onAbort = () => {
		reject(getReason())
	}
	abortSignal.addEventListener('abort', onAbort)
	if (abortPromiseSignal) {
		abortPromiseSignal.addEventListener('abort', () => {
			abortSignal.removeEventListener('abort', onAbort)
		})
	}
	return promise
}

function createTimeoutPromise<TResult>({
	timeout,
	abortPromiseSignal,
	getReason,
}: {
	/** Milliseconds */
	timeout: number,
	abortPromiseSignal?: AbortSignal,
	getReason: (timeout: number) => any,
}) {
	const {promise, reject} = createCustomPromise<TResult>()
	const onTimeout = () => {
		reject(getReason(timeout))
	}
	const timer = setTimeout(onTimeout, timeout)
	if (abortPromiseSignal) {
		abortPromiseSignal.addEventListener('abort', () => {
			clearTimeout(timer)
		})
	}
	return promise
}

export async function withTimeout<TResult>({
	description,
	timeout,
	abortSignal,
	func,
}: {
	description: string,
	/** Milliseconds */
	timeout: number,
	abortSignal?: AbortSignal,
	func: (abortSignal: AbortSignal) => Promise<TResult>,
}): Promise<TResult> {
	const internalAbortController = new AbortController()

	try {
		const abortPromise = abortSignal && createAbortPromise<TResult>({
			abortSignal,
			abortPromiseSignal: internalAbortController.signal,
			getReason() {
				return new Error(`Operation aborted: ${description}`)
			},
		})

		const timeoutPromise = timeout && createTimeoutPromise<TResult>({
			timeout,
			abortPromiseSignal: internalAbortController.signal,
			getReason(_timeout) {
				return new Error(`Timeout expired (${_timeout}): ${description}`)
			},
		})

		return await Promise.race([
			func(internalAbortController.signal),
			abortPromise,
			timeoutPromise,
		])
	} finally {
		internalAbortController.abort()
	}
}

export function waitRepeat<TResult>({
	description,
	delay: _delay,
	timeout,
	abortSignal,
	func,
	predicate,
}: {
	/** For error messages */
	description?: string,
	/** Delay after each call func and predicate */
	delay?: number,
	timeout?: number,
	abortSignal?: AbortSignal,
	func: () => PromiseOrValue<TResult>,
	predicate: (result: TResult) => PromiseOrValue<boolean>,
}): Promise<TResult> {
	return withTimeout({
		description,
		timeout,
		abortSignal,
		async func(_abortSignal) {
			while (true) {
				if (_abortSignal.aborted) {
					return null
				}
				const result = await func()
				if (await predicate(result)) {
					return result
				}
				if (_delay) {
					await delay(_delay)
				}
			}
		},
	})
}
