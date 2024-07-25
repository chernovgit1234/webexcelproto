<style>
.setting-preset__item:hover {
  background-color: var(--ligth-grey-color);
}

.setting-preset__list {
  max-height: 600px;
  border-top: 1px solid #0000001E;
  border-bottom: 1px solid #0000001E;
  overflow-y: scroll;
}

.setting-preset__item-label {
  color: #817e7e;
  white-space: nowrap;
}

.setting-preset {
  min-width: 400px;
  margin: -15px;
}
.setting-preset__actions {
  display: flex;
  justify-content: space-between;
  padding: 8px 8px;
}

.setting-preset__header {
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 20px;
}
.setting-preset__text-active {
  font-weight: bold;
  color: #817e7e;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.setting-preset__create-preset {
  padding: 0px 8px;
}

.input__fade-enter-active, .input__fade-leave-active {
  transition: opacity .3s;
}

.input__fade-enter, .input__fade-leave-to {
  opacity: 0;
}
</style>

<template>
    <div class="setting-preset">
      <div class="setting-preset__header">
        <span class="setting-preset__item-label">Активный пресет:</span>
        <span class="setting-preset__text-active">{{ presetLocale.name }}</span>
      </div>
      <q-separator inset/>
        <q-item dense tag="label" clickable class="setting-preset__item">
          <q-item-section side>
            <q-checkbox color="light-green" :disabled="presetLocale.isDefault" v-model="presetLocale.public" />
          </q-item-section>
          <q-item-section>
            <span class="setting-preset__item-label">Публичный доступ</span>
          </q-item-section>
        </q-item>
        <q-item dense tag="label" clickable class="setting-preset__item">
          <q-item-section side>
            <q-checkbox color="blue-14" @click="selectAll()" v-model="selectedAll"/>
          </q-item-section>
          <q-item-section>
            <span class="setting-preset__item-label">Выбрать все ({{ columnsData.length }})</span>
          </q-item-section>
        </q-item>
        <q-list dense class="setting-preset__list list-custom">
            <q-item v-for="(item, i) in columnsData" :key="i" tag="label" clickable class="setting-preset__item">
              <q-item-section side>
                  <q-checkbox color="blue-14" v-model="item.selected" />
              </q-item-section>
              <q-item-section>
                  <span class="setting-preset__item-label">{{item.num}}. {{ item.name }}</span>
              </q-item-section>
            </q-item>
        </q-list>
      <div class="setting-preset__actions" >
        <button class="btn" @click="applySettings()">Применить</button>
        <button :disabled="visibleCreateForm" class="btn-outline" @click="visibleCreateForm = true">Создать пресет</button>
      </div>
      <transition name="input__fade">
        <div v-if="visibleCreateForm">
          <div class="setting-preset__create-preset">
            <q-input v-model="createdPresetName" :color="hintItputColorText" dense :hint="hintItputText">
              <template v-slot:append>
                <q-icon v-show="createdPresetName.length" name="close" @click="createdPresetName = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <div class="setting-preset__actions">
            <button class="btn" @click="createPreset()" :disabled="createdPresetName.length < 2 || !freePresetName">Добавить пресет</button>
            <button class="btn-outline" @click="cancelCreate()">Отмена</button>
          </div>
        </div>
      </transition>
    </div>
  </template>

<script setup lang="ts">
import {EnumColumnNumber, EnumColumnName, EnumColumnTableNumber} from '../enums/EnumColumnValues'
import { watchEffect, reactive, toRaw, onMounted, ref , watch, computed } from 'vue';
import { useStore } from 'vuex'
import {IPreset} from '../types/PresetTypes'

const store = useStore()

interface IPresetListColumn {
  num: number,
  numCol: number,
  name: string,
  selected: boolean | null
}

let selectedAll =  ref<boolean>(false)
let visibleCreateForm =  ref<boolean>(false)
let createdPresetName =  ref<string>('')
const freePresetName = ref<boolean>(true)

const hintItputText = computed(() => {
   return freePresetName.value === true ? 'Введите название пресета' : 'Это название занято, введите другое'
})

const hintItputColorText = computed(() => {
   return freePresetName.value === true ? 'primary' : 'red-6'
})

const presetLocale = reactive<IPreset>({
  id: '',
  name: 'По умолчанию',
  hiddenColumns: [],
  active: false,
  userId: '',
  public: false,
  isDefault: false
})

const columnsData = reactive<IPresetListColumn[]>([
  {
    num: EnumColumnNumber.Name,
    numCol: EnumColumnTableNumber.Name,
    name: EnumColumnName.Name,
    selected: true
  },
  {
    num: EnumColumnNumber.Brand,
    numCol: EnumColumnTableNumber.Brand,
    name: EnumColumnName.Brand,
    selected: true
  },
  {
    num: EnumColumnNumber.Title,
    numCol: EnumColumnTableNumber.Title,
    name: EnumColumnName.Title,
    selected: true
  },
  {
    num: EnumColumnNumber.ProductionDate,
    numCol: EnumColumnTableNumber.ProductionDate,
    name: EnumColumnName.ProductionDate,
    selected: true
  },
  {
    num: EnumColumnNumber.Cost,
    numCol: EnumColumnTableNumber.Cost,
    name: EnumColumnName.Cost,
    selected: true
  },
  {
    num: EnumColumnNumber.ProducingCountry,
    numCol: EnumColumnTableNumber.ProducingCountry,
    name: EnumColumnName.ProducingCountry,
    selected: true
  },
  {
    num: EnumColumnNumber.AgentEmail,
    numCol: EnumColumnTableNumber.AgentEmail,
    name: EnumColumnName.AgentEmail,
    selected: true
  },
  {
    num: EnumColumnNumber.Comments,
    numCol: EnumColumnTableNumber.Comments,
    name: EnumColumnName.Comments,
    selected: true
  }
])

onMounted(()=> {
  let preset = toRaw(store.getters.activePreset) as IPreset

  presetLocale.id = preset.id
  presetLocale.name = preset.name
  presetLocale.hiddenColumns = preset.hiddenColumns
  presetLocale.active = preset.active
  presetLocale.userId = preset.userId
  presetLocale.public = preset.public
  presetLocale.isDefault = preset.isDefault

  columnsData.forEach((colData: IPresetListColumn) => {
    if (presetLocale.hiddenColumns.some((col: number) => col === colData.numCol)) {
      colData.selected = false
    }
  })
})

watch(createdPresetName, ( newValue: string ) => {
  freePresetName.value = store.getters.freePresetName(newValue)
})

watchEffect(() => {
  columnsData.every((col: IPresetListColumn) => col.selected === true) ? selectedAll.value = true : selectedAll.value = false
})

function selectAll() {
  selectedAll.value === true ? columnsData.forEach((col: IPresetListColumn)=> col.selected = true) : columnsData.forEach((col: IPresetListColumn)=> col.selected = false)
}

function createPreset() {
  const newPreset: IPreset = {
    id: String(new Date().valueOf()),
    name: createdPresetName.value,
    hiddenColumns: columnsData.map((colData: IPresetListColumn) => {
    if (colData.selected === false) {
      return colData.numCol
    }
  }).filter(colData => colData) as number[],
    active: false,
    userId: String(new Date().valueOf() + 1),
    public: presetLocale.public,
    isDefault: false
  }

  store.dispatch('createPreset', newPreset)

  createdPresetName.value = ''
}

function cancelCreate() {
  visibleCreateForm.value = false
  createdPresetName.value = ''
}

function applySettings() {
  let hiddenColumns: number[] = columnsData.map((colData: IPresetListColumn) => {
    if (colData.selected === false) {
      return colData.numCol
    }
  }).filter(colData => colData) as number[]
 
  presetLocale.hiddenColumns = hiddenColumns

  const preset = toRaw(presetLocale) as IPreset
  store.dispatch('applySettingPreset', preset)
}
</script>
