declare var require: any
import {
	DropTargetHookSpec,
	ConnectDropTarget,
	DragObjectWithType,
} from '../interfaces'
import { useMonitorOutput } from './internal/useMonitorOutput'
import { useDropHandler, useDropTargetMonitor } from './internal/drop'
import { useEffect, useRef, useMemo } from 'react'
const invariant = require('invariant')

/**
 * useDropTarget Hook (This API is experimental and subject to breaking changes in non-breaking versions)
 * @param spec The drop target specification
 */
export function useDrop<
	DragObject extends DragObjectWithType,
	DropResult,
	CollectedProps
>(
	spec: DropTargetHookSpec<DragObject, DropResult, CollectedProps>,
): [CollectedProps, ConnectDropTarget] {
	const specRef = useRef(spec)
	invariant(spec.accept != null, 'accept must be defined')

	const [monitor, connector] = useDropTargetMonitor()
	useDropHandler(specRef, monitor, connector)

	const result: CollectedProps = useMonitorOutput(
		monitor,
		specRef.current.collect || (() => ({} as CollectedProps)),
		() => connector.reconnect(),
	)

	const connectDropTarget = useMemo(() => connector.hooks.dropTarget(), [
		connector,
	])

	useEffect(() => {
		connector.dropTargetOptions = spec.options || null
		connector.reconnect()
	}, [spec.options])
	return [result, connectDropTarget]
}
