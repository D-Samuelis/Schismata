import { useState, useRef, useCallback } from 'react'
import type { ModeId } from '../config/automatonModes'

export type Status = 'idle' | 'running' | 'paused' | 'done'

export interface AutomatonState {
  id: string
  x: number
  y: number
  accept?: boolean
}

export interface AutomatonTransition {
  id: string
  source: string
  target: string
  symbol: string
}

export function useSimulation(_modeId: ModeId) {
  const [status, setStatus] = useState<Status>('idle')
  const [speed, setSpeed] = useState(5)
  const [currentState, setCurrentState] = useState<string | undefined>()
  const [startState, setStartState] = useState<string | undefined>()
  const [states, setStates] = useState<AutomatonState[]>([])
  const [transitions, setTransitions] = useState<AutomatonTransition[]>([])
  const [tape, setTape] = useState<string[]>([])
  const [head, setHead] = useState(0)
  const [input, setInput] = useState('')

  const timerRef = useRef<number | null>(null)
  const transitionCounter = useRef(0)

  // --- graph editing ---

  const addState = useCallback((id: string, position: { x: number; y: number }) => {
    setStates((prev) => [...prev, { id, x: position.x, y: position.y }])
  }, [])

  const moveState = useCallback((id: string, position: { x: number; y: number }) => {
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, x: position.x, y: position.y } : s)))
  }, [])

  const toggleAccept = useCallback((id: string) => {
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, accept: !s.accept } : s)))
  }, [])

  const renameState = useCallback((oldId: string, newId: string) => {
    setStates((prev) => prev.map((s) => (s.id === oldId ? { ...s, id: newId } : s)))
    setTransitions((prev) => prev.map((t) => ({
      ...t,
      source: t.source === oldId ? newId : t.source,
      target: t.target === oldId ? newId : t.target,
    })))
    setStartState((prev) => (prev === oldId ? newId : prev))
  }, [])

  const addTransition = useCallback((source: string, target: string) => {
    // TODO: replace prompt() with a Mantine modal for symbol entry
    const symbol = window.prompt('Transition symbol:', 'a') ?? 'a'
    const id = `t${transitionCounter.current++}`
    setTransitions((prev) => [...prev, { id, source, target, symbol }])
  }, [])

  const editTransitionSymbol = useCallback((id: string, symbol: string) => {
    setTransitions((prev) => prev.map((t) => (t.id === id ? { ...t, symbol } : t)))
  }, [])

  const deleteElement = useCallback((id: string) => {
    setStates((prev) => prev.filter((s) => s.id !== id))
    setTransitions((prev) => prev.filter((t) => t.id !== id && t.source !== id && t.target !== id))
    setStartState((prev) => (prev === id ? undefined : prev))
  }, [])

  // --- simulation playback ---

  const step = useCallback(() => {
    // TODO: pull next value from @schismata/core generator; update currentState/tape/head
  }, [])

  const play = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current) // guard against a second interval stacking up
    setStatus('running')
    timerRef.current = window.setInterval(step, 1000 / speed)
  }, [step, speed])

  const pause = useCallback(() => {
    setStatus('paused')
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setCurrentState(undefined)
    setHead(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  return {
    status, speed, setSpeed,
    currentState,
    startState, setStartState,
    states, transitions, setTransitions,
    tape, head,
    input, setInput,
    addState, moveState, toggleAccept, renameState,
    addTransition, editTransitionSymbol,
    deleteElement,
    step, play, pause, reset,
  }
}