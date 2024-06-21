import { GetterTree } from 'vuex';
import { Autofilter } from './types';
import {IAutofilter} from '../../types/AutofilterTypes'
import { RootState } from '../types';
import { toRaw } from 'vue';
import {EnumEmptyString} from '../../types/OtherTypes'

export const getters: GetterTree<Autofilter, RootState> = {
    appliedAutofilterByColNum: state => function(colNum: number): boolean {
      return (toRaw(state.autofilterList.get(colNum)) as IAutofilter).applied
    },
    autofilterByColNum: state => function(colNum: number): IAutofilter {
      return (toRaw(state.autofilterList.get(colNum)) as IAutofilter)
    },
    closeableAutofilter: s => s.closeableAutofilter,
    autofilterList: s => s.autofilterList,
   
    thereIsActiveFilters(state): boolean {
       
        for (const elFilter of toRaw(state.autofilterList.values()) ) {
          if (elFilter.applied === true) {
            return true
          }
        }

        return false
    },
    
    freeFastFilterName: (state: Autofilter) => function(newFilterName: string): boolean {
      
      for (const nameFilter of state.fastFilters.keys()) {
        if (nameFilter === newFilterName) {
          return false
        }
      }
      
      return true
    },
    fastFilterNames: s => Array.from(s.fastFilters.keys()),
    fastFilterByName: state => function(nameFilter: string): Map<number | string, IAutofilter> {
      return state.fastFilters.get(nameFilter) as Map<number | string, IAutofilter>
    },
    thereIsAnActiveFastFilter: s => s.nameActiveFastFilter !== EnumEmptyString.EmptyStringValue
};