import { Module } from 'vuex';
import { Autofilter } from './types';
import { RootState } from '../types';
import { getters } from './getters';
import { mutations } from './mutations';
import { actions } from './actions';
import {EnumEmptyString} from '../../types/OtherTypes'
	
const state: Autofilter = {
  autofilterList: new Map(),
  closeableAutofilter: true,
  fastFilters: new Map(),
  nameActiveFastFilter: EnumEmptyString.EmptyStringValue
};

export const autofilter: Module<Autofilter, RootState> = {
  state, 
  getters,
  mutations,
  actions
};