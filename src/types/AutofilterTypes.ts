import {EnumTypeField, EnumRuleAutofilter} from '../enums/EnumsByFilter'
export interface IAutofilter {
  fieldType: EnumTypeField,
  columnNum: number,
  columnName: string,
  applied: boolean,
  filterValues: any[],
  values: any[],
  rules: EnumRuleAutofilter[],
  appliedRule: EnumRuleAutofilter,
  isRangeRuleType?: boolean
}