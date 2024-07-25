<template>
 <div class="date-type-autofilter">
    <div class="date-type-autofilter__input-body">
      <div v-if="isRangeRuleType" class="date-type-autofilter__input-range-rule-body">
        <q-input 
          v-model="dateTextRangeTypeFrom" 
          label="от" 
          dense 
          mask="date" 
          :rules="['date']" 
          outlined  
          :disable="selectFromTree || isRuleTypeWhenAllDisable"
          class="date-type-autofilter__input-range-rule-input"
        >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale" @show="showPopup()" @hide="hidePopup()">
              <q-date v-model="dateTextRangeTypeFrom" :options="optionsByFrom">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Закрыть" color="blue" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input 
        v-model="dateTextRangeTypeTo" 
        label="до" 
        dense 
        mask="date" 
        :rules="['date']" 
        outlined  
        :disable="selectFromTree || isRuleTypeWhenAllDisable"
        class="date-type-autofilter__input-range-rule-input"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale" @show="showPopup()" @hide="hidePopup()">
              <q-date v-model="dateTextRangeTypeTo" :options="optionsByTo">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Закрыть" color="blue" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      </div>
      
      <div v-else>
        <q-input v-model="dateText" label="дата" mask="date" :rules="['date']" outlined dense :disable="selectFromTree || isRuleTypeWhenAllDisable" >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale" @show="showPopup()" @hide="hidePopup()">
                <q-date v-model="dateText" >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Закрыть" color="blue" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <div class="date-type-autofilter__settings">
      <q-btn flat color="blue-14" icon="expand" @click="expandAll()" :disable="!treeValues.length">
        <q-tooltip class="tooltip-el" anchor="top middle" self="bottom middle">Раскрыть дерево</q-tooltip>
      </q-btn>
      <q-btn flat color="blue-14" icon="vertical_align_center" @click="collapseAll()" :disable="!treeValues.length">
        <q-tooltip class="tooltip-el" anchor="top middle" self="bottom middle">Свернуть дерево</q-tooltip>
      </q-btn>
      <q-toggle
        :disable="isRuleTypeWhenAllDisable"
        color="blue-14"
        v-model="selectFromTree" 
        label="Выбирать даты в дереве"
      />
    </div>
    <div class="date-type-autofilter__tree-body">
      <div class="date-type-autofilter__tree">
        <q-tree class="col-12 col-sm-6"
          :nodes="treeValues"
          node-key="id"
          ref="tree"
          default-expand-all
          v-model:ticked="tickedValues"
          @update:ticked="updateTicked()"
          tick-strategy="leaf"
        />
        <div v-if="!selectFromTree || isRuleTypeWhenAllDisable" class="date-type-autofilter__tree-disable" ></div>
        <div v-if="!treeValues.length" class="date-type-autofilter__tree-disable-text">
          <span>Нет данных</span>
        </div>
      </div> 
    </div>
    <div class="date-type-autofilter__actions">
      <button :disabled="thereIsAnActiveFastFilter || !treeValues.length" class="btn"  @click="applyAutofilter()" >Применить</button>
      <button :disabled="disableClearTypeDateBtn" class="btn-outline" @click="clearAutofilter()">Сбросить</button>
    </div>
 </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { ref, inject , computed, watch, defineProps, watchEffect, defineEmits } from 'vue';
import { useStore } from 'vuex'
import {EnumRuleAutofilter} from '../enums/EnumsByFilter'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays , startOfYesterday, startOfTomorrow } from "date-fns";

const tree: any = ref(null);
const store = useStore()
const emit = defineEmits(['applyDateTypeAutofilter', 'clearDateTypeAutofilter'])

type DateTreeType = {
  id: number,
  label: string,
  children: DateTreeType[]
}

const props = defineProps<{
  values: any[],
  appliedRule: EnumRuleAutofilter,
  applied: boolean | null
}>()

let id = ref(0)
let selectFromTree = ref(false)
let tickedValues = ref<string[]>([])

var today = new Date().toLocaleDateString().split('.').reverse().join('/')
var tommorow = startOfTomorrow().toLocaleDateString().split('.').reverse().join('/')

let dateTextRangeTypeFrom = ref<string>(today)
let dateTextRangeTypeTo = ref<string>(tommorow)
let dateText = ref<string>(today)

let treeValues = ref<DateTreeType[]>([])
let mapIndexDate: Map<number, string> = new Map<number, string>()

const thereIsAnActiveFastFilter = computed(() => store.getters.thereIsAnActiveFastFilter)

const isRangeRuleType = computed<boolean>(() => {
  return (
    props.appliedRule === EnumRuleAutofilter.equally ||
    props.appliedRule === EnumRuleAutofilter.after ||
    props.appliedRule === EnumRuleAutofilter.before ||
    props.appliedRule === EnumRuleAutofilter.today ||
    props.appliedRule === EnumRuleAutofilter.tomorrow ||
    props.appliedRule === EnumRuleAutofilter.yesterday
  ) ? false : true
})

const isRuleTypeWhenAllDisable = computed<boolean>(() => {
  return (
    props.appliedRule === EnumRuleAutofilter.today ||
    props.appliedRule === EnumRuleAutofilter.tomorrow ||
    props.appliedRule === EnumRuleAutofilter.yesterday ||
    props.appliedRule === EnumRuleAutofilter.upthisweek ||
    props.appliedRule === EnumRuleAutofilter.thismonth ||
    props.appliedRule === EnumRuleAutofilter.thisyear
  ) ? true : false
})

const disableClearTypeDateBtn = computed<boolean>(() => {
    //заморозить кнопку сброса если автофильтр не применен и есть примененный быстрый фильтр 
    if (thereIsAnActiveFastFilter.value === true || props.applied === false) {
        return true
    } else {
        return false
    }
})

watchEffect(() => {
  let valuesLocal = props.values
  initTree(valuesLocal.map(el => el.split('-').reverse().join('.')))
})

watchEffect(() => {
  
  switch(props.appliedRule) {
    case EnumRuleAutofilter.equally:
      if (selectFromTree.value && tickedValues.value.length) {
        updateTicked()
      } else {
        dateText.value = new Date().toLocaleDateString().split('.').reverse().join('/')
      }
      break
    case EnumRuleAutofilter.after:
      if (selectFromTree.value && tickedValues.value.length) {
        updateTicked()
      } else {
        dateText.value = new Date().toLocaleDateString().split('.').reverse().join('/')
      }
      break
    case EnumRuleAutofilter.before:
      if (selectFromTree.value && tickedValues.value.length) {
        updateTicked()
      } else {
        dateText.value = new Date().toLocaleDateString().split('.').reverse().join('/')
      }
      break
    case EnumRuleAutofilter.today:
        dateText.value = new Date().toLocaleDateString().split('.').reverse().join('/')
      break
    case EnumRuleAutofilter.tomorrow:
      dateText.value = startOfTomorrow().toLocaleDateString().split('.').reverse().join('/')
      break
    case EnumRuleAutofilter.yesterday:
      dateText.value = startOfYesterday().toLocaleDateString().split('.').reverse().join('/')
      break
    case EnumRuleAutofilter.upthisweek:
      dateTextRangeTypeFrom.value = startOfWeek(new Date()).toLocaleDateString().split('.').reverse().join('/')
      dateTextRangeTypeTo.value = endOfWeek(new Date()).toLocaleDateString().split('.').reverse().join('/')
      break
    case EnumRuleAutofilter.thismonth:
      dateTextRangeTypeFrom.value = startOfMonth(new Date()).toLocaleDateString().split('.').reverse().join('/')
      dateTextRangeTypeTo.value = endOfMonth(new Date()).toLocaleDateString().split('.').reverse().join('/')
      break
    case EnumRuleAutofilter.thisyear:
      dateTextRangeTypeFrom.value = startOfYear(new Date()).toLocaleDateString().split('.').reverse().join('/')
      dateTextRangeTypeTo.value = endOfYear(new Date()).toLocaleDateString().split('.').reverse().join('/')
      break
  }
})

function applyAutofilter() {

  if (isRangeRuleType.value) {
    emit('applyDateTypeAutofilter', [dateTextRangeTypeFrom.value, dateTextRangeTypeTo.value], isRangeRuleType)
  } else {
    emit('applyDateTypeAutofilter', [dateText.value, dateText.value], isRangeRuleType.value)
  }

  clearMetaValues()
}

function clearAutofilter() {
  emit('clearDateTypeAutofilter')
  clearMetaValues()
}

function clearMetaValues() {
  mapIndexDate = new Map<number, string>()
  id.value = 0
  tickedValues.value = []
}

function updateTicked() {
  if (tickedValues.value.length && selectFromTree.value === true) {
    getDateFromMapdexDate(tickedValues.value)
  }
}

function getDateFromMapdexDate(tickedValues: string[]) {

  let datesArray: any[] = tickedValues.map((key: string) => new Date( String(mapIndexDate.get(+key))  ) )
  
  const maxDate = new Date(Math.max.apply(null, datesArray))
  const minDate = new Date(Math.min.apply(null, datesArray))

  if (props.appliedRule === EnumRuleAutofilter.between) {
    if (datesArray.length >= 2) {
      //если в дереве выбраны больше двух дат
      dateTextRangeTypeFrom.value = minDate.toLocaleDateString().split('.').reverse().join('/')
      dateTextRangeTypeTo.value = maxDate.toLocaleDateString().split('.').reverse().join('/')
    } else {
      //если в дереве выбрана одна дата, то верхняя граница диапазона будет следующим днем
      dateTextRangeTypeFrom.value = minDate.toLocaleDateString().split('.').reverse().join('/')
      dateTextRangeTypeTo.value = addDays(minDate, 1).toLocaleDateString().split('.').reverse().join('/')
    }
    
  } else {
    dateText.value = maxDate.toLocaleDateString().split('.').reverse().join('/')
  }
}

function initTree(values: any[]) {

  treeValues.value = []

  values.forEach((date: string) => {

    let mounth = ''
    let year: string = date.split('.')[2]
    let preMounth = date.split('.')[1]

    switch (preMounth) {
      case '01': mounth = 'январь'
        break
      case '02': mounth = 'февраль'
        break
      case '03': mounth = 'март'
        break
      case '04': mounth = 'апрель'
        break
      case '05': mounth = 'май'
        break
      case '06': mounth = 'июнь'
        break
      case '07': mounth = 'июль'
        break
      case '08': mounth = 'август'
        break
      case '09': mounth = 'сентябрь'
        break
      case '10': mounth = 'октябрь'
        break
      case '11': mounth = 'ноябрь'
        break
      case '12': mounth = 'декабрь'
        break
    }

    let day: string = date.split('.')[0]

    let dayObject: DateTreeType = { id: id.value++, label: day, children: [] }
    mapIndexDate.set(dayObject.id, date.split('.').reverse().join('/'))

    let mounthObject: DateTreeType = { id: id.value++, label: mounth, children: [dayObject] }
    let yearObject: DateTreeType = { id: id.value++, label: year, children: [mounthObject] }

    if (treeValues.value.length) {
      let isHasYear = checkYear(year)
      if (isHasYear === true) {
        //если есть такой год
        // тогда добавить месяц
        let isHasMounth = checkMounth(year, mounth)

        if (isHasMounth === true) {
          //если есть такой месяц
          let isHasDay = checkDay(year, mounth, day)

          if (isHasDay === true) {
            //если есть такой день
            return
          } else {
            //если нет такого дня
            addDay(year, mounth, dayObject)
          }
        } else {
          //если нет такого месяца
          addMount(year, mounthObject)
        }
      } else {
        //если нет такого года
        if (yearObject)
        treeValues.value.push(yearObject)
      }

    } else {
      if (yearObject)
      treeValues.value.push(yearObject)
    }
  })
}

function addDay(year: string, mounth: string, dayObject: DateTreeType | null) {
  let yearlocal: DateTreeType = treeValues.value.find(date => date.label === year) as DateTreeType
  let mounthlocal: DateTreeType = yearlocal.children.find(mounthlocal => mounthlocal.label === mounth) as DateTreeType

  if (dayObject) mounthlocal.children.push(dayObject)
}

function checkDay(year: string, mounth: string, day: string) {
  let yearlocal: DateTreeType = treeValues.value.find(date => date.label === year) as DateTreeType
  let mounthlocal: DateTreeType = yearlocal.children.find(mounthlocal => mounthlocal.label === mounth) as DateTreeType

  return mounthlocal.children.some(daylocal => daylocal.label === day)
}

function addMount(year: string, mounthObject: DateTreeType | null) {
  let yearlocal: DateTreeType = treeValues.value.find(date => date.label === year) as DateTreeType

  if (mounthObject) yearlocal.children.push(mounthObject)
}

function checkYear(year: string) {
    return treeValues.value.some(yearlocal => yearlocal.label === year)
}
function checkMounth(year: string, mounth: string) {
  let yearlocal: DateTreeType = treeValues.value.find(date => date.label === year) as DateTreeType
  let mounths: DateTreeType[] = yearlocal.children

  return mounths.some(mounthlocal => mounthlocal.label === mounth)
}

function optionsByFrom (date: any) {
  return date < dateTextRangeTypeTo.value
}
function optionsByTo (date: any) {
  return date > dateTextRangeTypeFrom.value
}

function expandAll() {
  tree.value.expandAll();
}
function collapseAll() {
  tree.value.collapseAll();
}

function showPopup() {
  store.dispatch('disallowCloseableAutofilter')
}
function hidePopup() {
  store.dispatch('allowCloseableAutofilter')
}
</script>

<style lang="css">
.date-type-autofilter {
   /*  margin-top: 60px; */
   
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* justify-content: space-between; */
}
.date-type-autofilter__settings {
  margin-top: -22px;
}
.date-type-autofilter__tree {
  overflow-y: auto;
  overflow-X: hidden;
  scrollbar-width: thin;          /* "auto" или "thin"  */
  scrollbar-color: #d8d8d9 rgb(255, 255, 255);   /* плашка скролла и дорожка */ 
  position: relative;
}
.date-type-autofilter__tree-disable {
  position: absolute;
  inset: 0;
  background-color: rgba(237, 237, 237, 0.238);
  cursor: not-allowed;
}

.date-type-autofilter__tree-body {
  border-top: 1px solid #0000001E;
  height: 350px;
  overflow-y: auto;
  overflow-X: hidden;
  scrollbar-width: thin;          /* "auto" или "thin"  */
  scrollbar-color: #d8d8d9 rgb(255, 255, 255);   /* плашка скролла и дорожка */ 
}
.date-type-autofilter__actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #0000001E;
}
.date-type-autofilter__input-range-rule-body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.date-type-autofilter__input-range-rule-input {
  max-width: 140px;
}

.date-type-autofilter__tree-disable-text {
  position: absolute;
  inset: 0;
  background-color: #fff;
  display: grid;
  place-items: center;
}
.date-type-autofilter__tree-disable-text > span {
  color: #a3a5a9;
}
</style>