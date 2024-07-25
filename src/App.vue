<template>
  <div class="app">
    <the-managerboard class="the-managerboard"></the-managerboard>
    <the-table 
      :style="size" 
      class="the-table"  
      @changeTableSize="changeTableSize"
      @showPopupCreateFilterName="showPopupCreateFilterName()"
      @showPopupShowStoryRow="showPopupShowStoryRow"
    ></the-table>
   
    <q-dialog class="app__popup" v-model="showDailog" persistent transition-show="scale" transition-hide="scale" backdrop-filter="grayscale(100%)">
      <TheFormCreateFastFilter v-if="typePopup === TypePopup.CreateFilter" @closeDialog="closeDialog()"></TheFormCreateFastFilter>
      <TheFormShowStoryRow :idRow="idRow" v-if="typePopup === TypePopup.ShowStoryRow || typePopup === TypePopup.ShowCompare" @closeDialog="closeDialog()" @showCompareForm="showCompareForm"></TheFormShowStoryRow>
    </q-dialog>
    <q-dialog class="app__popup-after" v-model="showDailogAfter" persistent transition-show="scale" transition-hide="scale" backdrop-filter="grayscale(100%)" >
      <TheFormCompareValues :compareRow="compareRow" v-if="typePopup === TypePopup.ShowCompare"></TheFormCompareValues>
    </q-dialog>
		</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import TheTable from './components/TheTable.vue'
import TheManagerboard from './components/TheManagerboard.vue'
import TheFormCreateFastFilter from './components/TheFormCreateFastFilter.vue'
import TheFormShowStoryRow from './components/TheFormShowStoryRow.vue'
import TheFormCompareValues from './components/TheFormCompareValues.vue'
import {IStoryRow} from './components/TheFormShowStoryRow.vue'

function showCompareForm(row: IStoryRow) {
  typePopup.value = TypePopup.ShowCompare
  showDailogAfter.value = true
  compareRow.value = row
}
enum TypePopup {
  Default = 0,
  CreateFilter = 1,
  ShowStoryRow = 2,
  ShowCompare = 3
}

let typePopup = ref<TypePopup>(TypePopup.Default)
let showDailog = ref(false)
let showDailogAfter = ref(false)

let allSize = ref(false)
let idRow = ref<string>('')

let compareRow = ref<IStoryRow | null>(null)

let size = computed(() => {
if (allSize.value === true) {
  return 'position: absolute;inset: 0; min-height: 99vh;background-color: #fff;'
} else {
  return 'position: relative;min-height: 92vh;'
}
})

function changeTableSize(allSizeEm: boolean) {
allSize.value = allSizeEm
}
function closeDialog() {
  showDailog.value = false
  typePopup.value = TypePopup.Default
}


function showPopupCreateFilterName() {
  showDailog.value = true
  typePopup.value = TypePopup.CreateFilter
}

function showPopupShowStoryRow(idRowValue: any) {
  showDailog.value = true
  typePopup.value = TypePopup.ShowStoryRow
  idRow.value = idRowValue
}

</script>

<style lang="css">
.material {
  cursor: pointer;
}
.app {
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  position: relative;
  
}

.app__popup {
  position: absolute;
	inset: 0;
	background-color: #21212108;
	z-index: 1000;
}
.app__popup-after {
  position: absolute;
	inset: 0;
	background-color: #21212108;
	z-index: 1001;
}

.the-managerboard {
  
  background-color: rgba(240, 240, 247, 0.413);
  height: 8vh;
}
.the-table {
  position: relative;
  min-height: 92vh;
}

		
</style>
