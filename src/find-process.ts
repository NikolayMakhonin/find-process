import {ps, psTree, TProcess, TProcessNode, TProcessTree} from '@flemist/ps-cross-platform'

export type TFindInProcessListPredicate = (proc: TProcess, processList: TProcess[]) => boolean

export async function findInProcessList(
	predicate: TFindInProcessListPredicate,
): Promise<TProcess[]> {
	const processList = await ps()
	return processList
		.filter(proc => predicate(proc, processList))
}

export type TFindInProcessTreePredicate = (proc: TProcessNode, processTree: TProcessTree) => boolean

export async function findInProcessTree(
	predicate: TFindInProcessTreePredicate,
): Promise<TProcessNode[]> {
	const processTree = await psTree()
	return Object
		.values(processTree)
		.filter(proc => predicate(proc, processTree))
}
