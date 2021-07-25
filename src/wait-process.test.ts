/* eslint-disable no-shadow */
import assert from 'assert'
import {waitProcessList, waitProcessTree} from './wait-process'
import {spawn} from "child_process"
import {delay} from './delay'

describe('wait-process', function () {
	this.timeout(10000)

	it('waitProcessList existing', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 30000)`

		let proc
		let error
		function startProc() {
			proc = spawn('node', ['-e', command], {
				windowsHide: true,
			})
			proc.on('error', err => {
				error = err
			})
		}

		startProc()

		await delay(1000)

		let result = await waitProcessList({
			description: 'TestDescription',
			timeout: 1000,
			checkInterval: 1000,
			predicate(processList) {
				return processList.some(o => o.command.indexOf(command) >= 0)
			},
		})

		assert.ok(result.some(o => o.command.indexOf(command) >= 0))

		process.kill(proc.pid, 'SIGINT')

		result = await waitProcessList({
			description: 'TestDescription',
			timeout: 1000,
			checkInterval: 1000,
			predicate(processList) {
				return processList.every(o => o.command.indexOf(command) < 0)
			},
		})

		assert.deepStrictEqual(result, [])
	})

	it('waitProcessList with delay', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 30000)`

		let proc
		let error
		function startProc() {
			proc = spawn('node', ['-e', command], {
				windowsHide: true,
			})
			proc.on('error', err => {
				error = err
			})
		}

		let result = await waitProcessList({
			description: 'TestDescription',
			timeout: 2000,
			checkInterval: 200,
			predicate(processList) {
				if (processList.some(o => o.command.indexOf(command) >= 0)) {
					return true
				}
				if (!proc) {
					startProc()
				}
				return false
			},
		})

		assert.ok(result.some(o => o.command.indexOf(command) >= 0))

		if (proc) {
			process.kill(proc.pid, 'SIGINT')
		}

		result = await waitProcessList({
			description: 'TestDescription',
			timeout: 1000,
			checkInterval: 1000,
			predicate(processList) {
				return processList.every(o => o.command.indexOf(command) < 0)
			},
		})

		assert.deepStrictEqual(result, [])
	})

	it('waitProcessList timeout', async function () {
		await waitProcessList({
			description: 'TestDescription',
			timeout: 2000,
			checkInterval: 200,
			predicate(processList) {
				return false
			},
		})
			.then(() => {
				assert.fail('Should be error')
			})
			.catch(err => {
				assert.ok(/\bTestDescription\b/.test(err.message), err.message)
			})
	})

	it('waitProcessTree existing', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 30000)`

		let proc
		let error
		function startProc() {
			proc = spawn('node', ['-e', command], {
				windowsHide: true,
			})
			proc.on('error', err => {
				error = err
			})
		}

		startProc()

		await delay(1000)

		let result = await waitProcessTree({
			description: 'TestDescription',
			timeout: 1000,
			checkInterval: 1000,
			predicate(processTree) {
				return Object.values(processTree).some(o => o.command.indexOf(command) >= 0)
			},
		})

		assert.ok(Object.values(result).some(o => o.command.indexOf(command) >= 0))

		if (proc) {
			process.kill(proc.pid, 'SIGINT')
		}

		result = await waitProcessTree({
			description: 'TestDescription',
			timeout: 1000,
			checkInterval: 1000,
			predicate(processTree) {
				return Object.values(processTree).every(o => o.command.indexOf(command) < 0)
			},
		})

		assert.deepStrictEqual(result, [])
	})

	it('waitProcessTree with delay', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 30000)`

		let proc
		let error
		function startProc() {
			proc = spawn('node', ['-e', command], {
				windowsHide: true,
			})
			proc.on('error', err => {
				error = err
			})
		}

		let result = await waitProcessTree({
			description: 'TestDescription',
			timeout: 2000,
			checkInterval: 200,
			predicate(processTree) {
				if (Object.values(processTree).some(o => o.command.indexOf(command) >= 0)) {
					return true
				}
				if (!proc) {
					startProc()
				}
				return false
			},
		})

		assert.ok(Object.values(result).some(o => o.command.indexOf(command) >= 0))

		if (proc) {
			process.kill(proc.pid, 'SIGINT')
		}

		result = await waitProcessTree({
			description: 'TestDescription',
			timeout: 1000,
			checkInterval: 1000,
			predicate(processTree) {
				return Object.values(processTree).every(o => o.command.indexOf(command) < 0)
			},
		})

		assert.deepStrictEqual(result, [])
	})

	it('waitProcessTree timeout', async function () {
		await waitProcessTree({
			description: 'TestDescription',
			timeout: 2000,
			checkInterval: 200,
			predicate(processTree) {
				return false
			},
		})
			.then(() => {
				assert.fail('Should be error')
			})
			.catch(err => {
				assert.ok(/\bTestDescription\b/.test(err.message), err.message)
			})
	})
})
