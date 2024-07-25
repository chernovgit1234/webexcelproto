
import { ActionTree } from 'vuex';
import {  Preset } from './types';
import { RootState } from '../types';
import { IPreset } from './types';

export const actions: ActionTree<Preset, RootState> = {
    
  applySettingPreset({commit}, preset: IPreset) {
    commit('UPDATE_PRESET', preset)
  },
  createPreset({commit}, preset: IPreset) {
    commit('CREATE_PRESET', preset)
  },
  usePreset({commit}, {idPreset, activePreset}) {
    commit('USE_PRESET', {idPreset, activePreset})
  },
  deletePreset({commit}, idPreset) {
    commit('DELETE_PRESET', idPreset)
  },
  updateHiddenColumnsForActivePreset({commit}, hiddenColumns: number[]) {
    commit('UPDATE_HIDDEN_COLUMNS_FOR_ACTIVE_PRESET', hiddenColumns)
  },
  updateShowedColumnsForActivePreset({commit}, showedColumns: number[]) {
    commit('UPDATE_SHOWED_COLUMNS_FOR_ACTIVE_PRESET', showedColumns)
  }
};