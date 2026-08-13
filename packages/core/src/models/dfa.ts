export interface DFA {
  states: string[];
  alphabet: string[];
  transitions: Map<string, Map<string, string>>;
  start: string;
  accept: Set<string>;
}