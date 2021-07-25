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
				detached: true,
				stdio: 'ignore',
				windowsHide: true,
			})
			proc.unref()
			// proc.on('error', err => {
			// 	error = err
			// })
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
		assert.ok(result[0].command.indexOf(command) >= 0)
		assert.strictEqual(result[0].pid, proc.pid)

		process.kill(proc.pid, 'SIGINT')
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
				detached: true,
				stdio: 'ignore',
				windowsHide: true,
			})
			proc.unref()
			// proc.on('error', err => {
			// 	error = err
			// })
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
		assert.ok(result[0].command.indexOf(command) >= 0)
		assert.strictEqual(result[0].pid, proc.pid)

		process.kill(proc.pid, 'SIGINT')
		await delay(1000)

		result = await findInProcessTree((proc, processTree) => {
			assert.ok(processTree)
			assert.strictEqual(processTree[proc.pid], proc)
			return proc.command.indexOf(command) >= 0
		})
		assert.deepStrictEqual(result, [])
	})
})
