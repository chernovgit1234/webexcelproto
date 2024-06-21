
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
  }
};