<style scoped>

.story-row {
  min-width: 100%;
  height: 98% !important;
}
.story-row__body {
  position: relative;
  padding-bottom: 15px;
  height: 100% !important;
  display: grid !important;
  grid-template-rows: 10% 90% !important;
}

.story-row__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}
.story-row__header-separator {
  position: absolute;
  bottom: 15px;
  width: calc(100% - 30px);
}

.story-row__table-section {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 15px;
  padding: 0px 30px 0px 15px !important;
  margin: 0 !important;
}
.qtable {
  border: 2px solid var(--table-grey-color) !important;
  box-shadow: none !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
 
}
#tooltip-text-story-table {
  background-color: white;
  color: var(--hs-th-color);
  font-size: 15px;
	font-family: 'Roboto400' !important;
	letter-spacing: 0.2px !important;
  padding: 10px;
	border:3px solid var(--table-grey-color);
	line-height: normal;
  z-index: 100 !important;
  position: fixed;
  display: none;
  width: auto;
  height: auto;
  white-space: normal !important;
   
}
.story-row__comments-block {
  width: 100%;
  border: 2px solid var(--table-grey-color) !important;
  padding: 5px;
  display: grid;
  grid-template-rows:  5% 75% 20% !important;
  
}
.comments-block__comments {
  overflow: auto;
  max-height: 600px;
  border-top: 1px solid var(--table-grey-color) !important;
  border-bottom: 1px solid var(--table-grey-color) !important;
}
.comments-block__actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}
.comments-block__comment {
  font-family: Roboto400 !important;
}
.comments-block__comment-name {
  font-weight: bold !important;
}
.comments-block__text-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: end;

}
.comments-block__text-editor textarea {
  border: 2px solid var(--table-grey-color) !important;
  width: 100%;
  resize: none;
  padding: 5px;
  min-height: 100px !important;
  
}

.story-row__table-slot-top {
  padding-bottom: 15px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  min-width: 100%;
}

.story-row__table-slot-top-selects {
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
}
.story-row__table-slot-top-actions {
  overflow: hidden;
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.q-select-story-table-slot-top {
  min-width: 200px !important;
  display: flex;
  flex-direction: row;
}

.comments-block__actions-chip {
  cursor: pointer;
  border-radius: 0% !important;
  border: 2px solid var(--table-grey-color) !important;
  background-color: #eceff1 !important;
  color: black !important;
}

.chat-default-slot {
  border-top: 1px solid var(--table-grey-color);
  border-right: 1px solid var(--table-grey-color);
  padding: 2px 5px 0 2px;
  background-color: #eceff14e !important;
}

.chat-default-slot-bysend {
  border-top:1px solid var(--table-grey-color);
  border-left: 1px solid var(--table-grey-color);
  padding: 2px 5px 0 2px;
  background-color: rgba(151, 239, 163, 0.577) !important;
}

.chat-default-slot > span, .chat-default-slot-bysend > span {
 font-family: Roboto400;
 letter-spacing: 0.2px;
}

.chat-stamp-slot {
  color: #474a51;
  border-bottom: 1px solid var(--table-grey-color);
  margin-top: -5px !important;
  padding: 7px 2px 0 2px;
  border-right: 1px solid var(--table-grey-color);
  background-color: #eceff1ae !important;
}

.chat-stamp-slot-bysend {
  background-color: rgb(151, 239, 162) !important;
  color: #474a51;
  border-bottom: 1px solid var(--table-grey-color);
  margin-top: -5px !important;
  padding: 7px 2px 0 2px;
  border-left: 1px solid var(--table-grey-color);
}

.chat-name-slot {
  font-family: Ubuntu400;
  font-weight: bold;
  color: #3b3737;
  font-size: 13px;
  letter-spacing: 0.3px;
}
</style>

<template>
    <div class="story-row">
        <q-card  class="story-row__body">
            <q-card-section class="story-row__header">
                <div class="text-h6">Работа с версиями строк</div>
                <q-btn flat round dense icon="close" v-close-popup />
                <q-separator class="story-row__header-separator"/>
            </q-card-section>
            
            <q-card-section class="q-pt-none story-row__table-section">
                <q-table
                :key="keyTable"
                  :rows="rowsStoryTable"
                  :columns="columns"
                  row-key="name"
                  class="qtable"
                  rows-per-page-label="Строк на странице"
                  :pagination="paginationSettings"
                >
                  <template v-slot:body="props">
                      <q-tr :props="props" @click="onRowClick(props.row)" :style="{ 'background-color': props.row.iteration === selectedRow  ? '#def1ee': 'white' }" style="cursor: pointer;">
                        <q-td style="width: 10px">
                          <q-btn size="sm" round color="primary" icon="compare" @click.stop="showCompareForm(props.row)"/>
                          <q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
                            <span class="cursor-carret_none">Сравнить значения</span><br/>
                          </q-tooltip>
                        </q-td>
                        <q-td :id="`id-td-iteration-${props.rowIndex}`" key="iteration" :props="props" @mouseover="mouseoverTd(props.row, 'iteration', props.rowIndex)">
                          {{ props.row.iteration }}
                        </q-td>
                        <q-td :id="`id-td-field-${props.rowIndex}`" key="field" :props="props" @mouseover="mouseoverTd(props.row.field, 'field', props.rowIndex)">
                          {{ props.row.field }}
                        </q-td>
                        
                        <q-td :id="`id-td-oldValue-${props.rowIndex}`" style="background-color: #ffebe9" key="oldValue" :props="props" @mouseover="mouseoverTd(props.row.oldValue, 'oldValue', props.rowIndex)">
                          <span v-if="props.row.typeField === EnumTypeFieldByValue.Cost" style="font-weight: 600; color: #f87c75">{{ new Intl.NumberFormat("ru", { style: 'currency', currency: 'RUB' }).format(props.row.oldValue ) }}</span>
                          <span v-else-if="props.row.typeField === EnumTypeFieldByValue.Default" style="font-weight: 600; color: #f87c75">{{ props.row.oldValue }}</span>
                        </q-td>
                        <q-td :id="`id-td-newValue-${props.rowIndex}`" style="background-color: #dff1c7" key="newValue" :props="props" @mouseover="mouseoverTd(props.row.newValue, 'newValue', props.rowIndex)">
                          <span v-if="props.row.typeField === EnumTypeFieldByValue.Cost" style="font-weight: 600; color: rgb(113, 188, 2)">{{ new Intl.NumberFormat("ru", { style: 'currency', currency: 'RUB' }).format(props.row.newValue ) }}</span>
                          <span v-else-if="props.row.typeField === EnumTypeFieldByValue.Default" style="font-weight: 600; color: rgb(113, 188, 2)">{{ props.row.newValue }}</span>
                        </q-td>
                        <q-td :id="`id-td-time-${props.rowIndex}`" key="time" :props="props" @mouseover="mouseoverTd(props.row.time, 'time', props.rowIndex)">
                          {{ props.row.time }}
                        </q-td>
                        <q-td :id="`id-td-author-${props.rowIndex}`" key="author" :props="props" @mouseover="mouseoverTd(props.row.author, 'author', props.rowIndex)">
                          {{ props.row.author }}
                        </q-td>
                        <q-td :id="`id-td-comment-${props.rowIndex}`" key="comment" :props="props" @mouseover="mouseoverTd(props.row.comment, 'comment', props.rowIndex)">
                          {{ props.row.comment }}
                        </q-td>
                      </q-tr>
                  </template>
                  <template v-slot:top >
                    <div class="story-row__table-slot-top">
                      <div class="story-row__table-slot-top-selects">
                        <q-select
                          use-chips
                          stack-label
                          label="Поле"
                          v-model="modelSelectField"
                          outlined
                          dense
                          :options="[...new Set(rowsStoryTable.map((r: IStoryRow) =>r.field))]"
                          option-value="name"
                          class="q-select-story-table-slot-top"
                        />
                        <q-select
                          use-chips
                          stack-label
                          label="Автор"
                          v-model="modelSelectAuthor"
                          outlined
                          dense
                          :options="[...new Set(commentsList.map((r: ICommentRow) =>r.name))]"
                          option-value="name"
                          class="q-select-story-table-slot-top"
                        />
                      </div>
                      <div class="story-row__table-slot-top-actions">
                        <button :disabled="true" class="btn">Отфильтровать</button>
                        <div>
                          <q-btn style="box-shadow: none !important;" size="md" round color="primary" icon="refresh" />
                          <q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
                            <span class="cursor-carret_none">Актуализировать данные</span><br/>
                          </q-tooltip>
                        </div>
                      </div>
                    </div>
                  </template>
                </q-table>
                <div id="tooltip-text-story-table"></div>
                <div class="story-row__comments-block comments-block">
                    <div class="comments-block__actions q-gutter-xs">
                      <div :key="keyChips">
                        <q-chip @click.capture="selectChip('all')" :style="styleChipByAll" :v-model="chipActivities.all"  class="comments-block__actions-chip" square color="primary" text-color="white">
                          Все
                        </q-chip>
                        <q-chip @click.capture="selectChip('my')" :v-model="chipActivities.my" class="comments-block__actions-chip" square color="primary" text-color="white" :style="styleChipByMy" >
                          Мои
                        </q-chip>
                        <q-chip @click.capture="selectChip('another')" :v-model="chipActivities.another" class="comments-block__actions-chip" square color="primary" text-color="white" :style="styleChipByAnother" >
                          Не мои
                        </q-chip>
                        <q-chip 
                          @click.capture="selectChip('currentIter')"
                          :style="styleChipByCurrentIter" 
                          :v-model="chipActivities.currentIter"
                          class="comments-block__actions-chip"
                          v-if="selectedRow !== null" 
                          square 
                          :disable="selectedRow !== null ? false : true" 
                          color="primary" 
                          text-color="white">
                          Все ({{ selectedRow }})
                        </q-chip>
                        <q-chip 
                          @click.capture="selectChip('currentIterMy')"
                          :style="styleChipByCurrentIterMy" 
                          :v-model="chipActivities.currentIterMy"
                          class="comments-block__actions-chip"
                          v-if="selectedRow !== null" 
                          square 
                          :disable="selectedRow !== null ? false : true" 
                          color="primary" 
                          text-color="white">
                          Мои ({{ selectedRow }}) 
                        </q-chip>
                        <q-chip 
                          @click.capture="selectChip('currentIterAnother')"
                          :style="styleChipByCurrentIterAnother" 
                          :v-model="chipActivities.currentIterAnother"
                          class="comments-block__actions-chip"
                          v-if="selectedRow !== null" 
                          square 
                          :disable="selectedRow !== null ? false : true" 
                          color="primary" 
                          text-color="white">
                          Не мои ({{ selectedRow }}) 
                        </q-chip>
                      </div>
                      <div>
                        <q-btn style="box-shadow: none !important;" size="sm" round color="primary" icon="refresh" />
                          <q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
                            <span class="cursor-carret_none">Актуализировать комментарии</span><br/>
                          </q-tooltip>
                      </div>
                    </div>
                    
                    <div class="comments-block__comments scrollbar-custom" id="comments-block">
                        <q-chat-message
                          v-for="(comment, i) in (chipActivities.all === true ? commentsList : commentsListFiltered)"
                          :key="i"
                          :stamp="comment.time"
                          :name="`<span style='font-weight: bold; color: #474a51'; >${comment.name === myNameLocal ? 'Вы' : comment.name }</span>`"
                          :avatar="comment.name === myNameLocal ? undefined : comment.avatar"
                          :text="comment.text"
                          :text-color="comment.name === myNameLocal ? 'black': 'black'"
                          :bg-color="comment.name === myNameLocal ? 'white': 'white'"
                          name-html
                          text-html
                          style="padding-right: 8px !important;"
                          class="comments-block__comment"
                          :sent="comment.name === myNameLocal"
                        >
                        
                          <template v-slot:default>
                            <div v-if="comment.name !== myNameLocal" class="chat-default-slot">
                              <span v-html="comment.text[0].split('</strong>')[0]"></span>
                              <span>{{ comment.text[0].split('</strong>')[1] }}</span>
                            </div>
                            <div v-else class="chat-default-slot-bysend">
                              <span v-html="comment.text[0].split('</strong>')[0]"></span>
                              <span>{{ comment.text[0].split('</strong>')[1] }}</span>
                            </div>
                          </template>
                          <template v-slot:stamp>
                            <div v-if="comment.name !== myNameLocal" class="chat-stamp-slot">
                            {{ comment.time }}
                            </div>
                            <div v-else class="chat-stamp-slot-bysend">
                            {{ comment.time }}
                            </div>
                          </template>
                          <template v-slot:name>
                            <div class="chat-name-slot">
                            {{ comment.name === myNameLocal ? 'Вы' : comment.name  }}
                            </div>
                          </template>
                        
                      </q-chat-message>
                    </div>
                    <div class="comments-block__text-editor">
                        <textarea
                            v-model="textValueEditor"
                            :disabled="disabledBtnSendRemark"
                            :placeholder="`Ваш комментарий изменения ${selectedRow !== null ? 'для '+selectedRow : ''}`"
                        ></textarea>
                        <button :disabled="disabledBtnSendRemark" class="btn" @click="sendComment()">Отправить</button>
                    </div>
                </div>
            </q-card-section>
      </q-card>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits , defineProps, onMounted, nextTick, reactive} from 'vue';
import { useStore } from 'vuex'
import {EnumTypeFieldByValue} from '../enums/EnumsCommon'

const commentsListFiltered = computed<ICommentRow[]>(() => {
let commentsListLocal = [...commentsList.value] as ICommentRow[]
  if (chipActivities.my === true) {
    return commentsListLocal.filter((el: ICommentRow) => el.name === myNameLocal.value)
  } else if (chipActivities.another === true) {
    return commentsListLocal.filter((el: ICommentRow) => el.name !== myNameLocal.value)
  } else if (chipActivities.currentIter === true) {
    return commentsListLocal.filter((el: ICommentRow) => el.iteration === selectedRow.value)
  } else if (chipActivities.currentIterMy === true) {
    return commentsListLocal.filter((el: ICommentRow) => el.iteration === selectedRow.value && el.name === myNameLocal.value)
  } else if (chipActivities.currentIterAnother === true) {
    return commentsListLocal.filter((el: ICommentRow) => el.iteration === selectedRow.value && el.name !== myNameLocal.value)
  } else {
    return []
  }
})
const styleChipByAll = computed<any[]>(() => {
  return [
    { 'background-color': chipActivities.all === true  ? 'white !important': '#eceff1 !important'}, 
    {'border': chipActivities.all === true  ? '2px solid #1976d2 !important': '2px solid #eceff1 !important' }
  ]
})
const styleChipByMy = computed<any[]>(() => {
  return [
    { 'background-color': chipActivities.my === true  ? 'white !important': '#eceff1 !important'}, 
    {'border': chipActivities.my === true  ? '2px solid #1976d2 !important': '2px solid #eceff1 !important' }
  ]
})
const styleChipByAnother = computed<any[]>(() => {
  return [
    { 'background-color': chipActivities.another === true  ? 'white !important': '#eceff1 !important'}, 
    {'border': chipActivities.another === true  ? '2px solid #1976d2 !important': '2px solid #eceff1 !important' }
  ]
})
const styleChipByCurrentIter = computed<any[]>(() => {
  return [
    { 'background-color': chipActivities.currentIter === true  ? 'white !important': '#eceff1 !important'}, 
    {'border': chipActivities.currentIter === true  ? '2px solid #1976d2 !important': '2px solid #eceff1 !important' }
  ]
})
const styleChipByCurrentIterMy = computed<any[]>(() => {
  return [
    { 'background-color': chipActivities.currentIterMy === true  ? 'white !important': '#eceff1 !important'}, 
    {'border': chipActivities.currentIterMy === true  ? '2px solid #1976d2 !important': '2px solid #eceff1 !important' }
  ]
})
const styleChipByCurrentIterAnother = computed<any[]>(() => {
  return [
    { 'background-color': chipActivities.currentIterAnother === true  ? 'white !important': '#eceff1 !important'}, 
    {'border': chipActivities.currentIterAnother === true  ? '2px solid #1976d2 !important': '2px solid #eceff1 !important' }
  ]
})
const store = useStore()
const chipActivities: any = reactive({all: true, my: false, another: false, currentIter: false,currentIterMy: false, currentIterAnother: false, })
//выбранная итерация
let selectedRow = ref<any>(null)

export interface IStoryRow {
  id?: string,
  typeField: EnumTypeFieldByValue,
  iteration: string,
  field: string,
  newValue: number | string | null,
  oldValue: number | string | null,
  time: string,
  author: string,
  comment: string
}  

interface ICommentRow {
  iteration: string,
  time: string,
  name: string,
  avatar: string,
  text: string[]
} 

const emit = defineEmits(['closeDialog', 'showCompareForm'])
const props = defineProps<{idRow: string}>()

onMounted(() => {
  const commentsBlock: HTMLDivElement = document.getElementById("comments-block") as HTMLDivElement
  commentsBlock.scrollTop = commentsBlock.scrollHeight;
})

const commentsList = ref<ICommentRow[]>([
  { time: '2024-05-07 11:44', name: 'Иванова Наталья Александровна',avatar: "https://cdn.quasar.dev/img/avatar2.jpg", iteration: 'Итер. 6', text: [`<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 6</strong> Поле измененено после замечаний от 2014.04.12', 'Поле измененено после замечаний от 2014.04.22`] },
  { time: '2024-04-03 11:44', name: 'Петрова Анна Викторовна',avatar: "https://cdn.quasar.dev/img/avatar3.jpg",  iteration: 'Итер. 9',text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 9</strong> Изменения в соответствии с замечаниями'] },
  { time: '2024-05-30 22:10', name: 'Чернов Сергей Дмитриевич',avatar: "https://cdn.quasar.dev/img/avatar4.jpg",  iteration: 'Итер. 10',text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 10</strong> Прошлое изменение было некорректным'] },
  { time: '2023-05-11 10:44', name: 'Сидорова Ирина Александровна',avatar: "https://cdn.quasar.dev/img/avatar5.jpg", iteration: 'Итер. 11', text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 11</strong> Новое значение после пересмотра'] },
  { time: '2023-05-06 11:33', name: 'Смирнова Полина Антоновна',avatar: "https://cdn.quasar.dev/img/avatar6.jpg",  iteration: 'Итер. 12',text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 12</strong>вввввввввввввввввввввввввввввввввв вввввввввввввввввввввввввввввввввввв вввввввввввввввввввввв'] },
  { time: '2023-04-05 00:23', name: 'Чернов Игорь Мизайлович',avatar: "https://cdn.quasar.dev/img/avatar1.jpg",  iteration: 'Итер. 13',text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 13</strong> Новое значение после пересмотра'] },
  { time: '2023-03-04 14:52', name: 'Иванова Наталья Александровна',avatar: "https://cdn.quasar.dev/img/avatar2.jpg",  iteration: 'Итер. 14',text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 14</strong> Была ошибка'] },
  { time: '2023-02-07 12:22', name: 'Петрова Анна Викторовна',avatar: "https://cdn.quasar.dev/img/avatar3.jpg",  iteration: 'Итер. 14',text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 14</strong> Новое исправление'] },
  { time: '2023-01-03 08:12', name: 'Чернов Сергей Дмитриевич',avatar: "https://cdn.quasar.dev/img/avatar4.jpg", iteration: 'Итер. 15', text: ['<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">Итер. 15</strong> Изменения в соответствии с замечаниями 4'] },
])

const paginationSettings = ref<any>({
  descending: false,
  rowsPerPage: 10
})

let textValueEditor = ref<string>('')
let myNameLocal = ref<string>('Чернов Сергей Дмитриевич')
let myAvatar = ref<string>('https://cdn.quasar.dev/img/avatar4.jpg')
let clickedRow = ref<IStoryRow | null>(null)

//модели селекта
const modelSelectAuthor = ref<string[] | null>(null)
const modelSelectField = ref<string[] | null>(null)

const disabledBtnSendRemark = computed(() => {
  if (clickedRow.value?.author !== myNameLocal.value || clickedRow.value === null) {
    return true
  }

  return false
})

function showCompareForm(row: IStoryRow) {
  emit('showCompareForm', row)
}

function sendComment() {
  if (clickedRow.value === null) return

  let newComment: ICommentRow = {
    iteration: clickedRow.value.iteration,
    time: `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString('ru-RU', {timeZone: 'Asia/Yekaterinburg'})}`,
    name: myNameLocal.value,
    avatar: myAvatar.value,
    text: [`<strong style="background-color: yellow;color: #474a51;padding: 1px 2px">${clickedRow.value.iteration}</strong> ${textValueEditor.value}`]
  }

  commentsList.value.push(newComment)

  nextTick(() => {
    const commentsBlock: HTMLDivElement = document.getElementById("comments-block") as HTMLDivElement
    commentsBlock.scrollTop = commentsBlock.scrollHeight;
  })

  textValueEditor.value = ''

  const idx: number = [...rowsStoryTable].findIndex((row: IStoryRow) => row.iteration === newComment.iteration) 
  const changedRow: IStoryRow = [...rowsStoryTable].find((row: IStoryRow) => row.iteration === newComment.iteration) as IStoryRow
  changedRow.comment = newComment.text[0].split('</strong>')[1]
  rowsStoryTable[idx] = changedRow
}
const columns = ref<any>([
  {
    name: 'id',
    label: '#',
    field: 'id', align: 'center', headerClasses:'tdHeaderClassByTable', classes: 'tdClassByTable'
  },
  { name: 'iteration',label: 'Итерация', required: true,align: 'left', field: 'iteration', headerClasses:'tdHeaderClassByTable', classes: 'tdClassByTable'},
  { name: 'field',label: 'Поле', required: true,align: 'left', field: 'field',headerClasses:'tdHeaderClassByTable', classes: 'tdClassByTable'},
  { name: 'oldValue', label: 'Прошлое значение', field: 'oldValue', align: 'left', headerClasses:'tdHeaderClassByTable' },
  { name: 'newValue', label: 'Новое значение', field: 'newValue', align: 'left',headerClasses:'tdHeaderClassByTable' },
  { name: 'time', label: 'Время', field: 'time', align: 'left', headerClasses:'tdHeaderClassByTable', classes: 'tdClassByTable' },
  { name: 'author', label: 'Автор', field: 'author', align: 'left',headerClasses:'tdHeaderClassByTable', classes: 'tdClassByTable'},
  { name: 'comment', label: 'Комментарий', field: 'comment', align: 'left', headerClasses:'tdHeaderClassByTable', classes: 'tdClassByTable' }
])

const rowsStoryTable = reactive<IStoryRow[]>([
  {
    typeField: EnumTypeFieldByValue.Default,
    iteration: 'Итер. 15',
    field: 'Наименование',
    newValue: "1. «Какодилатный глаз», «Какодилатное око» (фр. L'Œil cacodylate) — картина французского художника-авангардиста Франсиса Пикабиа. \n 2. Cозданная в 1921 году под влиянием реди-мейдов Марселя Дюшана, а также дадаистских коллажей. \n 3. Работа над ней началась с того, что Пикабиа нарисовал большой раскрытый глаз на чистом холсте. \n 4. В левом нижнем углу он подписался «FRANCIS PICABIA» и поставил дату — «1921». Вверху он нанёс название — «L’OEIL CACODYLATE».\n 5. После этого он попросил своих знакомых из числа парижской художественной богемы поучаствовать в создании полотна. В общей сложности на его просьбу откликнулось более пятидесяти представителей авангарда, \n  6. которые поместили на неё свои автографы.",
    oldValue: "«Какодилатный глаз», «Какодилатное око» (фр. L'Œil cacodylate) — картина французского художника-авангардиста Франсиса Пикабиа, созданная в 1921 году под влиянием реди-мейдов Марселя Дюшана, а также дадаистских коллажей. Работа над ней началась с того, что Пикабиа нарисовал большой раскрытый глаз на чистом холсте. В левом нижнем углу он подписался «FRANCIS PICABIA» и поставил дату — «1921». Вверху он нанёс название — «L’OEIL CACODYLATE». После этого он попросил своих знакомых из числа парижской художественной богемы поучаствовать в создании полотна. В общей сложности на его просьбу откликнулось более пятидесяти представителей авангарда, которые поместили на неё свои автографы.",
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: '<strong>Did it work?</strong> Изменения в соответствии с замечаниями 15 Изменения в соответствии с замечаниями 15 Изменения в соответствии с замечаниями 15 Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15Изменения в соответствии с замечаниями 15'
  },
  {
    typeField: EnumTypeFieldByValue.Default,
    iteration: 'Итер. 14',
    field: 'Наименование',
    newValue: 'Сегодня вы с нами немного коснемся темы оформления текстов на вашем суперсайте.',
    oldValue: 'Сегодня мы с вами немного коснемся темы оформления текстов на вашем сайте. <br> Создавая сайт и ведя <br> уже существующий, нужно грамотно по вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде. вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде. вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде. вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встреча вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде. вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде. вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде. вашем сайте. Создавая сайт и ведя уже существующий, нужно грамотно подходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде.ю сайты, на которых информация представлена примерно в таком виде.дходить к каждой его мелочи. Я – активный пользователь Интернета, очень часто ищу различную информацию абсолютно по разным темам. Зачастую встречаю сайты, на которых информация представлена примерно в таком виде. ',
    time: '2023-01-03 08:12',
    author: 'Иванова Наталья Александровна',
    comment: 'Изменения в соответствии с замечаниями 14'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 13',
    field: 'Стоимость',
    newValue: 99555,
    oldValue: 100078,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 13'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 12',
    field: 'Стоимость',
    newValue: 100078,
    oldValue: 88765,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: ''
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 11',
    field: 'Стоимость',
    newValue: 88765,
    oldValue: 99787,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: ''
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 10',
    field: 'Стоимость',
    newValue: 99787,
    oldValue: 100078,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 9',
    field: 'Стоимость',
    newValue: 100078,
    oldValue: 100000,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: ''
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 8',
    field: 'Стоимость',
    newValue: 100000,
    oldValue: 99078,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 7',
    field: 'Стоимость',
    newValue: 99078,
    oldValue: 100078,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 6',
    field: 'Стоимость',
    newValue: 100078,
    oldValue: 44555,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 5',
    field: 'Стоимость',
    newValue: 44555,
    oldValue: 44534,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 4',
    field: 'Стоимость',
    newValue: 44534,
    oldValue: 65444,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 3',
    field: 'Стоимость',
    newValue: 65444,
    oldValue: 76000,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 2',
    field: 'Стоимость',
    newValue: 76000,
    oldValue: 87678,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
  {
    typeField: EnumTypeFieldByValue.Cost,
    iteration: 'Итер. 1',
    field: 'Стоимость',
    newValue: 87678,
    oldValue: 87000,
    time: '2023-01-03 08:12',
    author: 'Чернов Сергей Дмитриевич',
    comment: 'Изменения в соответствии с замечаниями 5'
  },
])

function onRowClick(rowValues: IStoryRow) {
  clickedRow.value = rowValues

  // потом поменять на id вместо iteration
  selectedRow.value = rowValues.iteration
}

function mouseoverTd(value:any, nameField: string, key: any) {
  const td: HTMLTableCellElement = document.getElementById(`id-td-${nameField}-${key}`) as HTMLTableCellElement;
  const tooltip: HTMLDivElement = document.getElementById('tooltip-text-story-table') as HTMLDivElement

  const canvas: any = document.getElementById('canvas-ht')
  const ctx = canvas.getContext('2d')

  const offsetWidth: number = td.offsetWidth
  const valueWidth: number = ctx.measureText(value).width 

  if (valueWidth > offsetWidth) {
    tooltip.style.display = 'block'
    tooltip.innerText = value
     tooltip.style.top = `${td.getBoundingClientRect().top}px`
    tooltip.style.left = `${td.getBoundingClientRect().right + 2}px`
  } else {
    tooltip.style.display = 'none'
    tooltip.innerText = ''
  }

  td.onmouseout = function () {
    tooltip.style.display = 'none'
    tooltip.innerHTML = ''
  }
}

let keyTable = ref(0)
let keyChips = ref(0)
function selectChip(selectedChipKey: string) {
  Object.keys(chipActivities).forEach(function(key: string){ 
    if (key === selectedChipKey) {
      (chipActivities as any)[key] = true
    } else {
      (chipActivities as any)[key] = false
    }
  });

  keyChips.value++
}

</script>