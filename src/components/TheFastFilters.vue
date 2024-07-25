<template>
    <div class="chips-group__wrapper">
      <div :style="{'box-shadow': haveLeftScroll === true && haveScroll === true ? '7px 0px 9px -6px rgba(84, 93, 99, 0.43) inset': 'none'}">
        <div 
          class="chips-group" 
          id="chipsGroupId" 
          :style="{'box-shadow': haveRightScroll === true && haveScroll === true ? '-7px 0px 9px -6px rgba(84, 93, 99, 0.43) inset': 'none' }"
        >
          <div 
            class="chip-filter" 
            v-for="(name, i) of fastFilterNames" 
            :key="i" 
            :id="`${name}Id`"
            @click="selectFastFilter(name)"
            @mouseover="mouseoverChip(name.replaceAll(' ', ''))"
            :style="{'outline': name === activeFilterName ? '2px solid blue': '1px solid #817e7e'}"
          >
            <span :id="`${name.replaceAll(' ', '')}СпанАйди`">{{ name }}</span>
            <div class="chip-filter__icon-wrapper" v-if="name === activeFilterName" @click.stop="resetFastFilter()">
                <q-icon class="chip-filter__close-icon" name="close"/>
            </div>
            <q-tooltip class="text-body2 tooltip-el" v-if="showTooltipChip" anchor="top middle" self="bottom middle" >
              <span class="cursor-carret_none">{{ name }}</span><br/>
            </q-tooltip>
          </div> 
        </div>
      </div>
        <div class="chips-group__count" v-if="fastFilterNames.length && haveScroll">
          <span>N {{ fastFilterNames.length }}</span>
        </div>
        <div class="chips-group__left-arrow" v-if="fastFilterNames.length && haveLeftScroll && haveScroll">
          <q-icon class="cursor-p" color="grey-6" size="md" name="chevron_left" @click="scrollLeft()" />
        </div>
        <div class="chips-group__right-arrow" v-if="fastFilterNames.length && haveRightScroll && haveScroll">
          <q-icon class="cursor-p" color="grey-6" size="md" name="chevron_right" @click="scrollRight()"/>
        </div>
    </div>
</template>

<script lang="ts" setup>

import { ref, defineEmits, computed, nextTick, watchEffect } from 'vue';
import { useStore } from 'vuex'
import {EnumTypeFilter} from '../enums/EnumsByFilter'
import {EnumEmptyString} from '../types/OtherTypes'

enum StepScroll {
  Step200 = 260
}

const emit = defineEmits([
  'sort', 'resetFastFilter'
])

const store = useStore()
let showTooltipChip = ref(false)
let haveScroll = ref(true)
let haveLeftScroll = ref(false)
let haveRightScroll = ref(true)
let activeFilterName = ref<EnumEmptyString | string>(EnumEmptyString.EmptyStringValue)
let fastFilterNames = computed<string[]>(() => store.getters.fastFilterNames)
  
const thereIsAnActiveFastFilter = computed(() => store.getters.thereIsAnActiveFastFilter)
watchEffect(() => {
  if (thereIsAnActiveFastFilter.value === false) {
    activeFilterName.value = EnumEmptyString.EmptyStringValue
  }
})

watchEffect(() => {
  fastFilterNames.value
    
  const chipsGroup = document.querySelector('#chipsGroupId') as HTMLDivElement

  if (chipsGroup) {
    nextTick(() =>{
      chipsGroup.scrollWidth  > chipsGroup.clientWidth  ? haveScroll.value = true : haveScroll.value = false
      chipsGroup.scrollLeft === 0 ? haveLeftScroll.value = false : haveLeftScroll.value = true

      if (haveScroll.value === true && haveRightScroll.value === false) {
        scrollRight()
      }
    })
  }
});

function scrollRight() {
  let chipsGroupId = document.querySelector('#chipsGroupId') as HTMLDivElement
  chipsGroupId.scrollBy({
    top: 0,
    left: StepScroll.Step200,
    behavior: "smooth"
  })

  haveLeftScroll.value = true

  //отключение стрелки
  const chipsGroup = document.querySelector('#chipsGroupId') as HTMLDivElement
  let calcValue: number = chipsGroup.scrollWidth - chipsGroup.clientWidth - StepScroll.Step200
  if (Math.ceil(chipsGroup.scrollLeft) >= calcValue) {
    haveRightScroll.value = false
  }
}

function scrollLeft() {
  let chipsGroupId = document.querySelector('#chipsGroupId') as HTMLDivElement
  chipsGroupId.scrollBy({
    top: 0,
    left: -StepScroll.Step200,
    behavior: "smooth"
  })

  haveRightScroll.value = true

  //отключение стрелки
  const chipsGroup = document.querySelector('#chipsGroupId') as HTMLDivElement
  if ( chipsGroup.scrollLeft - StepScroll.Step200 <= 0) {
    haveLeftScroll.value = false
  }
}

function mouseoverChip(nameFilter: string) {
  
  let idFilter = `${nameFilter}СпанАйди` 
 
  let spanChip = document.querySelector(`#${idFilter}`) as any

  if (spanChip && spanChip.offsetWidth < spanChip.scrollWidth) {
    
    showTooltipChip.value = true
  } else {
    showTooltipChip.value = false
  }
}
function selectFastFilter(nameFilter: string) {

  /* let idFilter = `${nameFilter}Id` 
  let filterElement = document.querySelector(`#${idFilter}`) as HTMLDivElement
  //filterElement.getBoundingClientRect()

  const container = document.querySelector('#chipsGroupId') as HTMLDivElement
  const rect = container.getBoundingClientRect() 
 */
//

  store.dispatch('changeNameActiveFastFilter', nameFilter)
  store.dispatch('deactivatedAutofilters')
  activeFilterName.value = nameFilter
  console.log('store.getters.fastFilterByName(nameFilter)', store.getters.fastFilterByName(nameFilter))
  emit('sort', store.getters.fastFilterByName(nameFilter))
}

function resetFastFilter() {
  store.dispatch('deactivatedFastFilter')
  activeFilterName.value = EnumEmptyString.EmptyStringValue
  emit('resetFastFilter')
}

</script>

<style lang="css">
  .chip-filter {
   position: relative;
   border-radius: 5px;
   color: #383636;
   padding: 2px 10px;
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: space-between;
   gap: 5px;
   user-select: none;
   cursor: pointer;
   max-width: 200px;
  }
  .chip-filter span {
	white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .chip-filter:hover {
    outline: 2px solid blue;
  }
  .chips-group__wrapper {
    max-width: 58%;
    position: relative;
  }
  .chips-group {
    position: relative;
    padding: 2px 5px 2px 5px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 15px;
    overflow: hidden;
  }
  .chips-group__count {
    user-select: none;
    position: absolute;
    left: -55px;
    bottom: 4px;
    color: var(--main-text-color);
		font-family: 'Roboto500';
		white-space: nowrap;
  }
  .chip-filter__icon-wrapper {
    border-radius: 50%;
    padding: 1px;
    position: relative;
    border: 1px solid #383636;
    border: 1px solid transparent;
    width: 15px;
    height: 15px;
  }
  .chip-filter__close-icon {
    position: absolute;
    left: -1.5px;
    bottom: 5.5px;
    width: 100%;
    height: 100%;
  }
  .chip-filter__icon-wrapper:hover {
    border: 1px solid red;
    border: 1px solid #383636;
  }
  .chip-filter__close-icon:hover {
    color: red;
    color: #383636;
  }

  .chips-group__left-arrow {
    position: absolute;
    left: -32px;
    bottom: -2px;
  }
  .chips-group__right-arrow {
    position: absolute;
    right: -38px;
    bottom: -2px;
  }
</style>