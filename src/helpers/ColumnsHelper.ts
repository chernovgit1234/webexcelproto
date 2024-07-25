import {EnumColumnNumber, EnumColumnName, EnumColumnTableNumber, EnumFieldName} from '../enums/EnumColumnValues'
import {EnumTypeField} from '../enums/EnumsByFilter'

import {reactive, ref} from 'vue'

interface IField {
	fieldName: string,
	fieldType: EnumTypeField,
	columnName: string,
	colNum: number
} 

/* export const columnsSettings = reactive([
    { 
		data: "Guid",
		width: 40, 
		readOnly: true, 
		renderer: 'renderForGuid'
		//renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderGuid(td).addEventListener('click', function(){ getStory(value) })
	},  
    { 
      data: "TypeRow",
      readOnly: true,
      width: 100,
	renderer: 'renderForBrandCell'},
      //renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderBrandCell(td, value as EnumTypeBrandRow)},
    { data: "Name", width: 200, readOnly: false},
    { data: "Brand", readOnly: true, width: 350,renderer: 'renderForTdCommon'},
      //renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "Title", width: 350, readOnly: false,allowEmpty:true,allowInvalid: true,renderer: 'renderForTdCommon'},
      //renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { 
		data: "ProductionDate", 
		width: 350, 
		readOnly: false,
		type: 'date',
		//allowInvalid: true,
		//allowEmpty:true,
		dateFormat: 'YYYY/MM/DD',
		correctFormat: true,
		defaultDate: new Date(),
		datePickerConfig: {
			firstDay: 0,
			showWeekNumber: true
		},
		validator: 'validatorDate',
		renderer: 'renderProductionDate'
        //renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTypeDate(instance, row, td, value) 
	},
    { data: "Сost", readOnly: true, width: 350,renderer: 'renderForTdCommon'},
      //renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "ProducingCountry", width: 350, readOnly: false,renderer: 'renderForTdCommon'},
      //renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "AgentEmail", readOnly: true, width: 350,renderer: 'renderForTdCommon'},
     // renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "Comments", width: 350, readOnly: false,renderer: 'renderForTdCommon'}
  ],) */

export const nestedHighHeaderGroup = reactive([ 
	{ label: ''},
	{ label: ''},
	{ label: 'Группа колонок 1', colspan: 3 },
	{ label: 'Группа колонок 2', colspan: 3 },
	{ label: 'Группа колонок 3', colspan: 2 }
])
export const teststruxt = new Array(9); 
export const nestedHighHeader = reactive([ 
	EnumColumnName.Guid,
	EnumColumnName.Type,
	EnumColumnName.Name,
	EnumColumnName.Brand,
	EnumColumnName.Title,
	EnumColumnName.ProductionDate,
	EnumColumnName.Cost,
	EnumColumnName.ProducingCountry,
	EnumColumnName.AgentEmail, 
	EnumColumnName.Comments  
])

export const fieldsInfoMap = reactive<Map<number, IField>> (new Map([
	[
		EnumColumnTableNumber.Type,
		{
			fieldName: EnumFieldName.Type,
			fieldType: EnumTypeField.String,
			columnName: EnumColumnName.Type,
			colNum: EnumColumnNumber.Type,
		} 
	],
	[
		EnumColumnTableNumber.Name,
		{
			fieldName: EnumFieldName.Name,
			fieldType: EnumTypeField.String,
			columnName: EnumColumnName.Name,
			colNum: EnumColumnNumber.Name
		} 
	],
	[
		EnumColumnTableNumber.Brand,
		{
			fieldName: EnumFieldName.Brand,
			fieldType: EnumTypeField.String,
			columnName: EnumColumnName.Brand,
			colNum: EnumColumnNumber.Brand
		} 
	],
	[
		EnumColumnTableNumber.Title,
		{
			fieldName: EnumFieldName.Title,
			fieldType: EnumTypeField.String,
			columnName: EnumColumnName.Title,
			colNum: EnumColumnNumber.Title
		} 
	],
	[
		EnumColumnTableNumber.ProductionDate,
		{
			fieldName: EnumFieldName.ProductionDate,
			fieldType: EnumTypeField.Date,
			columnName: EnumColumnName.ProductionDate,
			colNum: EnumColumnNumber.ProductionDate
		} 
	],
	[
		EnumColumnTableNumber.Cost,
		{
			fieldName: EnumFieldName.Cost,
			fieldType: EnumTypeField.Number,
			columnName: EnumColumnName.Cost,
			colNum: EnumColumnNumber.Cost
		} 
	],
	[
		EnumColumnTableNumber.ProducingCountry,
		{
			fieldName: EnumFieldName.ProducingCountry,
			fieldType: EnumTypeField.String,
			columnName: EnumColumnName.ProducingCountry,
			colNum: EnumColumnNumber.ProducingCountry
		} 
	],
	[
		EnumColumnTableNumber.AgentEmail,
		{
			fieldName: EnumFieldName.AgentEmail,
			fieldType: EnumTypeField.String,
			columnName: EnumColumnName.AgentEmail,
			colNum: EnumColumnNumber.AgentEmail
		} 
	],
	[
		EnumColumnTableNumber.Comments,
		{
			fieldName: EnumFieldName.Comments,
			fieldType: EnumTypeField.String,
			columnName: EnumColumnName.Comments,
			colNum: EnumColumnNumber.Comments
		} 
	]
]) ) 
