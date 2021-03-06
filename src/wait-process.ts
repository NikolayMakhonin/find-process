import {ps, psTree, TProcess, TProcessTree} from '@flemist/ps-cross-platform'
import {waitRepeat} from './wait'

export type TWaitProcessListPredicate = (processList: TProcess[]) => boolean

export function waitProcessList({
	description,
	checkInterval,
	timeout,
	predicate,
}: {
	/** For error messages */
	description?: string,
	checkInterval: number,
	timeout?: number,
	predicate: TWaitProcessListPredicate,
}): Promise<TProcess[]> {
	return waitRepeat({
		description: 'waitProcessList' + (description ? ', ' + description : ''),
		timeout,
		delay      : checkInterval,
		func() {
			return ps()
		},
		predicate,
	})
}

export type TWaitProcessTreePredicate = (processTree: TProcessTree) => boolean

export function waitProcessTree({
	description,
	checkInterval,
	timeout,
	predicate,
}: {
	/** For error messages */
	description?: string,
	checkInterval: number,
	timeout?: number,
	predicate: TWaitProcessTreePredicate,
}): Promise<TProcessTree> {
	return waitRepeat({
		description: 'waitProcessTree' + (description ? ', ' + description : ''),
		timeout,
		delay      : checkInterval,
		func() {
			return psTree()
		},
		predicate,
	})
}
