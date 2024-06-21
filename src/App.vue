<template>
  <div class="app">
    <the-managerboard class="the-managerboard"></the-managerboard>
    <the-table 
      :style="size" 
      class="the-table"  
      @changeTableSize="changeTableSize"
      @showPopupCreateFilterName="showPopupCreateFilterName()"
    ></the-table>
   
    <q-dialog class="app__popup" v-model="alert" persistent transition-show="scale" transition-hide="scale" backdrop-filter="grayscale(100%)">
      <TheFormCreateFastFilter v-if="TypePopup.CreateFilter" @closeDialog="closeDialog()"></TheFormCreateFastFilter>
    </q-dialog>
		</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import TheTable from './components/TheTable.vue'
import TheManagerboard from './components/TheManagerboard.vue'
import TheFormCreateFastFilter from './components/TheFormCreateFastFilter.vue'

enum TypePopup {
  Default = 0,
  CreateFilter = 1
}

let typePopup = ref<TypePopup>(TypePopup.Default)
let alert = ref(false)
let allSize = ref(false)

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
  alert.value = false
  typePopup.value = TypePopup.Default
}


function showPopupCreateFilterName() {
  alert.value = true
  typePopup.value = TypePopup.CreateFilter
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

.the-managerboard {
  
  background-color: rgba(240, 240, 247, 0.413);
  height: 8vh;
}
.the-table {
  position: relative;
  min-height: 92vh;
}
</style>
