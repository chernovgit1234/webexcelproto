
export interface Preset {
  presetList: IPreset[]
}

export interface IPreset {
  id: string,
  name: string,
  hiddenColumns: number[],
  active: boolean,
  userId: string | null,
  public: boolean,
  isDefault: boolean
}