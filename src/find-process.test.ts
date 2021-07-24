/* eslint-disable no-shadow */
import assert from 'assert'
import {findInProcessList, findInProcessTree} from './find-process'
import {spawn} from "child_process"
import {delay} from './delay'

describe('find-process', function () {
	this.timeout(10000)

	it('findInProcessList', async function () {
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

		let result = await findInProcessList((proc, processList) => {
			assert.ok(processList)
			assert.ok(processList.indexOf(proc) >= 0)
			return proc.command.indexOf(command) >= 0
		})
		assert.deepStrictEqual(result, [])

		startProc()
		await delay(1000)

		result = await findInProcessList((proc, processList) => {
			assert.ok(processList)
			assert.ok(processList.indexOf(proc) >= 0)
			return proc.command.indexOf(command) >= 0
		})
		assert.strictEqual(result.length, 1)
		result.forEach(proc => {
			assert.ok(proc.command.indexOf(command) >= 0)
		})

		process.kill(proc.pid, 'SIGKILL')
		await delay(1000)

		result = await findInProcessList((proc, processList) => {
			assert.ok(processList)
			assert.ok(processList.indexOf(proc) >= 0)
			return proc.command.indexOf(command) >= 0
		})
		assert.deepStrictEqual(result, [])
	})

	it('findInProcessTree', async function () {
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

		let result = await findInProcessTree((proc, processTree) => {
			assert.ok(processTree)
			assert.strictEqual(processTree[proc.pid], proc)
			return proc.command.indexOf(command) >= 0
		})
		assert.deepStrictEqual(result, [])

		startProc()
		await delay(1000)

		result = await findInProcessTree((proc, processTree) => {
			assert.ok(processTree)
			assert.strictEqual(processTree[proc.pid], proc)
			return proc.command.indexOf(command) >= 0
		})
		assert.strictEqual(result.length, 1)
		result.forEach(proc => {
			assert.ok(proc.command.indexOf(command) >= 0)
		})

		process.kill(proc.pid, 'SIGKILL')
		await delay(1000)

		result = await findInProcessTree((proc, processTree) => {
			assert.ok(processTree)
			assert.strictEqual(processTree[proc.pid], proc)
			return proc.command.indexOf(command) >= 0
		})
		assert.deepStrictEqual(result, [])
	})
})
