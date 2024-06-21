import { GetterTree } from 'vuex';
import { Preset, IPreset } from './types';
import { RootState } from '../types';
import { toRaw } from 'vue';

export const getters: GetterTree<Preset, RootState> = {
  activePreset(state: Preset): IPreset {
    return state.presetList.find((t: IPreset) => t.active === true) as IPreset;
  },
  hiddenColumns(state: Preset): number[] {
    return (state.presetList.find((t: IPreset) => t.active === true) as IPreset).hiddenColumns
  },
  presets: state => state.presetList,
  freePresetName: (state: Preset) => function(newValue: string): boolean {
    const presetList = toRaw(state.presetList) as IPreset[]

    if (presetList.some((preset: IPreset) => preset.name === newValue)) {
      return false
    } 
    
    return true
  }
};