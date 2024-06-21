import {EnumColumnNumber, EnumColumnName, EnumColumnTableNumber, EnumFieldName} from '../enums/EnumColumnValues'
import {EnumTypeField} from '../enums/EnumsByFilter'

import {reactive, ref} from 'vue'

interface IField {
	fieldName: string,
	fieldType: EnumTypeField,
	columnName: string,
	colNum: number
} 

export const nestedHighHeader = reactive([  
	EnumColumnName.Guid,
	EnumColumnName.Type,
	EnumColumnName.Name,
	EnumColumnName.Brand,
	EnumColumnName.Title,
	EnumColumnName.ProductionDate,
	EnumColumnName.Сost,
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
		EnumColumnTableNumber.Сost,
		{
			fieldName: EnumFieldName.Сost,
			fieldType: EnumTypeField.Number,
			columnName: EnumColumnName.Сost,
			colNum: EnumColumnNumber.Сost
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
