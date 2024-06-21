
import {Autofilter} from './autofilter/types'

export interface RootState {
    version: string;
    error: string | null;
    message: string | null;
    load: boolean | null;
    selectedColumn: number | null;
  }

  export type CommonStateType = RootState |  Autofilter 