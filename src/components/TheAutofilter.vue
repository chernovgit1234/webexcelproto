<template>
    <div class="autofilter">
        <div class="autofilter__rule">
            <q-select 
                outlined
                filled 
                v-model="appliedRule" 
                :options="rules" 
                label="правило" 
                dense 
                options-dense 
                color="blue-14"
                @focus="focusSelect()"
                @blur="blurSelect()"
            />
        </div>
        <div class="autofilter__string-type string-type-autofilter" v-if="fieldType === EnumTypeField.String">
            <div class="string-type-autofilter__search">
                <q-input 
                    type="text"
                    outlined 
                    v-model="searchText" 
                    dense 
                    color="blue-14"
                    bg-color="white"
                >
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                    <template v-if="searchText.length" v-slot:append>
                        <q-btn round dense flat icon="close" @click="searchText = ''"/>
                    </template>
                </q-input>
            </div>
            <q-separator />
            <q-item dense tag="label" clickable class="string-type-autofilter__item">
            <q-item-section thumbnail>
                <q-checkbox color="blue-14" @click="selectAll()" v-model="selectedAll"/>
            </q-item-section>
            <q-item-section>
                <span class="string-type-autofilter__item-label text-bold">Выбрать все ({{ searchValues.length ? searchValues.length : values.length }})</span>
            </q-item-section>
            </q-item>
        
            <div class="string-type-autofilter__list">
                <q-virtual-scroll
                    :virtual-scroll-item-size="10"
                    :virtual-scroll-sticky-size-start="10"
                    :virtual-scroll-sticky-size-end="10"
                    :items="searchValues.length ? searchValues : values"
                    v-slot="{ item }"
                >
                    <q-item dense tag="div" clickable class="string-type-autofilter__item">
                        <q-item-section thumbnail>
                            <q-checkbox color="blue-14" v-model="item.selected" />
                        </q-item-section>
                        <q-item-section>
                            <span class="string-type-autofilter__item-label">{{item.value}}</span>
                        </q-item-section>
                    </q-item>
                </q-virtual-scroll>
            </div>
            <div class="string-type-autofilter__actions">
                <button class="btn" :disabled="disableApplyTypeStringBtn" @click="applyAutofilter()">Применить</button>
                <button class="btn-outline" :disabled="disableClearTypeStringBtn" @click="clearAutofilter()">Сбросить</button>
            </div>
        </div>
        <div class="autofilter__number-type number-type-autofilter" v-else-if="fieldType === EnumTypeField.Number">
            <div class="number-type-autofilter__between-rule number-type-between-rule" v-if="appliedRule === EnumRuleAutofilter.between">
                <q-range
                    @pan="panRange()"
                    v-model="numberRange"
                    :min="0"
                    :max="1_000_000"
                    :step="1"
                    label-always
                    color="blue-14"
                    class="number-type-between-rule__range"
                />
                <div class="number-type-between-rule__inputs">
                    <q-input 
                        class="number-type-between-rule__input"
                        type="number"
                        outlined 
                        v-model="numberRange.min"
                        dense 
                        color="blue-14"
                        label="от"
                        label-color="#817e7e"
                        bg-color="white"
                        min="0"
                    >
                        <template v-slot:prepend>
                            <q-icon name="numbers" />
                        </template>
                    </q-input>
                    <q-input 
                        class="number-type-between-rule__input"
                        type="number"
                        outlined 
                        label="до"
                        v-model="numberRange.max"
                        dense 
                        color="blue-14"
                        label-color="#817e7e"
                        bg-color="white"
                        min="0"
                        
                    >
                        <template v-slot:prepend>
                            <q-icon name="numbers" />
                        </template>
                    </q-input>
                </div>
            </div>
            <div class="number-type-autofilter__default-rule number-type-default-rule" v-else>
                <div class="number-type-autofilter__input">
                    <q-input 
                        type="number"
                        outlined 
                        v-model="numberText"
                        dense 
                        :label="appliedRule.toLocaleLowerCase()"
                        color="blue-14"
                        bg-color="white"
                        min="0"
                        :step="stepNumberInput"
                    >
                        <template v-slot:prepend>
                            <q-icon name="numbers" />
                        </template>
                    </q-input>
                </div>
                <div class="number-type-autofilter__step-select">
                    <q-select
                        style="width: 140px; right: 0;position: absolute;"
                        outlined
                        label-color="#817e7e"
                        filled 
                        v-model="stepNumberInput" 
                        :options="stepsNumberInput"  
                        label="шаг" 
                        dense 
                        options-dense 
                        color="blue-14"
                        @focus="focusSelect()"
                        @blur="blurSelect()"
                    />
                </div>
            </div>  
            <div class="number-type-autofilter__actions">
                <button class="btn" :disabled="disableApplyTypeNumberBtn" @click="applyAutofilter()">Применить</button>
                <button class="btn-outline" :disabled="disableClearTypeStringBtn" @click="clearAutofilter()">Сбросить</button>
            </div>
        </div>
        <div class="autofilter__data-type" v-else-if="fieldType === EnumTypeField.Date">
            <TheAutofilterDateType 
                :values="values"
                :applied="applied"
                :appliedRule="appliedRule"
                @applyDateTypeAutofilter="applyDateTypeAutofilter"
                @clearDateTypeAutofilter="clearAutofilter()"
            >
            </TheAutofilterDateType>
        </div>
        <div class="autofilter__other-type" v-else>
          <span>Неопознанный тип </span>
        </div>
        
    </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import {IAutofilter} from '../types/AutofilterTypes'
import {ref, computed, watch, defineEmits, watchEffect, defineProps} from 'vue'
import {EnumRuleAutofilter, EnumTypeField, EnumStepNumberInput} from '../enums/EnumsByFilter'
import TheAutofilterDateType from './TheAutofilterDateType.vue'

type TypeValue = {
    selected: boolean,
    value: any
}
const props = defineProps<{
    valuesAutofilter: any[],
    applliedAutofilter: boolean | null
}>()

const emit = defineEmits(['sort', 'updateAfterClearAutofilter'])
const store = useStore()

//let valuesDateAutofilter = ref<any[]>([])
let fieldType = ref<EnumTypeField>(EnumTypeField.String)
let columnName = ref<string>('')
let selectedAll = ref(false)  
let applied = ref<boolean | null>(false)
let columnNum = ref(-1)
let filterValues = ref<any[]>([])
let rules = ref<EnumRuleAutofilter[]>([]) 
let appliedRule = ref<EnumRuleAutofilter>(EnumRuleAutofilter.equally)
let values = ref<TypeValue[] | any>([]) 
let searchValues = ref<TypeValue[]>([])  
let searchText = ref<string>('')
let numberText = ref<number>(0)
let stepNumberInput = ref<EnumStepNumberInput[]>([EnumStepNumberInput.Hundred])
let stepsNumberInput = ref<EnumStepNumberInput[]>([EnumStepNumberInput.One, EnumStepNumberInput.Ten, EnumStepNumberInput.Hundred, EnumStepNumberInput.Thousand])
let numberRange = ref({min: 0, max: 1_000_000_000})

const thereIsAnActiveFastFilter = computed(() => store.getters.thereIsAnActiveFastFilter)

const disableClearTypeStringBtn = computed<boolean>(() => {
    //заморозить кнопку сброса если автофильтр не применен и есть примененный быстрый фильтр 
    if (thereIsAnActiveFastFilter.value === true || applied.value === false) {
        return true
    } else {
        return false
    }
})

const disableApplyTypeStringBtn = computed<boolean>(() => {
    //если кол-во значений больше или равно 1 или если выбранны все (ТЕКСТ)
    let countSelectedValuesLength = values.value.filter((el: TypeValue) => el.selected === true).length
    if (values.value.length <= 1 || countSelectedValuesLength === values.value.length || countSelectedValuesLength === 0 || thereIsAnActiveFastFilter.value === true) {
      return true
    }
    
    return false
})

const disableApplyTypeNumberBtn = computed<boolean>(() => {
    if (thereIsAnActiveFastFilter.value === true) {
        //если есть быстрый фильтр , то раззаморозить кнопку
        return true
    } else if (appliedRule.value === EnumRuleAutofilter.between && numberRangeApplyable.value !== true) {
        //если правило Между и numberRange валидный , то раззаморозить кнопку
        return true
    } else if (appliedRule.value !== EnumRuleAutofilter.between && Number(numberText.value) === 0 ) {
        //если правило не Между и переменная 0 , то заморозить кнопку
      return true
    } else {
      return false
    }
})

const numberRangeApplyable = computed<boolean>(() => {
    //возможно ли применить numberRange
    
    if (numberRange.value.max === 0 || numberRange.value.max === numberRange.value.min || numberRange.value.max < numberRange.value.min) {
        console.log('numberRange.value.max', numberRange.value.max)
       return false
    } else {
        return true
    }
})

let selectedColumn = computed(() => store.getters.selectedColumn)

watch(selectedColumn, (newValue: number) => {
    clearData()

    let autofilterByColNum: IAutofilter = store.getters.autofilterByColNum(newValue)
    
    columnNum.value = autofilterByColNum.columnNum
    fieldType.value = autofilterByColNum.fieldType
    columnName.value = autofilterByColNum.columnName
    applied.value = autofilterByColNum.applied
    rules.value = autofilterByColNum.rules
    appliedRule.value = autofilterByColNum.appliedRule
    filterValues.value = autofilterByColNum.filterValues

    if (autofilterByColNum.fieldType === EnumTypeField.Number) {
        values.value = autofilterByColNum.values
        numberRange.value.min = autofilterByColNum.values[0]
        numberRange.value.max = autofilterByColNum.values[1]
    } else if (autofilterByColNum.fieldType === EnumTypeField.Date) {
        values.value = autofilterByColNum.values
        
    } else {
        values.value = autofilterByColNum.values.map((value: any) => ({selected: false, value}))
    }
    
}, {deep: true})

watch(appliedRule, (newValue: EnumRuleAutofilter) => {
    store.dispatch('disallowCloseableAutofilter')
})

watch(searchText, (newValue: string) => {
    let text = newValue.toLowerCase()

    searchValues.value = values.value.filter((item: TypeValue) => {
        if (item.value.toLowerCase().includes(text)) {
            return item
        }
    })
})

watchEffect(() => {
    switch (fieldType.value) {
        case EnumTypeField.Number:
            values.value = props.valuesAutofilter
            break
        case EnumTypeField.String:
            values.value = props.valuesAutofilter.map((value: any) => ({selected: false, value}))
            break
        case EnumTypeField.Date:
            values.value = props.valuesAutofilter
            break
    }
},{  flush: 'sync'})

watchEffect(() => {
    applied.value = props.applliedAutofilter   
})

watchEffect(() => {
    searchValues.value.length ? 
    searchValues.value.every((item: TypeValue) => item.selected === true) ? selectedAll.value = true : selectedAll.value = false:
    values.value.every((item: TypeValue) => item.selected === true) ? selectedAll.value = true : selectedAll.value = false
})

function clearData() {
    searchText.value = ''
    searchValues.value = []
}

function selectAll() {
    if (searchValues.value.length) {
        selectedAll.value === true ? searchValues.value.forEach((col: TypeValue)=> col.selected = true) : searchValues.value.forEach((col: TypeValue)=> col.selected = false)
    } else {
        selectedAll.value === true ? values.value.forEach((col: TypeValue)=> col.selected = true) : values.value.forEach((col: TypeValue)=> col.selected = false)
    }
}

function applyDateTypeAutofilter(filterValues: string[], isRangeRuleType: boolean) {

    const newObjectAutofilter: IAutofilter = {
        fieldType: fieldType.value,
        columnName: columnName.value,
        applied: true,
        values: [],
        filterValues: filterValues,
        rules: rules.value,
        appliedRule: appliedRule.value,
        columnNum: columnNum.value,
        isRangeRuleType: isRangeRuleType
    }

    //обновление МАП по номеру
    store.dispatch('updateObjectAutofilter', newObjectAutofilter)

    applied.value = true

    emit('sort', store.getters.autofilterList)
}
function applyAutofilter() {
    //чистые данные без TypeValue
    let applyValues = values.value.filter((el: TypeValue) => el.selected === true).map((el: TypeValue) => el.value)
    // данные с TypeValue
    const applyValuesLocal: TypeValue[] = values.value.filter((el: TypeValue) => el.selected === true)

    let valuesValue;
    switch (fieldType.value) {
        case EnumTypeField.String:
            valuesValue = applyValues
            break
        case EnumTypeField.Number:
            valuesValue = values.value
            if (appliedRule.value === EnumRuleAutofilter.between) {
                valuesValue = [Number(numberRange.value.min), Number(numberRange.value.max)]
            } else {
                valuesValue = [Number(numberText.value), Number(numberText.value)]
            }
            break
        case EnumTypeField.Date:
            //в этой функции не будет обрабатываться case Date (см. ф-ию applyDateTypeAutofilter)
            break
    }
    
    const newObjectAutofilter: IAutofilter = {
        fieldType: fieldType.value,
        columnName: columnName.value,
        applied: true,
        values: valuesValue,
        filterValues: applyValues,
        rules: rules.value,
        appliedRule: appliedRule.value,
        columnNum: columnNum.value,
    }

    //обновление МАП по номеру
    store.dispatch('updateObjectAutofilter', newObjectAutofilter)

    applied.value = true
    
    switch (fieldType.value) {
        case EnumTypeField.String:
            //для чисел настройки отбора фильтра отправлялся в values, для строк в filterValues
            filterValues.value = applyValues
            values.value = applyValuesLocal 
            values.value.forEach((el: TypeValue) => el.selected = false)
            break
        case EnumTypeField.Number:
            //для чисел настройки отбора фильтра отправлялся в values, для строк в filterValues
            filterValues.value = valuesValue
            values.value = valuesValue
            break
        case EnumTypeField.Date:
        //в этой функции не будет обрабатываться case Date (см. ф-ию applyDateTypeAutofilter)
        break
    }
    
    emit('sort', store.getters.autofilterList)
}

function clearAutofilter() {
    applied.value = false

    const newObjectAutofilter: IAutofilter = {
        fieldType: fieldType.value,
        columnName: columnName.value,
        applied: false,
        values: [],
        filterValues: filterValues.value,
        rules: rules.value,
        appliedRule: appliedRule.value,
        columnNum: columnNum.value,
    }

    emit('updateAfterClearAutofilter', newObjectAutofilter)
}

let panableRange = ref(false)
function panRange() {
    panableRange.value = !panableRange.value

    if (panableRange.value === true) {
        store.dispatch('disallowCloseableAutofilter')
    } else {
        store.dispatch('allowCloseableAutofilter')
    }
}
function focusSelect() {
    store.dispatch('disallowCloseableAutofilter')
}
function blurSelect() {
    store.dispatch('allowCloseableAutofilter')
}
</script>

<style>

.number-type-autofilter {
    margin-top: 60px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: space-between;
}
.number-type-autofilter__default-rule, .number-type-autofilter__between-rule {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 60px;
}
.number-type-autofilter__step-select {
    position: relative;
    height: 28px;
}
.number-type-between-rule__input {
  max-width: 140px;
}
.number-type-between-rule__inputs {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.number-type-between-rule__range {
    padding: 0px 15px 0px 15px;
}
.number-type-autofilter__actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid #0000001E;
}
/* .number-type-default-rule, .number-type-default-rule {
    margin-bottom: 60px;
} */

.string-type-autofilter {
    height: 360px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.autofilter {
    max-height: 600px;
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 4px 3px 4px;
}

.string-type-autofilter__actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.string-type-autofilter__list {
    border-top: 1px solid #0000001E;
    border-bottom: 1px solid #0000001E;
    height: 70%;
    overflow-y: auto;
    overflow-X: hidden;
    scrollbar-width: thin;          /* "auto" или "thin"  */
    scrollbar-color: #d8d8d9 rgb(255, 255, 255);   /* плашка скролла и дорожка */ 
}

.string-type-autofilter__item:hover {
   background-color: #ffffff !important;
}

.string-type-autofilter__item-label {
  color: #817e7e !important;
  color: var(--main-text-color) !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  width: 210px;
}


</style>