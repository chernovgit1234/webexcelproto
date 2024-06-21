<template>
    <q-card>
        <q-tabs
        v-model="tabModel"
        dense
        class="bg-blue-grey-1 text-grey-7" 
        active-bg-color="white"
        indicator-color="white"
        >
        <q-tab name="settings" label="Настройка" class="text-bold text-capitalize"/>
        <q-tab :disable="countPresets === 0" name="list" :label="labelPresetTab" class="text-bold text-capitalize"/>
        </q-tabs>

        <q-tab-panels v-model="tabModel" animated class="text-white">
            <q-tab-panel name="settings">
                <TheSettingsPresets></TheSettingsPresets>
            </q-tab-panel>
            <q-tab-panel name="list" :disable="countPresets === 0">
                <TheListPresets></TheListPresets>
            </q-tab-panel>
        </q-tab-panels>
    </q-card>
</template>
  
  <script lang="ts" setup>
    import { ref, computed, watch } from 'vue';
    import TheListPresets from './TheListPresets.vue'
    import TheSettingsPresets from './TheSettingsPresets.vue'
    import { useStore } from 'vuex'
    import { IPreset } from '../types/PresetTypes'
    
    enum TabsEnum {
        settings = 'settings',
        list = 'list'
    }

    const store = useStore()

    const tabModel = ref<TabsEnum>(TabsEnum.settings)
    const countPresets = computed<number>(() => store.getters.presets.filter((preset: IPreset) => !preset.isDefault).length)
    const labelPresetTab = computed<string>(() => `Пресеты (${countPresets.value})`)
    watch(countPresets, (newValue: number) => {
        if (newValue === 0) {
            tabModel.value = TabsEnum.settings
        }
    })
</script>