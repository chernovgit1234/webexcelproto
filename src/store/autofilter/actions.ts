
import { ActionTree } from 'vuex';
import { Autofilter } from './types';
import { RootState } from '../types';

export const actions: ActionTree<Autofilter, RootState> = {
  
  initAutofilter({commit}, data: any[]) {
    commit('INIT_AUTOFILTER', data)
  },
  updateAutofilter({commit}, data) {
    commit('UPDATE_AUTOFILTER', data)
  },
  disallowCloseableAutofilter({commit}) {
    commit('DISALLOW_CLOSEABLE_AUTOFILTER')
  },
  allowCloseableAutofilter({commit}) {
    commit('ALLOW_CLOSEABLE_AUTOFILTER')
  },
  updateObjectAutofilter({commit}, newObjectAutofilter: any) {
    commit('UPDATE_OBJECT_AUTOFILTER', newObjectAutofilter)
  },
  addGlobalFilter({commit}, nameFilter: string) {
    commit('ADD_GLOBAL_FILTER', nameFilter)
  },
  deactivatedAutofilters({commit}) {
    commit('DEACTIVATED_FILTERS')
  },
  changeNameActiveFastFilter({commit}, nameFilter: string) {
    commit('CHANGE_NAME_ACTIVE_FAST_FILTER', nameFilter)
  },
  deactivatedFastFilter({commit}) {
    commit('DEACTIVATED_FAST_FILTER')
  },
};