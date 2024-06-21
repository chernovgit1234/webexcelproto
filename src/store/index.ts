
import { createStore, StoreOptions   } from "vuex";
import { RootState } from '@/store/types';
import { presets } from '../store/preset/index';
import { autofilter } from '../store/autofilter';

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0',
    error: null,
    load: null,
    message: null,
    selectedColumn: null
  },
  mutations: {
    CHANGE_SELECTER_COLUMN(state, selectedColumn) {
      state.selectedColumn = selectedColumn
    }
  },
  getters: {
    error: s => s.error,
    load: s => s.load,
    message: s => s.message,
    selectedColumn: s => s.selectedColumn
  }, 
  actions: {
    selectColumn({commit}, selectedColumn: number) {
      console.log('selectColumnselectColumn', selectedColumn)
      commit('CHANGE_SELECTER_COLUMN', selectedColumn)
    }
  },
  modules: {
    presets, autofilter
  }
};
export const storage = createStore<RootState>(store)
//export default createStore<RootState>(store);