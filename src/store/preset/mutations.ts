import { MutationTree } from 'vuex';
import { Preset } from './types';
import { IPreset } from './types';
import { toRaw } from 'vue';

export const mutations: MutationTree<Preset> = {

  UPDATE_PRESET(state: Preset, presetUpdated: IPreset) {
    
    const presets =  [...state.presetList]
    const idx: number = presets.findIndex((preset: IPreset) => preset.id === presetUpdated.id)
    state.presetList[idx] = presetUpdated
  },
  CREATE_PRESET(state: Preset, preset: IPreset) {
    
    state.presetList.push(preset)
  },
  USE_PRESET(state: Preset, {idPreset, activePreset}) {
    //если пресет активный
    if (activePreset === true) {
      state.presetList.forEach((preset: IPreset) => {
        //пресет по умолчанию будет активным
        preset.isDefault === true ? preset.active = true : preset.active = false
      })
    } else {
      // все пресеты делать неактивными, а выбранный сделать активным
      state.presetList.forEach((preset: IPreset) => {
        preset.active = false
      })

      const presets =  [...state.presetList]
      const idxPresetChanged: number = presets.findIndex((preset: IPreset) => preset.id === idPreset)
      const presetChanged: IPreset = presets.find((preset: IPreset) => preset.id === idPreset) as IPreset
      presetChanged.active = true
      
      state.presetList[idxPresetChanged] = presetChanged
      state.presetList.splice(idxPresetChanged, 1)
      state.presetList.unshift(presetChanged)
    }
  },
  DELETE_PRESET(state: Preset, idPreset: string) {
    
    const presets =  [...state.presetList]
    const idxPresetChanged: number = presets.findIndex((preset: IPreset) => preset.id === idPreset)
    
    if (state.presetList.length === 2) {
      const defaultPreset: IPreset = presets.find((preset: IPreset) => preset.isDefault === true) as IPreset
      defaultPreset.active = true
    }

    state.presetList.splice(idxPresetChanged, 1)
  },
  UPDATE_HIDDEN_COLUMNS_FOR_ACTIVE_PRESET(state: Preset, hiddenColumns: number[]) {
    //обновление скрытых колонок для активного пресета
    const presets =  [...state.presetList]
    const idxActivePreset: number = presets.findIndex((preset: IPreset) => preset.active === true)
    state.presetList[idxActivePreset].hiddenColumns = [...state.presetList[idxActivePreset].hiddenColumns, ...hiddenColumns]
  },
  UPDATE_SHOWED_COLUMNS_FOR_ACTIVE_PRESET(state: Preset, showedColumns: number[]) {
    //обновление отображенных колонок для активного пресета
    const presets =  [...state.presetList]
    const idxActivePreset: number = presets.findIndex((preset: IPreset) => preset.active === true)
    state.presetList[idxActivePreset].hiddenColumns = state.presetList[idxActivePreset].hiddenColumns.map((colMap: number) => {
      if (showedColumns.some((colSome: number) => colSome === colMap)) {
        return 
      } else {
        return colMap
      }
    }).filter(el => el) as any[]
  }
};