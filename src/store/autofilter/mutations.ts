import { MutationTree } from 'vuex';

import { Autofilter } from './types';
import {IAutofilter} from '../../types/AutofilterTypes'
import { toRaw } from 'vue';
import {fieldsInfoMap} from '../../helpers/ColumnsHelper'
import {EnumRuleAutofilter, EnumTypeField} from '../../enums/EnumsByFilter'
import {IModelData} from '../../types/TableTypes'
import {EnumEmptyString} from '../../types/OtherTypes'

export const mutations: MutationTree<Autofilter> = {
  DISALLOW_CLOSEABLE_AUTOFILTER(state) {
    state.closeableAutofilter = false
  },
  ALLOW_CLOSEABLE_AUTOFILTER(state) {
    state.closeableAutofilter = true
  },
  UPDATE_OBJECT_AUTOFILTER(state: Autofilter, newObjectAutofilter: IAutofilter) {
    state.autofilterList.set(newObjectAutofilter.columnNum, newObjectAutofilter)
  },

  INIT_AUTOFILTER(state: Autofilter, data: IModelData[]) {
   
  const dataValues = toRaw(data)

  toRaw(fieldsInfoMap).forEach((value, key) => {
    let values: any = []
    let rules: EnumRuleAutofilter[] = []

    const fieldName = value.fieldName
    const fieldType = value.fieldType

    switch (fieldType) {
      case EnumTypeField.Number:
        {
          const minValue = Math.min(...dataValues.map((el: any) => el[fieldName]))
          const maxValue = Math.max(...dataValues.map((el: any) => el[fieldName]))
          values = [minValue, maxValue]
        }
        
        rules = [EnumRuleAutofilter.equally, EnumRuleAutofilter.morethan, EnumRuleAutofilter.lessthan, EnumRuleAutofilter.between]
      break;
      case EnumTypeField.Date:
        
        values = [...new Set(dataValues.map((el: any) => el[fieldName]) )]
        rules = [EnumRuleAutofilter.equally, EnumRuleAutofilter.before, EnumRuleAutofilter.after]

       {
        const idxEmptyString = values.findIndex((el: any) => el === null)
        //если есть null, тогда назвать "Пустые строки"
          if (idxEmptyString !== -1) {
            values[idxEmptyString] = EnumEmptyString.EmptyString
          }
       } 
      break;
      case EnumTypeField.String:
        values = [...new Set(dataValues.map((el: any) => el[fieldName]).filter(el => el !== null).sort((a, b) => a.localeCompare(b)) )]
        rules = [EnumRuleAutofilter.equally]

        {
        const idxEmptyString = values.findIndex((el: any) => el === EnumEmptyString.EmptyStringValue)
        //если есть пустая строка, тогда назвать "Пустые строки"
          if (idxEmptyString !== -1) {
            values[idxEmptyString] = EnumEmptyString.EmptyString
          }
        }
        
      break;
    }

    const objectAutofilter: IAutofilter = {
      fieldType,
      columnNum: key,
      columnName: fieldName,
      applied: false,
      values,
      rules,
      filterValues: [],
      appliedRule: EnumRuleAutofilter.equally
    }
    
    state.autofilterList.set(key, objectAutofilter)
   })
  },
  UPDATE_AUTOFILTER(state: Autofilter, data) {

    //обновляется весь МАП
    const dataValues = toRaw(data)

    toRaw(fieldsInfoMap).forEach((value, key) => {
      let values: any = []
      let rules: EnumRuleAutofilter[] = []
      
      const fieldName = value.fieldName
      const fieldType = value.fieldType
      

      switch (fieldType) {
        case EnumTypeField.Number:
          //не нужно для чисел это деалть
          values = (state.autofilterList.get(key) as IAutofilter).values
          rules = [EnumRuleAutofilter.equally, EnumRuleAutofilter.morethan, EnumRuleAutofilter.lessthan, EnumRuleAutofilter.between]
        break;
        case EnumTypeField.Date:
          
          values = [...new Set(dataValues.map((el: any) => el[fieldName]) )]
          rules = [EnumRuleAutofilter.equally, EnumRuleAutofilter.before, EnumRuleAutofilter.after]
  
         {
          const idxEmptyString = values.findIndex((el: any) => el === null)
          //если есть null, тогда назвать "Пустые строки"
            if (idxEmptyString !== -1) {
              values[idxEmptyString] = EnumEmptyString.EmptyString
            }
         } 
        break;
        case EnumTypeField.String:
          values = [...new Set(dataValues.map((el: any) => el[fieldName]).filter((el: any) => el !== null).sort((a: any, b: any) => a.localeCompare(b)) )]
          rules = [EnumRuleAutofilter.equally]
  
          {
          const idxEmptyString = values.findIndex((el: any) => el === EnumEmptyString.EmptyStringValue)
          //если есть пустая строка, тогда назвать "Пустые строки"
            if (idxEmptyString !== -1) {
              values[idxEmptyString] = EnumEmptyString.EmptyString
            }
          }
          
        break;
      }

      //опеделение примененность фильтра
      let appliedValue = false

      if (state.nameActiveFastFilter !== EnumEmptyString.EmptyStringValue) {
        //если есть активные быстрые фильры
        appliedValue = ((state.fastFilters.get(state.nameActiveFastFilter) as Map<number | string, IAutofilter>).get(key) as IAutofilter).applied
      } else {
        appliedValue = (state.autofilterList.get(key) as IAutofilter).applied
      }

      const objectAutofilter: IAutofilter = {
        fieldType,
        columnNum: key,
        columnName: fieldName,
        applied: appliedValue,
        values,
        rules,
        filterValues: (state.autofilterList.get(key) as IAutofilter).filterValues,
        appliedRule: (state.autofilterList.get(key) as IAutofilter).appliedRule
      }
      
      state.autofilterList.set(key, objectAutofilter)
     })
  },
  ADD_GLOBAL_FILTER(state: Autofilter, nameFilter: string) {
    const deepCopyAutofilterList: Map<number | string, IAutofilter> = new Map(
      JSON.parse(
       JSON.stringify(Array.from(state.autofilterList))
      )
    );
    state.fastFilters.set(nameFilter, deepCopyAutofilterList)
  },
  DEACTIVATED_FILTERS(state: Autofilter) {
    state.autofilterList.forEach((values: IAutofilter, keys: number) => {
      values.applied = false
      values.filterValues = []
    })
  },
  CHANGE_NAME_ACTIVE_FAST_FILTER(state: Autofilter, nameFilter: string) {
    state.nameActiveFastFilter = nameFilter
  },
  DEACTIVATED_FAST_FILTER(state: Autofilter) {
    state.nameActiveFastFilter = EnumEmptyString.EmptyStringValue
  },

};