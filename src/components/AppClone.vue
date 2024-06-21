<template>
  <div class="app">
    <the-managerboard class="the-managerboard"></the-managerboard>
    <the-table :style="size" class="the-table"  @changeTableSize="changeTableSize"></the-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
 import TheTable from './components/TheTable.vue'
 import TheManagerboard from './components/TheManagerboard.vue'

 let allSize = ref<boolean>(false)

 let size = computed(() => {
  console.log('computed')
  if (allSize.value === true) {
    return 'position: absolute;inset: 0;min-height: 99vh;background-color: #fff;'
  } else {
    return 'position: relative;min-height: 92vh;'
  }
 })

 function changeTableSize(allSizeEm: boolean) {
  
  allSize.value = allSizeEm

  console.log('allSize', allSize.value)
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
.the-managerboard {
  
  background-color: rgba(240, 240, 247, 0.413);
  height: 8vh;
}
.the-table {
  position: relative;
  min-height: 92vh;
}
</style>
