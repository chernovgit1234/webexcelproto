
import {Autofilter} from './autofilter/types'

import {ISearchByColumnMetadata} from '../types/OtherTypes'

export interface RootState {
  version: string;
  error: string | null;
  message: string | null;
  load: boolean | null;
  selectedColumn: number | null;
  columnSearchMetadata: ISearchByColumnMetadata | null
  fieldNameSearchedColumn: string | null;
  valueSearchedColumn: string;
  summObject: any
  }

  export type CommonStateType = RootState |  Autofilter 