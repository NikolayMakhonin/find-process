import {TFindInProcessTreePredicate} from './find-process'
import {TProcessIdentity, TProcessNode, TProcessTree} from '@flemist/ps-cross-platform'
import {processEquals} from './processEquals'

export type TProcessTreeFilter = (
	processTree: TProcessTree,
	first: boolean,
) => TProcessTree

export type TFindInFilterPredicate = (proc: TProcessNode, processTree: TProcessTree, firstFilter: boolean) => boolean

export type TProcessTreeFilterArgs = {
	parentsPids?: number[],
	parentsProcs?: TProcessIdentity[],
	parentsPredicate?: TFindInFilterPredicate,
	includeParents?: boolean
	includeChilds?: boolean
}

export function createProcessTreeFilterByPredicate(predicate: TFindInFilterPredicate): TProcessTreeFilter {
	return function _processTreeFilterByPredicate(
		processTree: TProcessTree,
		firstFilter: boolean,
	): TProcessTree {
		return Object.values(processTree).reduce((result, proc) => {
			const foundProc = processTree[proc.pid]
			if (processEquals(foundProc, proc) && predicate(foundProc, processTree, firstFilter)) {
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

export function createProcessesPidsPredicate(pids: number[]): TFindInProcessTreePredicate {
	const pidsMap: {
		[pid: number]: true,
	} = pids.reduce((a, o) => {
		a[o] = true
		return a
	}, {})

	return (proc: TProcessNode) => {
		return pidsMap[proc.pid]
	}
}

export function createProcessTreeFilter({
	parentsPids,
	parentsProcs,
	parentsPredicate,
	includeParents,
	includeChilds,
}: TProcessTreeFilterArgs): TProcessTreeFilter {
	// if (parentsPids && parentsPids.length > 0) {
	// 	const processTree = await psTree()
	// 	if (!parentsProcs) {
	// 		parentsProcs = []
	// 	}
	// 	parentsPids.forEach(pid => {
	// 		const proc = processTree[pid]
	// 		if (proc) {
	// 			parentsProcs.push(proc)
	// 		}
	// 	})
	// }

	const patentsPidsPredicate = parentsPids && createProcessesPidsPredicate(parentsPids)
	const patentsProcsPredicate = parentsProcs && createProcessesPredicate(parentsProcs)

	const filterParents = createProcessTreeFilterByPredicate((proc, processTree, firstFilter) => {
		return firstFilter && patentsPidsPredicate && patentsPidsPredicate(proc, processTree)
			|| patentsProcsPredicate && patentsProcsPredicate(proc, processTree)
			|| parentsPredicate && parentsPredicate(proc, processTree, firstFilter)
	})

	return function _processTreeFilter(
		processTree: TProcessTree,
		firstFilter: boolean,
	): TProcessTree {
		const foundParents = filterParents(processTree, firstFilter)

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
