import {IAutofilter} from '../../types/AutofilterTypes'

export interface Autofilter {
  autofilterList: Map<number, IAutofilter>;
  closeableAutofilter: boolean,
  fastFilters: Map<string, Map<number | string, IAutofilter>>,
  nameActiveFastFilter: string
}