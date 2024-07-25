
import { createStore, StoreOptions   } from "vuex";
import { RootState } from '@/store/types';
import { presets } from '../store/preset/index';
import { autofilter } from '../store/autofilter';
import {ISearchByColumnMetadata} from '../types/OtherTypes'
import { EnumEmptyString } from '../enums/EnumsCommon'

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0',
    error: null,
    load: null,
    message: null,
    selectedColumn: null,
    columnSearchMetadata: {value: EnumEmptyString.EmptyStringValue, fieldName: null},
    fieldNameSearchedColumn: null,
    valueSearchedColumn: EnumEmptyString.EmptyStringValue,
    summObject: {CostField: 0}
  },
  mutations: {
    CHANGE_SELECTER_COLUMN(state, selectedColumn) {
      state.selectedColumn = selectedColumn
    },
    SET_SEARCH_METADATA(state, metadata: ISearchByColumnMetadata) {
      state.columnSearchMetadata = {value: metadata.value, fieldName: metadata.fieldName}
      state.fieldNameSearchedColumn = metadata.fieldName
      state.valueSearchedColumn = metadata.value
    },
    RESET_SEARCH(state) {
      state.columnSearchMetadata = {value: EnumEmptyString.EmptyStringValue, fieldName: null}

      state.fieldNameSearchedColumn = null
      state.valueSearchedColumn = EnumEmptyString.EmptyStringValue
    },
    SET_SUMM_OBJECT(state, summObject: any) {
      console.log('summObject', summObject)
      state.summObject = summObject
    }
  },
  getters: {
    error: s => s.error,
    load: s => s.load,
    message: s => s.message,
    selectedColumn: s => s.selectedColumn,
    columnSearchMetadata: s => s.columnSearchMetadata,
    fieldNameSearchedColumn: s => s.fieldNameSearchedColumn,
    valueSearchedColumn: s => s.valueSearchedColumn,
    summObject: s => s.summObject
  }, 
  actions: {
    selectColumn({commit}, selectedColumn: number) {
      commit('CHANGE_SELECTER_COLUMN', selectedColumn)
    },
    setSearchMetadata({commit}, metadata: any) {
      commit('SET_SEARCH_METADATA', metadata)
    },
    resetSearch({commit}) {
      commit('RESET_SEARCH')
    },
    setSummObject({commit}, summObject: any) {
      commit('SET_SUMM_OBJECT', summObject)
    },
  
  },
  modules: {
    presets, autofilter
  }
};
export const storage = createStore<RootState>(store)
//export default createStore<RootState>(store);