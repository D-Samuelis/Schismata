import { useEffect, useRef } from 'react'
import cytoscape, { type Core, type EventObject } from 'cytoscape'
// @ts-expect-error cytoscape-edgehandles ships no TS declarations
import edgehandles from 'cytoscape-edgehandles'
import type { AutomatonState, AutomatonTransition } from '../../hooks/useSimulation'

interface EdgeHandlesInstance {
  start: (node: cytoscape.NodeSingular) => void
}

cytoscape.use(edgehandles)

interface AutomatonGraphProps {
  states: AutomatonState[]
  transitions: AutomatonTransition[]
  activeState?: string
  startState?: string
  onAddState: (id: string, position: { x: number; y: number }) => void
  onMoveState: (id: string, position: { x: number; y: number }) => void
  onAddTransition: (source: string, target: string) => void
  onToggleAccept: (id: string) => void
  onContextMenu: (id: string, kind: 'node' | 'edge', x: number, y: number) => void
}

export function AutomatonGraph({
  states, transitions, activeState, startState,
  onAddState, onMoveState, onAddTransition, onToggleAccept, onContextMenu,
}: AutomatonGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const ehRef = useRef<EdgeHandlesInstance | null>(null)
  const stateCounter = useRef(0)

  // stash latest callbacks so the one-time listeners below never close over stale props
  const cb = useRef({ onAddState, onMoveState, onAddTransition, onToggleAccept, onContextMenu })
  useEffect(() => {
    cb.current = { onAddState, onMoveState, onAddTransition, onToggleAccept, onContextMenu }
  })

  useEffect(() => {
    if (!containerRef.current) return
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        { selector: 'node', style: { label: 'data(id)', 'background-color': '#aa3bff' } },
        { selector: 'node.accept', style: { 'border-width': 3, 'border-color': '#08060d' } },
        { selector: 'node.start', style: { 'border-width': 3, 'border-color': '#2ecc71' } },
        { selector: 'node.active', style: { 'background-color': '#08060d' } },
        { selector: 'edge', style: { label: 'data(label)', 'curve-style': 'bezier', 'target-arrow-shape': 'triangle' } },
      ],
    })
    cyRef.current = cy
    ehRef.current = (cy as Core & { edgehandles: (o: object) => EdgeHandlesInstance }).edgehandles({})

    cy.on('tap', (evt) => {
      if (evt.target !== cy) return
      const id = `q${stateCounter.current++}`
      cb.current.onAddState(id, evt.position)
    })

    cy.on('dbltap', 'node', (evt) => cb.current.onToggleAccept(evt.target.id()))

    cy.on('cxttap', 'node, edge', (evt) => {
      evt.preventDefault?.()
      const oe = evt.originalEvent as MouseEvent
      cb.current.onContextMenu(evt.target.id(), evt.target.isNode() ? 'node' : 'edge', oe.clientX, oe.clientY)
    })

    cy.on('dragfree', 'node', (evt) => {
      const p = evt.target.position()
      cb.current.onMoveState(evt.target.id(), { x: p.x, y: p.y })
    })

    cy.on('ehcomplete', (evt: EventObject) => {
      const edge = evt.target
      cb.current.onAddTransition(edge.source().id(), edge.target().id())
      edge.remove() // real edge re-added once parent state updates and the sync effect below runs
    })

    return () => cy.destroy()
  }, [])

  // states/transitions are the single source of truth; re-sync on every change
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().remove()
    cy.add(states.map((s) => ({
      data: { id: s.id },
      position: { x: s.x, y: s.y },
      classes: [s.accept ? 'accept' : '', s.id === startState ? 'start' : ''].filter(Boolean).join(' '),
    })))
    cy.add(transitions.map((t) => ({ data: { id: t.id, source: t.source, target: t.target, label: t.symbol } })))
  }, [states, transitions, startState])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.nodes().removeClass('active')
    if (activeState) cy.getElementById(activeState).addClass('active')
  }, [activeState])

  return <div ref={containerRef} style={{ height: '100%', minHeight: 500, width: '100%', border: '1px solid var(--mantine-color-gray-3)' }} />
}