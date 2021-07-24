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
			proc = spawn('node', ['-e', command])
			proc.on('error', err => {
				error = err
			})
		}

		startProc()

		await delay(1000)

		const result = await waitProcessList({
			description: 'TestDescription',
			timeout: 1000,
			checkInterval: 1000,
			predicate(processList) {
				return processList.some(o => o.command.indexOf(command) >= 0)
			},
		})

		assert.ok(result.some(o => o.command.indexOf(command) >= 0))

		if (proc) {
			process.kill(proc.pid, 'SIGKILL')
			await delay(1000)
		}
	})

	it('waitProcessList with delay', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 30000)`

		let proc
		let error
		function startProc() {
			proc = spawn('node', ['-e', command])
			proc.on('error', err => {
				error = err
			})
		}

		const result = await waitProcessList({
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
			process.kill(proc.pid, 'SIGKILL')
			await delay(1000)
		}
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
})
