import {TProcessIdentity} from '@flemist/ps-cross-platform'

export function processEquals(p1: TProcessIdentity, p2: TProcessIdentity) {
	if (p1 === p2) {
		return true
	}
	if (p1 == null && p2 == null) {
		return true
	}
	if (p1 == null || p2 == null) {
		return false
	}
	return p1.pid === p2.pid
		&& p1.command === p2.command
}
