import {EnumTypeBrand, EnumTypeBrandRow} from '../enums/EnumColumnValues'
export interface IModelData {
  Guid: string;
  TypeRow: EnumTypeBrand | EnumTypeBrandRow;
  Name: string;
  Brand: string;
  Title: string;
  ProductionDate: string | null;
  Сost: string | number;
  ProducingCountry: string;
  AgentEmail: string;
  Comments: string;
}