<template>
    <div>
        <q-card style="width: 400px;">
            <q-card-section>
            <div class="text-h6">Создание быстрого фильтра</div>
            <q-separator />
            </q-card-section>
            
            <q-card-section class="q-pt-none">
            <q-input 
                placeholder=""
                @keyup.enter="addGlobalFilter()"
                v-model="createdFilterName"
                :color="hintItputColorText" 
                :hint="hintItputText">
                <template v-slot:append>
                    <q-icon v-show="createdFilterName.length" name="close" @click="createdFilterName = ''" class="cursor-pointer" />
                </template>
            </q-input>
            </q-card-section>

            <q-card-actions class="actions-beetwen-position"> 
            <button 
                :disabled="createdFilterName.length <= 1 || freeFilterName === false" 
                class="btn" 
                v-close-popup
                @keyup.enter="addGlobalFilter()"
                @click="addGlobalFilter()"
            >Создать</button>
            <button class="btn-outline" v-close-popup>Отмена</button>
            </q-card-actions>
      </q-card>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, defineEmits } from 'vue';
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

const emit = defineEmits([
  'closeDialog'
])

const store = useStore()

let createdFilterName = ref('')
let freeFilterName = ref<boolean>(false)

const hintItputText = computed(() => {
   return freeFilterName.value === true ? 'Введите название быстрого фильтра' : 'Это название занято, введите другое'
})
const hintItputColorText = computed(() => {
   return freeFilterName.value === true ? 'primary' : 'red-6'
})

function addGlobalFilter() {
    store.dispatch('addGlobalFilter', createdFilterName.value)
    emit('closeDialog')
}

watch(createdFilterName, ( newValue: string ) => {
    freeFilterName.value = store.getters.freeFastFilterName(newValue)
})
</script>