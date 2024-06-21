import { Module } from 'vuex';
import { Preset } from './types';
import { RootState } from '../types';
import { getters } from './getters';
import { mutations } from './mutations';
import { actions } from './actions';

const state: Preset = {
    presetList: [
        {
            id: '9661240f-faab-4279-b99c-ed3d88202d33',
            name: 'По умолчанию',
            hiddenColumns: [],
            active: true,
            userId: '9789bd2d-5a38-4f04-8f83-8c4b4649c790',
            public: false,
            isDefault: true
        }
    ]
};

export const presets: Module<Preset, RootState> = {
  state, 
  getters,
  mutations,
  actions
};