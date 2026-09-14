import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { Stack, ScrollArea } from '@mantine/core'
import { AUTOMATON_MODES, type ModeId } from '../config/automatonModes'
import { AutomatonGraph } from '../components/AutomatonGraph/AutomatonGraph'
import { StateContextMenu } from '../components/AutomatonGraph/StateContextMenu'
import { FormalDefinition } from '../components/FormalDefinition/FormalDefinition'
import { TransitionTable } from '../components/TransitionTable/TransitionTable'
import { TapeView } from '../components/TapeView/TapeView'
import { SimulationControls } from '../components/SimulationControls/SimulationControls'
import { useSimulation } from '../hooks/useSimulation'

export default function Workspace() {
  const { mode = 'dfa' } = useParams<{ mode: ModeId }>()
  const config = AUTOMATON_MODES[mode as ModeId]
  const sim = useSimulation(mode as ModeId)

  const [menu, setMenu] = useState<{ id: string; kind: 'node' | 'edge'; x: number; y: number } | null>(null)

  const asidePortal = document.getElementById('aside-portal')
  const footerPortal = document.getElementById('footer-portal')

  return (
    <Stack h="100%" gap="xs">
      <AutomatonGraph
        states={sim.states}
        transitions={sim.transitions}
        activeState={sim.currentState}
        startState={sim.startState}
        onAddState={sim.addState}
        onMoveState={sim.moveState}
        onAddTransition={sim.addTransition}
        onToggleAccept={sim.toggleAccept}
        onContextMenu={(id, kind, x, y) => setMenu({ id, kind, x, y })}
      />
      {config.usesTape && <TapeView tape={sim.tape} head={sim.head} />}

      {menu && (
        <StateContextMenu
          {...menu}
          onClose={() => setMenu(null)}
          onSetStart={() => sim.setStartState(menu.id)}
          onToggleAccept={() => sim.toggleAccept(menu.id)}
          onRename={() => {
            const next = window.prompt('New name:', menu.id)
            if (next) sim.renameState(menu.id, next)
          }}
          onDelete={() => sim.deleteElement(menu.id)}
        />
      )}

      {asidePortal && createPortal(
        <ScrollArea h="100%">
          <Stack gap="lg">
            <FormalDefinition states={sim.states} transitions={sim.transitions} startState={sim.startState} />
            <TransitionTable
              states={sim.states}
              transitions={sim.transitions}
              onRenameState={sim.renameState}
              onDeleteState={sim.deleteElement}
              onEditSymbol={sim.editTransitionSymbol}
              onDeleteTransition={sim.deleteElement}
            />
          </Stack>
        </ScrollArea>,
        asidePortal,
      )}

      {footerPortal && createPortal(
        <SimulationControls
          status={sim.status}
          input={sim.input}
          onInputChange={sim.setInput}
          onStep={sim.step}
          onPlay={sim.play}
          onPause={sim.pause}
          onReset={sim.reset}
          speed={sim.speed}
          onSpeedChange={sim.setSpeed}
        />,
        footerPortal,
      )}
    </Stack>
  )
}