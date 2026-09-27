// apps/web/src/store/stores.ts

import { createAutomatonStore } from './createAutomatonStore'
import { DEFAULT_TM_TAPE_COUNT } from '../config/automatonModes'

export const useDfaStore = createAutomatonStore('dfa', 0)
export const useNfaStore = createAutomatonStore('nfa', 0)
export const useTmStore = createAutomatonStore('tm', DEFAULT_TM_TAPE_COUNT)