import {ps, psTree, TProcess, TProcessTree} from '@flemist/ps-cross-platform'
import {waitRepeat} from './wait'

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
	predicate: (processList: TProcess[]) => boolean,
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
	predicate: (processTree: TProcessTree) => boolean,
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
