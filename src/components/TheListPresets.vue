<template>
   <div class="list-preset">
         <q-list class="list-preset__list list-custom ">
            <q-item
               v-for="(item, i) in presets" :key="i" tag="label" 
               clickable
               :active="idSelectedPreset === item.id"
               @click="clickItem(item.id)"
               active-class="my-menu-link"
            >
               <q-item-section top>
                  <q-item-label class="q-mt-sm list-preset__item-label" :style="{'fontWeight': item.active === true ? 'bold' : 'auto'}">{{item.name}}</q-item-label>
               </q-item-section>
               <q-item-section></q-item-section>
               <q-item-section  side>
                  <div class="q-gutter-xs">
                     <img v-if="item.public" src="../assets/icons/public.svg"/>
                     <img v-if="item.active" src="../assets/icons/pin-active.svg"/>
                     <img v-else src="../assets/icons/pin-down.svg"/>
                  </div>
               </q-item-section>
            </q-item>
         </q-list>
      <q-separator />
      <div class="list-preset__actions" >
         <button class="btn" @click="usePreset()" :disabled="activeSelectedPreset === null" v-text="activeSelectedPreset ? ' Не использовать' : 'Использовать'"></button>
         <button class="btn-outline" @click="deletePreset()" :disabled="!idSelectedPreset">Удалить пресет</button>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed, defineEmits } from 'vue';

import { useStore } from 'vuex'
import { IPreset } from '../types/PresetTypes'

const store = useStore()
const idSelectedPreset = ref('id')
const activeSelectedPreset = ref<boolean | null>(null)

const presets = computed<IPreset[]>(() => store.getters.presets.filter((preset: IPreset) => !preset.isDefault))

function clickItem(id: string) {
   idSelectedPreset.value = id
   
   activeSelectedPreset.value = (presets.value.find((preset: IPreset) => preset.id === id) as IPreset).active
}
function usePreset() {
   let idPreset = idSelectedPreset.value
   let activePreset: boolean = activeSelectedPreset.value as boolean

   store.dispatch('usePreset', {idPreset, activePreset})
}

function deletePreset() {
   let idPreset = idSelectedPreset.value

   store.dispatch('deletePreset', idPreset)
}
</script>

<style>
.list-preset__actions {
   display: flex;
   justify-content: space-between;
   padding: 8px 8px;
}

.list-preset__item-label {
  color: var(--main-text-color);
  white-space: nowrap;
}
.list-preset__item-label {
   color: var(--main-text-color);
  white-space: nowrap;
}
.my-menu-link {
   color: rgb(0, 0, 0);
   background-color: var(--ligth-grey-color);
   color: var(--main-text-color);
   white-space: nowrap;
}
.my-menu-link:hover {
   background-color: var(--ligth-grey-color);
}
.list-preset__list {
   max-height: 700px;
   overflow-y: scroll;
}

.list-preset {
   min-width: 400px;
   max-height: 800px;
   margin: -15px;
   color: rgb(0, 0, 0);
}
</style>