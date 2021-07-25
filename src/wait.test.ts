/* eslint-disable no-shadow */
import assert from 'assert'
import {waitRepeat, withTimeout} from './wait'
import {delay} from './delay'

describe('wait', function () {
	this.timeout(1000)

	it('withTimeout sync', async function () {
		const checkResult = new String('Result')
		const result = await withTimeout({
			description: 'TestDescription',
			timeout: 1,
			async func(abortSignal) {
				assert.ok(abortSignal)
				const timeStart = Date.now()
				for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
					if (Date.now() - timeStart > 10) {
						break
					}
				}
				return checkResult
			},
			abortSignal: null,
		})
		assert.strictEqual(result, checkResult)
	})

	it('withTimeout async', async function () {
		const checkResult = new String('Result')
		const result = await withTimeout({
			description: 'TestDescription',
			timeout: 10,
			async func(abortSignal) {
				assert.ok(abortSignal)
				await delay(1)
				return checkResult
			},
			abortSignal: null,
		})
		assert.strictEqual(result, checkResult)
	})

	it('withTimeout async timeout', async function () {
		await withTimeout({
			description: 'TestDescription',
			timeout: 1,
			async func(abortSignal) {
				assert.ok(abortSignal)
				await delay(100)
				return 'value'
			},
			abortSignal: null,
		})
			.then(() => {
				assert.fail('Should be error')
			})
			.catch(err => {
				assert.ok(/\bTestDescription\b/.test(err.message), err.message)
			})
	})

	it('waitRepeat sync', async function () {
		const checkResult = new String('Result')
		const result = await waitRepeat({
			description: 'TestDescription',
			timeout: 1,
			delay: 0,
			predicate(result) {
				return result === checkResult
			},
			async func(abortSignal) {
				assert.ok(abortSignal)
				const timeStart = Date.now()
				for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
					if (Date.now() - timeStart > 10) {
						break
					}
				}
				return checkResult
			},
			abortSignal: null,
		})
		assert.strictEqual(result, checkResult)
	})

	it('waitRepeat sync repeat', async function () {
		const checkResult = new String('Result')
		const timeStart = Date.now()
		const result = await waitRepeat({
			description: 'TestDescription',
			timeout: 100,
			delay: 0,
			predicate(result) {
				return result === checkResult
			},
			async func(abortSignal) {
				assert.ok(abortSignal)
				if (Date.now() - timeStart > 10) {
					return checkResult
				}
				return 'Incorrect value'
			},
			abortSignal: null,
		})
		assert.strictEqual(result, checkResult)
	})

	it('waitRepeat sync repeat timeout', async function () {
		const checkResult = new String('Result')
		const timeStart = Date.now()
		await waitRepeat({
			description: 'TestDescription',
			timeout: 1,
			delay: 0,
			predicate(result) {
				return result === checkResult
			},
			async func(abortSignal) {
				assert.ok(abortSignal)
				if (Date.now() - timeStart > 10) {
					return checkResult
				}
				return 'Incorrect value'
			},
			abortSignal: null,
		})
			.then(() => {
				assert.fail('Should be error')
			})
			.catch(err => {
				assert.ok(/\bTestDescription\b/.test(err.message), err.message)
			})
	})

	it('waitRepeat async', async function () {
		const checkResult = new String('Result')
		const result = await waitRepeat({
			description: 'TestDescription',
			timeout: 10,
			delay: 100,
			predicate(result) {
				return result === checkResult
			},
			async func(abortSignal) {
				assert.ok(abortSignal)
				await delay(1)
				return checkResult
			},
			abortSignal: null,
		})
		assert.strictEqual(result, checkResult)
	})

	it('waitRepeat async repeat', async function () {
		const checkResult = new String('Result')
		const timeStart = Date.now()
		const result = await waitRepeat({
			description: 'TestDescription',
			timeout: 100,
			delay: 10,
			predicate(result) {
				return result === checkResult
			},
			async func(abortSignal) {
				assert.ok(abortSignal)
				await delay(1)
				if (Date.now() - timeStart > 10) {
					return checkResult
				}
				return 'Incorrect value'
			},
			abortSignal: null,
		})
		assert.strictEqual(result, checkResult)
	})

	it('waitRepeat async repeat timeout', async function () {
		const checkResult = new String('Result')
		const timeStart = Date.now()
		await waitRepeat({
			description: 'TestDescription',
			timeout: 150,
			delay: 100,
			predicate(result) {
				return result === checkResult
			},
			async func(abortSignal) {
				assert.ok(abortSignal)
				await delay(1)
				if (Date.now() - timeStart > 120) {
					return checkResult
				}
				return 'Incorrect value'
			},
			abortSignal: null,
		})
			.then(() => {
				assert.fail('Should be error')
			})
			.catch(err => {
				assert.ok(/\bTestDescription\b/.test(err.message), err.message)
			})
	})
})
