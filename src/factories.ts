import {TFindInProcessTreePredicate} from './find-process'
import {TProcessIdentity, TProcessNode, TProcessTree} from '@flemist/ps-cross-platform'
import {processEquals} from './processEquals'

export type TProcessTreeFilter = (
	processTree: TProcessTree,
) => TProcessTree

export type TProcessTreeFilterArgs = {
	parents?: TProcessIdentity[],
	parentsPredicate?: TFindInProcessTreePredicate,
	includeParents?: boolean
	includeChilds?: boolean
}

export function createProcessTreeFilterByPredicate(predicate: TFindInProcessTreePredicate) {
	return function _processTreeFilterByPredicate(
		processTree: TProcessTree,
	): TProcessTree {
		return Object.values(processTree).reduce((result, proc) => {
			const foundProc = processTree[proc.pid]
			if (processEquals(foundProc, proc) && predicate(foundProc, processTree)) {
				result[proc.pid] = proc
			}
			return result
		}, {} as TProcessTree)
	}
}

export function getProcessesChilds(
	parents: TProcessTree,
	processTree: TProcessTree,
): TProcessTree {
	const childProcesses: TProcessTree = {}

	Object.values(parents).reduce((result, proc) => {
		proc.allChildIds.forEach(childPid => {
			if (!parents[childPid]) {
				childProcesses[childPid] = processTree[childPid]
			}
		})
		return result
	}, {} as TProcessTree)

	return childProcesses
}

export function createProcessesPredicate(processes: TProcessIdentity[]): TFindInProcessTreePredicate {
	const processesMap: {
		[pid: number]: TProcessIdentity,
	} = processes.reduce((a, o) => {
		a[o.pid] = o
		return a
	}, {})

	return (proc: TProcessNode) => {
		const foundProc = processesMap[proc.pid]
		return foundProc && processEquals(foundProc, proc)
	}
}

export function createProcessTreeFilter({
	parents,
	parentsPredicate,
	includeParents,
	includeChilds,
}: TProcessTreeFilterArgs): TProcessTreeFilter {
	const patentsProcessesPredicate = parents && createProcessesPredicate(parents)

	const filterParents = createProcessTreeFilterByPredicate((proc, processTree) => {
		return patentsProcessesPredicate && patentsProcessesPredicate(proc, processTree)
			|| parentsPredicate && parentsPredicate(proc, processTree)
	})

	return function _processTreeFilter(
		processTree: TProcessTree,
	): TProcessTree {
		const foundParents = filterParents(processTree)

		const filteredProcesses = {}
		if (foundParents) {
			if (includeParents) {
				Object.assign<TProcessTree, TProcessTree>(filteredProcesses, foundParents)
			}
			if (includeChilds) {
				const foundChilds = getProcessesChilds(foundParents, processTree)
				Object.assign<TProcessTree, TProcessTree>(filteredProcesses, foundChilds)
			}
		}

		return filteredProcesses
	}
}
