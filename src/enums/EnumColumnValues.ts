
export enum EnumTypeBrand {
  'brand' = 'Группа',
  'product' = 'Запчасть',
}

export enum EnumTypeBrandRow {
  'brand' = 'brand',
  'product' = 'product'
}

export function getFieldNameByColumnNum(col: number): string {

  let returnValue= ''

  switch (col) {
    case EnumColumnTableNumber.Type:
      returnValue = EnumFieldName.Type
      break
    case EnumColumnTableNumber.Name:
      returnValue = EnumFieldName.Name
      break
    case EnumColumnTableNumber.Brand:
      returnValue = EnumFieldName.Brand
      break
    case EnumColumnTableNumber.Title:
      returnValue = EnumFieldName.Title
      break
    case EnumColumnTableNumber.ProductionDate:
      returnValue = EnumFieldName.ProductionDate
      break
    case EnumColumnTableNumber.Cost:
      returnValue = EnumFieldName.Cost
      break
    case EnumColumnTableNumber.ProducingCountry:
      returnValue = EnumFieldName.ProducingCountry
      break
    case EnumColumnTableNumber.AgentEmail:
      returnValue = EnumFieldName.AgentEmail
      break
    case EnumColumnTableNumber.Comments:
      returnValue = EnumFieldName.Comments
      break
  }

  return returnValue

}

export enum EnumColumnName {
  Guid = '',
  Type = 'Тип',
  Name = 'Наименование',
  Brand = 'Брэнд',
  Title = 'Описание',
  ProductionDate = 'Дата выпуска',
  Cost = 'Стоимость',
  ProducingCountry = 'Страна производитель',
  AgentEmail = 'Почта агента',
  Comments = 'Комментарий'
}

export enum EnumFieldName {
  Guid = 'Guid',
  Type = 'TypeRow',
  Name = 'Name',
  Brand = 'Brand',
  Title = 'Title',
  ProductionDate = 'ProductionDate',
  Cost = 'Cost',
  ProducingCountry = 'ProducingCountry',
  AgentEmail = 'AgentEmail',
  Comments = 'Comments'
}

export enum EnumColumnNumber {
  Type = 0,
  Name = 1,
  Brand = 2,
  Title = 3,
  ProductionDate = 4,
  Cost = 5,
  ProducingCountry = 6,
  AgentEmail = 7,
  Comments = 8
}

export enum EnumColumnTableNumber {
  Numbs = -1,
  Guid = 0,
  Type = 1,
  Name = 2,
  Brand = 3,
  Title = 4,
  ProductionDate = 5,
  Cost = 6,
  ProducingCountry = 7,
  AgentEmail = 8,
  Comments = 9
}