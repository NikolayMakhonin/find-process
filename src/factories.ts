import {TFindInProcessTreePredicate} from './find-process'
import {TProcessIdentity, TProcessNode, TProcessTree} from '@flemist/ps-cross-platform'
import {processEquals} from './processEquals'

export type TProcessTreeFilter = (
	processTree: TProcessTree,
	prevProcessTree: TProcessTree,
) => TProcessTree

export type TFindInFilterPredicate = (
	proc: TProcessNode,
	processTree: TProcessTree,
	prevProcessTree: TProcessTree,
) => boolean

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
		prevProcessTree: TProcessTree,
	): TProcessTree {
		return Object.values(processTree).reduce((result, proc) => {
			const foundProc = processTree[proc.pid]
			if (processEquals(foundProc, proc) && predicate(foundProc, processTree, prevProcessTree)) {
				result[proc.pid] = proc
			}
			return result
		}, {} as TProcessTree)
	}
}

export const processTreeFilterOpened = createProcessTreeFilterByPredicate(proc => !proc.closed)

export function getProcessesChilds(
	parents: TProcessTree,
	processTree: TProcessTree,
): TProcessTree {
	return Object.values(parents).reduce((result, proc) => {
		proc.allChildIds.forEach(childPid => {
			if (!parents[childPid]) {
				const foundProc = processTree[childPid]
				if (foundProc) {
					result[childPid] = foundProc
				}
			}
		})
		return result
	}, {} as TProcessTree)
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
	const patentsPidsPredicate = parentsPids && createProcessesPidsPredicate(parentsPids)
	const patentsProcsPredicate = parentsProcs && createProcessesPredicate(parentsProcs)

	const filterParents = createProcessTreeFilterByPredicate((proc, processTree, prevProcessTree) => {
		return patentsPidsPredicate && patentsPidsPredicate(proc, processTree)
			|| patentsProcsPredicate && patentsProcsPredicate(proc, processTree)
			|| parentsPredicate && parentsPredicate(proc, processTree, prevProcessTree)
	})

	return function _processTreeFilter(
		processTree: TProcessTree,
		prevProcessTree: TProcessTree,
	): TProcessTree {
		const foundParents = filterParents(processTree, prevProcessTree)

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
