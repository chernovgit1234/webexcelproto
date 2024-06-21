    <template>
        <div class="table-wrapper">
          <div class="table-wrapper__board">
            <div class="table-wrapper__board-left">
                <span class="table-wrapper__text">Показано строк: {{ countRow }}</span>
            </div>
			<the-fast-filters
				@sort="sort" 
				@resetFastFilter="clearAllFilter()"
			></the-fast-filters>
			
            <div class="table-wrapper__board-right">
				
				<div class="icon-wrapper-with-tooltip" v-if="fastFilterNames.length">
					<img style="width: 100%;height: 100%;" class="cursor-carret_none" src="../assets/icons/filter-edit.svg" @click.stop />
					<q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
						<span class="cursor-carret_none">Управление быстрыми фильтрами</span><br/>
					</q-tooltip>
				</div>
				
				<!-- <q-separator vertical inset style="caret-color: transparent" v-if="fastFilterNames.length"/> -->
				<div class="icon-wrapper-with-tooltip" v-if="thereIsActiveFilters && thereIsAnActiveFastFilter === false">
					<img style="width: 100%;height: 100%;" class="cursor-carret_none" src="../assets/icons/filter-add.svg" @click.stop="addGlobalFilter()"/>
					<q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
						<span class="cursor-carret_none">Добавить быстрый фильтр</span><br/>
					</q-tooltip>
				</div>

				<img v-else class="cursor-carret_none" src="../assets/icons/filter-add-freeze.svg" @click.stop/>
				<div class="icon-wrapper-with-tooltip" v-if="thereIsActiveFilters">
					<img style="width: 100%;height: 100%;" class="cursor-carret_none" src="../assets/icons/filter-remove.svg" @click.stop="clearAllFilter()"/>
					<q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
						<span class="cursor-carret_none">Сбросить все фильтры</span><br/>
					</q-tooltip>
				</div>
				<img v-else class="cursor-carret_none" src="../assets/icons/filter-remove-freeze.svg" @click.stop />
				<q-separator vertical inset style="caret-color: transparent"/>
				<div class="icon-wrapper-with-tooltip">
					<img style="width: 100%;height: 100%;"  class="cursor-carret_none" src="../assets/icons/refresh.svg" @click.stop/>
					<q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
						<span class="cursor-carret_none">Обновить таблицу с базы данных</span><br/>
					</q-tooltip>
				</div>

				<div class="icon-wrapper-with-tooltip">
					<img style="width: 100%;height: 100%;"  class="cursor-carret_none" src="../assets/icons/tuning.svg" @click="showPresetMenu === true"/>
					<q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
						<span class="cursor-carret_none">Управление пресетами</span><br/>
					</q-tooltip>
				</div>
				<div class="icon-wrapper-with-tooltip" v-if="!allSize">
					<img style="width: 100%;height: 100%;"  class="cursor-carret_none" src="../assets/icons/fulll.svg" @click.stop="changeTableSize()"/>
					<q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
						<span class="cursor-carret_none">Расширить на весь экран</span><br/>
					</q-tooltip>
				</div>
				<div class="icon-wrapper-with-tooltip" v-else>
					<img style="width: 100%;height: 100%;"  class="cursor-carret_none" src="../assets/icons/quit-full.svg" @click.stop="changeTableSize()"/>
					<q-tooltip class="text-body2 tooltip-el" anchor="top middle" self="bottom middle" >
						<span class="cursor-carret_none">Сбросить</span><br/>
					</q-tooltip>
				</div>
				<q-menu max-height="900px" v-model="showPresetMenu">
					<the-main-presets></the-main-presets>
				</q-menu>
            </div>
          </div>
          <div class="table-wrapper__table">
			<div id="tooltip-text"></div>
            <div id="hs-table"></div>
			<div id="tooltip-header">
			<the-autofilter 
				@click.stop 
				@sort="sort"
				@updateAfterClearAutofilter="updateAfterClearAutofilter"
				:valuesAutofilter="valuesAutofilter"
				:applliedAutofilter="applliedAutofilter"
			>
			</the-autofilter>
            </div>
		<canvas v-show="false" id="canvas-ht"></canvas>
          </div>
		
        </div>
    </template>
  
  <script lang="ts" setup>
    import {nestedHighHeader} from '../helpers/ColumnsHelper'
    import {EnumTypeBrand, EnumTypeBrandRow, EnumColumnName, EnumColumnNumber} from '../enums/EnumColumnValues'
    import { renderAfterGetColHeader } from '../helpers/HooksMethods.ts' 
    import {renderGuid, renderBrandCell, renderTdCommon, renderTypeTooltip} from '../helpers/Renderers.ts'
	import { toDate } from '../helpers/CommonMethods.ts' 
	import TheMainPresets from './TheMainPresets.vue'
	import TheFastFilters from './TheFastFilters.vue'
	import TheAutofilter from './TheAutofilter.vue'
    import { IModelData } from '../types/TableTypes' 
    import { useStore } from 'vuex'
    import axios from 'axios';
    import Handsontable from "handsontable";
    import { onMounted, ref, reactive, computed, defineEmits } from 'vue';
    import { HotTable, HotColumn } from '@handsontable/vue3';
    import { registerAllModules } from 'handsontable/registry';
    import 'handsontable/dist/handsontable.full.css';
    import { ContextMenu } from 'handsontable/plugins/contextMenu';
    import Core from "handsontable/core";
	import { HiddenColumns } from 'handsontable/plugins'
	import { watch } from 'vue'
    import {IAutofilter} from '../../types/AutofilterTypes'
	import {EnumRuleAutofilter, EnumTypeField} from '../enums/EnumsByFilter'
    import { stopImmediatePropagation } from 'handsontable/helpers/dom'
	import {EnumEmptyString} from '../types/OtherTypes'
	
    const emit = defineEmits([
		'changeTableSize', 
        'showPopupCreateFilterName'
	])
    const store = useStore()

	const fastFilterNames = computed<string[]>(() => store.getters.fastFilterNames)
	const hiddenColumns = computed(() => store.getters.hiddenColumns)
	const thereIsActiveFilters = computed(() => store.getters.thereIsActiveFilters)
	const thereIsAnActiveFastFilter = computed(() => store.getters.thereIsAnActiveFastFilter)
	const selectedColumn = computed(() => store.getters.selectedColumn)
	
	
	const countRow = ref(0)

	watch(hiddenColumns, (newValue: number[]) => {
		instance.updateSettings({ hiddenColumns:{
													columns: newValue,
													indicators: true
												}, 
								});
	})

    registerAllModules();

	//перем. для управления пропсом в быстр фильтр
	let valuesAutofilter = ref<any[]>([])
	let applliedAutofilter = ref<boolean | null>(null)


	let tabModel = ref<string>('mails')
    let allSize = ref(false)
    let instance: any = reactive({})
	let showPresetMenu = ref(false)


	const typeTooltipObject: any = ref({
		renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTypeTooltip(instance, row, td, value)
	})
    const columns = ref([
    { 
      data: "Guid",
      width: 40, 
      readOnly: true, 
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderGuid(td).addEventListener('click', function(){ getStory(value) })
  },  
    { 
      data: "TypeRow",
      readOnly: true,
      width: 100,
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderBrandCell(td, value as EnumTypeBrandRow)
     },
    { data: "Name", width: 200, readOnly: false, type: typeTooltipObject},
    { data: "Brand", readOnly: true, width: 350,
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) 
	},
    { data: "Title", width: 350, readOnly: false,
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "ProductionDate", width: 350, readOnly: false,type: 'date',allowInvalid: true,
      dateFormat: 'YYYY-MM-DD',
      correctFormat: true,
      defaultDate: '1900-01-01',
	datePickerConfig: {
	firstDay: 0,
	showWeekNumber: true
	},
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "Сost", readOnly: true, width: 350,
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "ProducingCountry", width: 350, readOnly: false,
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "AgentEmail", readOnly: true, width: 350,
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) },
    { data: "Comments", width: 350, readOnly: false,
      renderer: (instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, prop: string, value: string) => renderTdCommon(instance, row, td, value) }
  ],)

    const namesCustomDate = ref<string[]>([
		'Колпачок болта колёс NEXIA GM',
		'Колпачок заднего барабана NEXIA MATIZ GM ',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Кольца поршневые LACETTI NEXIA (1.6)  +0.25 Aztec',
		'Кольца поршневые LACETTI NEXIA (1.6)  +0.25 GM',
		'Кольца поршневые LACETTI NEXIA (1.6)  +0.5 GM',
		'Кольца поршневые LACETTI NEXIA (1.6)  STD Aztec ',
		'Кольца поршневые LACETTI NEXIA (1.6)  STD GM',
		'Кольца поршневые MATIZ  STD (тонкие) Daewoo, комплект - 3 шт.',
		'Кольца поршневые MATIZ  STD (тонкие) GM, штучно',
		'Кольца поршневые MATIZ  STD (тонкие) KPR, комплект - 3 шт.',
		'Кольца поршневые MATIZ 0.25 AZTEC, шт.',
		'Кольца поршневые MATIZ 0.25 GM, шт.',
		'Кольца поршневые MATIZ 0.5 GM, 3 шт. (комплект)',
		'Кольца поршневые MATIZ 0.5 GM, шт.',
		'Кольца поршневые NEXIA(1.5)  STD Aztec',
		'Кольца поршневые NEXIA(1.5)  STD GM / Daewoo',
		'Кольца поршневые NEXIA(1.5) +0.25 Aztec',
		'Кольца поршневые NEXIA(1.5) +0.25 GM / Daewoo',
		'Кольца поршневые NEXIA(1.5) +0.25 NPR, Japan',
		'Кольца поршневые NEXIA(1.5) +0.5 GM / Daewoo',
		'Кольца поршневые NEXIA(1.5) +0.5 KPR | RIK',
		'Кольца поршневые NEXIA(1.5) +1.0 TP',
		'Кольцо (шайба) шланга тормозного NEXIA GM',
		'Кольцо корпуса термостата NEXIA DOHC GM',
		'Кольцо маслоприёмника NEXIA MATIZ GM',
		'Кольцо резонатора MATIZ GM',
		'Кольцо резонатора MATIZ Неоригинал',
		'Кольцо сливного болта поддона NEXIA MATIZ GM',
		'Кольцо стопорное передней ступицы NEXIA DOHC GM',
		'Кольцо стопорное передней ступицы NEXIA SOHC GM',
		'Кольцо стопорное поршневых пальцев MATIZ GM',
		'Кольцо термостата NEXIA SOHC GM',
		'Кольцо топливной трубки NEXIA GM',
		'Кольцо трамблёра / модуля зажигания NEXIA SOHC GM/PMC',
		'Кольцо трубки ГУРа NEXIA GM ',
		'Кольцо уплотнительное поршня переднего суппорта MATIZ GM ',
		'Кольцо уплотнительное форсунки NEXIA 1.5 (верхнее) GM',
		'Кольцо уплотнительное форсунки NEXIA 1.5 (нижнее) GM',
		'Кольцо уплотнительное форсунки NEXIA 1.6 MATIZ GM',
		'Коммутатор (Модуль электроный под трамблёр) NEXIA SOHC GM / Daewoo',
		'Коммутатор (Модуль электроный под трамблёр) NEXIA SOHC Mobiletron',
		'Комплект личинок MATIZ GM ',
		'Комплект личинок MATIZ Неоригинал',
		'Комплект личинок NEXIA (без бардачка) GM',
		'Комплект личинок NEXIA (без бардачка) Неоригинал',
		'Комплект личинок NEXIA (с бардачком) GM',
		'Компрессор кондиционера NEXIA GM',
		'Контакт двери (концевик) NEXIA LANOS AVEO MATIZ GM',
		'Контакт руля NEXIA Dello',
		'Контакт руля NEXIA GM',
		'Контактная группа NEXIA MATIZ GM / Daewoo',
		'Контактная группа NEXIA MATIZ Неоригинал',
		'Концевик багажника NEXIA GM',
		'Корзина + диск сцепления NEXIA DOHC 1.6 Valeo',
		'Корзина сцепления MATIZ 0.8 \'\'Valeo\'\'',
		'Корзина сцепления MATIZ 1.0 (SPARK1.0-1.2 AVEO 1.2) Valeo',
		'Корзина сцепления NEXIA DOHC \'\'Valeo\'\'',
		'Корзина сцепления NEXIA SOHC \'\'Valeo\'\'',
		'Корпус вентилятора охлаждения MATIZ GM',
		'Корпус вентилятора охлаждения MATIZ NT ',
		'Корпус вентилятора охлаждения NEXIA NT',
		'Корпус воздушного фильтра (верх) MATIZ (под датчик) 0.8 GM',
		'Корпус воздушного фильтра (верх) MATIZ 0.8 (под датчик) неоригинал',
		'Корпус воздушного фильтра (верх) MATIZ 1.0 GM',
		'Корпус воздушного фильтра (низ) MATIZ 0.8 GM ',
		'Корпус воздушного фильтра MATIZ 0.8 (без датчика) GM',
		'Корпус воздушного фильтра MATIZ 0.8 (под датчик) GM',
		'Корпус воздушного фильтра MATIZ 0.8 (под датчик) Hengda',
		'Корпус воздушного фильтра NEXIA GM',
		'Корпус воздушного фильтра NEXIA Китай',
		'Корпус замка зажигания ( + контактная группа) NEXIA GM',
		'Корпус распредвала (постель) NEXIA SOHC GM ',
		'Корпус распредвала (постель) NEXIA SOHC Zetra ',
		'Корпус термостата NEXIA (внешний) GM ',
		'Корпус термостата NEXIA (переходник) GM',
		'Корпус термостата NEXIA SOHC GM',
		'Кран радиатора NEXIA GM',
		'Крепление АКБ MATIZ (планка) 94580458  0.8 GM',
		'Крепление АКБ MATIZ (тяга)  0.8 GM',
		'Крепление АКБ NEXIA (кронштейн верхний) 96186873 GM',
		'Крепление АКБ NEXIA (кронштейн левый) GM',
		'Крепление глушителя LANOS задней части GM',
		'Крепление глушителя LANOS приёмной части GM',
		'Крепление глушителя LANOS средней части Неоригинал',
		'Крепление глушителя MATIZ заднего/резонатора Bosal',
		'Крепление глушителя MATIZ заднего/резонатора GM',
		'Крепление глушителя NEXIA задней части (самовара) GM',
		'Крепление глушителя NEXIA задней части (самовара) Неоригинал',
		'Крепление глушителя NEXIA средней части (пряник) GM',
		'Крепление глушителя NEXIA средней части (пряник) Неоригинал',
		'Крепление датчика воздушного фильтра NEXIA GM ',
		'Крепление салонного зеркала MATIZ ',
		'Крепление салонного зеркала NEXIA ',
		'Крестовина рулевой колонки NEXIA SOHC GM',
		'Кронштейн балки передней (петля) левой NEXIA GM',
		'Кронштейн балки передней (петля) правой NEXIA GM ',
		'Кронштейн бампера заднего (пластик) MATIZ GM',
		'Кронштейн бампера заднего (сабля) MATIZ GM, левый',
		'Кронштейн бампера заднего (сабля) MATIZ GM, правый',
		'Кронштейн бампера переднего (сабля) MATIZ GM, левый',
		'Кронштейн бампера переднего (сабля) MATIZ GM, правый',
		'Кронштейн воздухозаборника NEXIA GM лев',
		'Кронштейн воздухозаборника NEXIA GM прав ',
		'Кронштейн датчика положения КВ NEXIA DOHC GM',
		'Кронштейн датчика положения КВ NEXIA SOHC GM',
		'Кронштейн динамика MATIZ GM, левый',
		'Кронштейн динамика MATIZ GM, правый',
		'Кронштейн задней панели лев MATIZ GM',
		'Кронштейн крепления упора капота NEXIA GM',
		'Кронштейн панели передней MATIZ GM левый ',
		'Кронштейн панели передней MATIZ GM правый',
		'Кронштейн подушки NEXIA задней GM',
		'"Кронштейн подушки NEXIA передней левой GM	"',
		'"Кронштейн подушки NEXIA передней правой GM	"',
		'Кронштейн радиатора MATIZ GM, левый ',
		'Кронштейн радиатора MATIZ GM, правый',
		'Кронштейн радиатора NEXIA верхний GM',
		'Крыло MATIZ Неоригинал, левое',
		'Крыло MATIZ Неоригинал, правое',
		'Крыло NEXIA APR, правое (%)',
		'Крыло NEXIA GM, левое',
		'Крыло NEXIA GM, правое',
		'Крышка (накладка) зеркала левая MATIZ GM',
		'Крышка (накладка) зеркала правая MATIZ GM',
		'Крышка бачка расширительного NEXIA MATIZ Febi / Swag',
		'Крышка бачка расширительного NEXIA MATIZ GM',
		'Крышка бачка сцепления NEXIA GM',
		'Крышка бензобака NEXIA ESPERO LANOS MATIZ TICO GM',
		'Крышка бензобака NEXIA ESPERO LANOS MATIZ TICO Неоригинал',
		'Крышка блока предохранителей MATIZ GM',
		'Крышка блока предохранителей NEXIA GM',
		'Крышка горловины маслозаливной MATIZ TICO GM',
		'Крышка горловины маслозаливной NEXIA DOHC (старый вариант) GM',
		'Крышка горловины маслозаливной NEXIA SOHC Евро-3/DOHC 1.5/1.6 GM ',
		'Крышка горловины маслозаливной NEXIA SOHC трамблер GM',
		'Крышка горловины маслозаливной NEXIA SOHC трамблёр Неоригинал',
		'Крышка ГУРа MATIZ GM',
		'Крышка ГУРа NEXIA GM',
		'Крышка зеркала NEXIA GM, левая',
		'Крышка зеркала NEXIA GM, правая',
		'Крышка клапанная MATIZ 0.8 GM',
		'Крышка клапанная MATIZ 1.0 GM',
		'Крышка клапанная NEXIA DOHC 1.5 GM',
		'Крышка клапанная NEXIA DOHC 1.6 LACETTI 1.4/1.6 (EURO3) GM',
		'Крышка клапанная NEXIA SOHC LANOS (пластик) GM',
		'Крышка клеммы MATIZ GM',
		'Крышка тормозной жидкости MATIZ GM',
		'Крышка трамблёра MATIZ Delphi DD',
		'Крышка трамблёра MATIZ Delphi GM',
		'Крышка трамблёра MATIZ Mando DD',
		'Крышка трамблёра MATIZ Mando GM',
		'Крышка трамблёра NEXIA DD',
		'Крышка трамблёра NEXIA GM',
		'Кулак поворотный MATIZ GM, левый ',
		'Кулак поворотный MATIZ GM, правый',
		'Кулак поворотный MATIZ X2, левый ',
		'Кулак поворотный MATIZ X2, правый',
		'Кулак поворотный NEXIA DOHC GM, левый ',
		'Кулак поворотный NEXIA DOHC GM, правый',
		'Кулак поворотный NEXIA SOHC GM, левый ',
		'Кулак поворотный NEXIA SOHC GM, правый',
		'Кулак поворотный NEXIA SOHC X2, правый ',
		'Кулиса КПП NEXIA (Lanos, Lacetti, Espero, Chance 1.5) Uz / GM',
		'Кулиса КПП NEXIA (Lanos, Lacetti, Espero, Chance 1.5) Uzdaewoo (дефект!!!)',
		'Лампа H1 Xtec NEXIA NEW (дальний свет) ',
		'Лампа H11 Daewoo NEXIA NEW (противотуманки)',
		'Лампа H11 Xtec NEXIA NEW (противотуманки) ',
		'Лампа H3 Xtec NEXIA MATIZ (противотуманки)',
		'Лампа H4 +50% Eagleye (комплект) NEXIA MATIZ (ближний+дальний)',
		'Лампа H4 +90% Eagleye (комплект) NEXIA MATIZ (ближний+дальний)',
		'Лампа H4 +90% Eagleye (штучно) NEXIA MATIZ (ближний+дальний)',
		'Лампа H4 Xtec NEXIA MATIZ (ближний+дальний)',
		'Лампа H7 +90% Eagleye (комплект) NEXIA NEW (ближний свет) ',
		'Лампа H7 +90% Eagleye (штучно) NEXIA NEW (ближний свет)',
		'Лампа H7 Хtec NEXIA NEW (ближний свет) ',
		'Лампа STOP+габарит (2х контактная) Xtec NEXIA MATIZ',
		'Лампа габарита заднего Xtec NEXIA MATIZ ',
		'Лампа габарита переднего/освещения номера/панели приборов (безцоколь.) Xtec NEXIA MATIZ',
		'Лампа габарита переднего/освещения номера/панели приборов (светодиод матричн.)  NEXIA MATIZ',
		'Лампа поворота Narva (жёлтая) NEXIA MATIZ',
		'Лампа поворота Xtec NEXIA MATIZ ',
		'Лампа салона MATIZ GM',
		'Лампа салона NEXIA /багажника MATIZ GM',
		'Лампа символов панели приборов (светодиод жёлтый) NEXIA MATIZ',
		'Лампа символов панели приборов (светодиод матричн.) NEXIA MATIZ',
		'Лента водоизоляции крыши NEXIA левая GM',
		'Лента водоизоляции крыши NEXIA правая GM',
		'Личинка багажника NEXIA GM',
		'Личинка замка двери перед лев + прав NEXIA неоригинал',
		'Личинка замка двери перед лев NEXIA GM',
		'Личинка замка двери перед лев NEXIA NBN/Raon',
		'Личинка замка двери перед прав NEXIA GM',
		'Личинка замка двери перед прав NEXIA Неоригинал',
		'Личинка замка зажигания NEXIA MATIZ (металл) GM',
		'Личинка замка зажигания NEXIA MATIZ (пластик) GM',
		'Личинка замка зажигания NEXIA MATIZ (пластик) Неоригинал',
		'Лючок бензобака MATIZ GM',
		'Лючок бензобака NEXIA GM',
		'Масло (в кпп) 75w-90  (1L) Eneos /полусинтетика/',
		'Масло (в кпп) 80w-90  (1L) Eneos /минеральное/',
		'Масло Eneos 5w-30  (1L) полусинтетика',
		'Масло GM 5w-30  (1L) синтетика',
		'Масло GM 5w-30  (5L) синтетика',
		'Масло Kixx 10w-40  (1L) полусинтетика',
		'Масло Kixx 10w-40  (4L) полусинтетика',
		'Масло Kixx 5w-40  (1L) синтетика',
		'Масло Kixx 5w-40  (4L) синтетика',
		'Масло Shell Helix Ultra 5w-40  (4L) синтетика',
		'Масло Shell HX7 10w-40  (1L) полусинтетика',
		'Масло Shell HX7 10w-40  (4L) полусинтетика',
		'Масло Shell HX8 5w-40  (1L) синтетика',
		'Масло Shell HX8 5w-40  (4L) синтетика',
		'Маслоприёмная труба NEXIA GM',
		'Маслосьёмный колпачок LACETTI NEXIA DOHC(1.6) Elring',
		'Маслосьёмный колпачок LACETTI NEXIA DOHC(1.6) Febi',
		'Маслосьёмный колпачок LACETTI NEXIA DOHC(1.6) GM',
		'Маслосьёмный колпачок LACETTI NEXIA DOHC(1.6) Swag',
		'Маслосьёмный колпачок MATIZ GM / Daewoo',
		'Маслосьёмный колпачок NEXIA DOHC(1.5) (1.6) GM | Daewoo',
		'Маслосьёмный колпачок NEXIA DOHC(1.5) (1.6) Неоригинал',
		'Маслосьёмный колпачок NEXIA SOHC GM/DAEWOO',
		'Маслосьёмный колпачок NEXIA SOHC Неоригинал',
		'Маховик коленвала NEXIA GM',
		'Модуль звукового сигнала NEXIA GM',
		'Модуль поглотителя паров топлива MATIZ GM',
		'Молдинг бампера заднего NEXIA Неоригинал',
		'Молдинг двери  перед лев NEXIA GM',
		'Молдинг двери  передней NEXIA (лев=прав) Неоригинал',
		'Молдинг двери задн лев NEXIA Неоригинал',
		'Молдинг двери задн прав NEXIA Неоригинал',
		'Молдинг крыла лев NEXIA Неоригинал',
		'Молдинг крыла прав NEXIA GM',
		'Молдинг крыла прав NEXIA Неоригинал',
		'Молдинги NEXIA NEW UzDaewoo, комплект',
		'Мотор бачка омывателя MATIZ GM',
		'Мотор бачка омывателя NEXIA (без проводов) GM',
		'Мотор бачка омывателя NEXIA (с проводами) GM',
		'Мотор бензонасоса NEXIA MATIZ ESPERO Bohan',
		'Мотор бензонасоса NEXIA MATIZ ESPERO Bosch',
		'Мотор отопителя печки ГАЗель ',
		'Мотор печки MATIZ (без кондиционера) GM',
		'Мотор печки MATIZ (с кондиционером) GM',
		'Мотор печки NEXIA (стар.кузов) GM',
		'Мотор стеклоочистителя MATIZ AFA ',
		'Мотор стеклоочистителя MATIZ GM',
		'Мотор стеклоочистителя NEXIA GM',
		'Мотор стеклоочистителя NEXIA Неоригинал',
		'Мотор стеклоподьёмника MATIZ GM, передней левый',
		'Мотор стеклоподьёмника NEXIA GM, передней левый',
		'Мотор стеклоподьёмника NEXIA GM, передний правый',
		'Мотор стеклоподьёмника NEXIA Ukor, передний правый',
		'Надпись (наклейка) "GL"NEXIA GM',
		'Надпись (наклейка) "GLE" NEXIA GM',
		'Надпись (наклейка) задняя "MATIZ"',
		'Накладка внутр.ручки передней NEXIA GM',
		'Накладка кнопки кондиционера MATIZ GM',
		'Накладка крышки багажника NEXIA Arirang',
		'Накладка педали газ MATIZ GM',
		'Накладка педали газ NEXIA GM',
		'Накладка педали сцепление / тормоз MATIZ GM',
		'Накладка педали сцепления/тормоза NEXIA ESPERO GM',
		'Накладка передней стойки салона NEXIA GM правая',
		'Накладка центральной стойки MATIZ GM, нижняя левая',
		'Накладка центральной стойки MATIZ GM, нижняя правая',
		'Накладки передние тормозные COBALT (без ABS) Hi-Q',
		'Накладки передние тормозные COBALT AVEO 1.2 - 1.4 06- (с ABS) Hi-Q',
		'Накладки передние тормозные NEXIA DOHC LACETTI GENTRA  JD',
		'Накладки передние тормозные NEXIA DOHC LACETTI GENTRA Hi-Q ',
		'Накладки передние тормозные NEXIA SOHC MATIZ LANOS CHANCE Fenox ',
		'Накладки передние тормозные NEXIA SOHC MATIZ LANOS CHANCE Hi-Q/YES-Q',
		'Накладки передние тормозные NEXIA SOHC короткие HiQ / Asam',
		'Наклейка MX MATIZ GM',
		'Наконечник рулевой LACETTI CTR, левый',
		'Наконечник рулевой LACETTI CTR, правый',
		'Наконечник рулевой LACETTI GM / Daewoo, левый',
		'Наконечник рулевой LACETTI GM / Daewoo, правый',
		'Наконечник рулевой MATIZ Cardex',
		'Наконечник рулевой MATIZ CTR',
		'Наконечник рулевой MATIZ GM / Daewoo',
		'Наконечник рулевой NEXIA GM / Daewoo, левый',
		'Наконечник рулевой NEXIA GM / Daewoo, правый',
		'Наконечник рулевой NEXIA LANOS CTR, левый',
		'Наконечник рулевой NEXIA LANOS CTR, правый',
		'Направляющая клапана MATIZ GM ',
		'Направляющая клапана NEXIA DOHC AE',
		'Направляющая клапана NEXIA DOHC GM',
		'Направляющая клапана NEXIA SOHC GM',
		'Направляющая клапана NEXIA SOHC Metelli',
		'Направляющая кнопки блокировки двери MATIZ GM',
		'Направляющая кнопки блокировки двери NEXIA GM',
		'Направляющая стекла двери передней левой NEXIA GM',
		'Направляющие рулевой тяги (бинокль) NEXIA ',
		'Направляющие суппорта MATIZ (на 1 суппорт) KOS',
		'Направляющие суппорта MATIZ (на 2 суппорт) KOS',
		'Направляющие суппорта MATIZ GM ',
		'Насос ГУРа MATIZ GM',
		'Насос ГУРа NEXIA GM',
		'Насос масляный MATIZ SPARK 0.8 GM',
		'Насос масляный NEXIA NUBIRA LANOS LACCETTI (1.4-1.8) GM',
		'Насос масляный NEXIA NUBIRA LANOS LACCETTI (1.4-1.8) Неоригинал.',
		'Незамерзающая жидкость (5л) ',
		'Облицовка решётки радиатора NEXIA хром Китай ',
		'Обшивка двери багажника MATIZ GM ',
		'Ограничитель бардачка NEXIA NEW (шнурок)',
		'Ограничитель задних дверей NEXIA GM',
		'Ограничитель передних дверей NEXIA GM',
		'Окантовка ручки привода замка NEXIA GM',
		'Окантовка ручки стеклоподьёмника NEXIA GM',
		'Опора заднего амортизатора LACETTI GM / Daewoo',
		'Опора задняя переднего рычага NEXIA Febest',
		'Опора задняя переднего рычага NEXIA GM / Daewoo',
		'Опора переднего амортизатора LACETTI GM',
		'Опора стойки передней внутренняя MATIZ GM',
		'Опора шаровая LACETTI GENTRA CTR',
		'Опора шаровая NEXIA LANOS ESPERO СHANCE CTR (+ болты)',
		'Опора шаровая NEXIA LANOS ESPERO СHANCE Daewoo (без болтов)',
		'Опора шаровая NEXIA LANOS ESPERO СHANCE GM (+ болты)',
		'Опорная чашка подшипника MATIZ GM',
		'Опорный подшипник LANOS GM/DAEWOO, левый',
		'Опорный подшипник LANOS GM/DAEWOO, правый',
		'Опорный подшипник LANOS Torque, левый',
		'Опорный подшипник LANOS Torque, правый',
		'Опорный подшипник NEXIA Daewoo',
		'Опорный подшипник NEXIA GM',
		'Опорный подшипник NEXIA GM / Daewoo (Без упаковки)',
		'Основание антенны MATIZ на крышу GM ',
		'Основание упора капота NEXIA LANOS GM ',
		'Ось ограничителя двери NEXIA GM',
		'Отбойник + пыльник амортизатора переднего MATIZ MR',
		'Отбойник амортизатора MATIZ переднего Cardex',
		'Отбойник амортизатора NEXIA переднего GM',
		'Отбойник капота (большой) NEXIA GM 96169589',
		'Отбойник капота (маленький) крышки багажника (верх) NEXIA GM 96169594',
		'Отбойник капота MATIZ GM',
		'Отбойник крышки багажника NEXIA (нижний) GM',
		'Палец вала сателлита MATIZ GM',
		'Палец кулисы КПП NEXIA GM',
		'Палец поршневой MATIZ 0.8 GM ',
		'Палец поршневой MATIZ 1.0 GM',
		'Палец поршневой NEXIA DOHC GM',
		'Палец поршневой NEXIA SOHC GM',
		'Патрубок (воздуховод) NEXIA SOHC  нижний  GM',
		'Патрубок бачка расширительного NEXIA нижний GM',
		'Патрубок бачка расширительного NEXIA нижний PMC',
		'Патрубок вентиляции картера / сапуна ( Т - образный) NEXIA Cardex',
		'Патрубок вентиляции картера / сапуна ( Т- образный) NEXIA GM ',
		'Патрубок воздушного фильтра (перепускной) MATIZ GM',
		'Патрубок охлаждения MATIZ (верхний) GM',
		'Патрубок охлаждения MATIZ (дроссельная заслонка) GM',
		'Патрубок охлаждения MATIZ (радиатор - расширительный бачок) GM',
		'Патрубок охлаждения MATIZ (расширительный бачок - помпа) GM',
		'Патрубок охлаждения NEXIA (радиатор - помпа) Cardex',
		'Патрубок охлаждения NEXIA (радиатор - помпа) GM',
		'Патрубок охлаждения NEXIA (радиатор - расширительный бачок) GM',
		'Патрубок охлаждения NEXIA (расширительный бачок - двигатель) GM',
		'Патрубок охлаждения NEXIA DOHC (дросельная заслонка) GM',
		'Патрубок охлаждения NEXIA SOHC (впускной коллектор) GM',
		'Патрубок охлаждения NEXIA трубка (радиатор - двигатель) GM',
		'Патрубок печки MATIZ (вход) GM',
		'Патрубок печки MATIZ (вход) Onnuri',
		'Патрубок печки MATIZ (выход) GM',
		'Патрубок печки NEXIA (выход) Cardex',
		'Патрубок печки NEXIA (выход) GM',
		'Патрубок печки NEXIA DOHC (вход) Cardex | PMC',
		'Патрубок печки NEXIA DOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) GM',
		'Патрубок печки NEXIA SOHC (вход) Onnuri | Cardex',
		'Патрубок радиатора MATIZ 0.8 верхний Cardex | Onnuri',
		'Патрубок радиатора MATIZ 0.8 верхний GM',
		'Патрубок радиатора MATIZ 0.8 нижний Cardex',
		'Патрубок радиатора MATIZ 0.8 нижний GM',
		'Патрубок радиатора MATIZ 1.0 верхний GM',
		'Патрубок радиатора MATIZ 1.0 нижний GM',
		'Патрубок радиатора NEXIA DOHC верхний Cardex [не заказывать]',
		'Патрубок радиатора NEXIA DOHC верхний GM ',
		'Патрубок радиатора NEXIA SOHC верхний Cardex',
		'Патрубок радиатора NEXIA SOHC верхний GM',
		'Патрубок радиатора NEXIA нижний Cardex | Onnuri',
		'Патрубок радиатора NEXIA нижний GM',
		'Патрубок сапуна MATIZ GM',
		'Патрубок сапуна MATIZ Неоригинал',
		'Патрубок сапуна NEXIA Cardex',
		'Патрубок сапуна NEXIA GM',
		'Переключатель MATIZ поворотов и света фар GM',
		'Переключатель MATIZ поворотов и света фар Raon | APR',
		'Переключатель MATIZ стеклоочистителя GM',
		'Переключатель NEXIA поворотов и света фар GM',
		'Переключатель NEXIA поворотов и света фар Неоригинал',
		'Переключатель NEXIA стеклоочистителя GM',
		'Переходник системы охлаждения MATIZ GM',
		'Петля буксировачная MATIZ GM ',
		'Петля двери MATIZ задней левой (верхняя) GM',
		'Петля замка багажника NEXIA GM',
		'Петля капота MATIZ GM, левая',
		'Петля капота MATIZ GM, правая',
		'Петля крышки багажника NEXIA GM, левая',
		'Петля крышки багажника NEXIA GM, правая',
		'Планка подфонарная задняя MATIZ GM, левая ',
		'Планка подфонарная задняя MATIZ GM, правая',
		'Плафон бардачка и багажника NEXIA MATIZ (Lacetti) GM',
		'Плафон салона NEXIA GM',
		'Поводок стеклоочистителя MATIZ задний GM',
		'Поводок стеклоочистителя MATIZ левый GM',
		'Поводок стеклоочистителя MATIZ правый GM',
		'Поводок стеклоочистителя NEXIA левый GM',
		'Поводок стеклоочистителя NEXIA правый GM',
		'Поворотник MATIZ APR, левый',
		'Поворотник MATIZ APR, правый',
		'Поворотник NEXIA DEPO, левый ',
		'Поворотник NEXIA DEPO, правый',
		'Поворотник NEXIA Китай, левый',
		'Поворотник NEXIA Китай, правый',
		'Поворотник NEXIA Корея, правый',
		'Повторитель указателя поворота MATIZ GM',
		'Повторитель указателя поворота MATIZ Ukor-Fenghua | ATEK',
		'Повторитель указателя поворота NEXIA GM',
		'Поддон двигателя MATIZ 0.8 GM',
		'Поддон двигателя MATIZ 1.0 AVEO 1.2 SOHC GM',
		'Поддон двигателя NEXIA DOHC / SOHC (Euro) аллюминенвый GM',
		'Поддон двигателя NEXIA SOHC железный GM',
		'Поддон двигателя NEXIA SOHC железный Неоригинал',
		'Подкрылок MATIZ задний левый Novline',
		'Подкрылок MATIZ задний правый Novline',
		'Подкрылок MATIZ передний левый Novline',
		'Подкрылок MATIZ передний правый Novline',
		'Подкрылок NEXIA задний левый Novline',
		'Подкрылок NEXIA задний правый Novline',
		'Подкрылок NEXIA передний левый Novline',
		'Подкрылок NEXIA передний правый Novline',
		'Подушка двигателя MATIZ 0.8 левая (MКПП) Cardex',
		'Подушка двигателя MATIZ 0.8 левая (АКПП) GM',
		'Подушка двигателя MATIZ 0.8 левая (МКПП) GM',
		'Подушка двигателя MATIZ 0.8 правая (нижняя) GM',
		'Подушка двигателя MATIZ 0.8 правая (нижняя) Onnuri',
		'Подушка двигателя MATIZ 0.8 правая Cardex',
		'Подушка двигателя MATIZ 0.8 правая GM',
		'Подушка двигателя NEXIA LANOS задняя GM / Daewoo',
		'Подушка двигателя NEXIA LANOS задняя SWAG ',
		'Подушка двигателя NEXIA LANOS передняя левая GM',
		'Подушка двигателя NEXIA LANOS передняя левая Неоригинал',
		'Подушка двигателя NEXIA передняя правая GM',
		'Подушка двигателя NEXIA передняя правая Lemforder',
		'Подушка двигателя SPARK 0.8-1.0 передняя Febest',
		'Подушка радиатора кондиционера MATIZ GM',
		'Подшипник вала рулевого управления NEXIA GM',
		'Подшипник выжимной LACETTI GENTRA Valeo',
		'Подшипник выжимной MATIZ 0.8 Valeo',
		'Подшипник выжимной MATIZ 1.0 (AVEO SPARK 1.0-1.2) Valeo',
		'Подшипник выжимной NEXIA (LANOS, AVEO 1.4, CHANCE 1.5, ESPERO) Valeo',
		'Подшипник генератора MATIZ (Delfi) GM',
		'Подшипник генератора MATIZ (Mando) GM, задний',
		'Подшипник генератора MATIZ (Mando) GM, передний',
		'Подшипник генератора NEXIA задний GM ',
		'Подшипник генератора NEXIA передний GMB / Koyo',
		'Подшипник задней ступицы MATIZ (внутрений) KBC',
		'Подшипник задней ступицы MATIZ (наружный) KBC',
		'Подшипник задней ступицы MATIZ GM (внутрений)',
		'Подшипник задней ступицы MATIZ GM (наружный)',
		'Подшипник задней ступицы MATIZ комплект CX',
		'Подшипник задней ступицы MATIZ комплект HSC [Без сальника]',
		'Подшипник задней ступицы NEXIA (LANOS, CHANCE) комплект CX',
		'Подшипник задней ступицы NEXIA (LANOS, CHANCE) комплект Ruville',
		'Подшипник задней ступицы NEXIA (внутрений) KBC',
		'Подшипник задней ступицы NEXIA GM (внутрений)',
		'Подшипник задней ступицы NEXIA GM (наружный)',
		'Подшипник КПП (дифференциала) NEXIA GM',
		'Подшипник опоры нижний переднего амортизатора MATIZ (SPARK) Febest',
		'Подшипник опоры нижний переднего амортизатора MATIZ (SPARK) GM',
		'Подшипник опоры переднего амортизатора LACETTI GM',
		'Подшипник первичного вала КПП MATIZ (левый) GM',
		'Подшипник первичного вала КПП NEXIA (задний) GM',
		'Подшипник первичного вала КПП NEXIA (передний) GM',
		'Подшипник первичного вала/коленвала задний (в маховике) MATIZ GM',
		'Подшипник передней ступицы LACETTI Febest',
		'Подшипник передней ступицы LACETTI Iljin',
		'Подшипник передней ступицы MATIZ Coram, шт',
		'Подшипник передней ступицы MATIZ CX (комплект, + сальники)',
		'Подшипник передней ступицы MATIZ GM (комплект, без сальников)',
		'Подшипник передней ступицы MATIZ HSC (комплект, без сальников)',
		'Подшипник передней ступицы MATIZ KBC, шт',
		'Подшипник передней ступицы NEXIA DOHC Chery',
		'Подшипник передней ступицы NEXIA DOHC HSC',
		'Подшипник передней ступицы NEXIA SOHC  TSN',
		'Подшипник передней ступицы NEXIA SOHC HSC',
		'Подшипник передней ступицы NEXIA SOHC NSK',
		'Подшипник рулевой рейки MATIZ (без гура) GM ',
		'Подшипник стартера игольчатый NEXIA GM',
		'Полукольцо коленвала  MATIZ GM, шт',
		'Помпа водяная MATIZ GM / Daewoo',
		'Помпа водяная MATIZ Корея неориг.',
		'Помпа водяная NEXIA DOHC  1.6 LACETTI 1.4-1.6 Daewoo',
		'Помпа водяная NEXIA DOHC  1.6 LACETTI 1.4-1.6 GM',
		'Помпа водяная NEXIA DOHC  1.6 LACETTI 1.4-1.6 Неоригинал',
		'Помпа водяная NEXIA DOHC 1.5 Неоригинал',
		'Помпа водяная NEXIA DOHС 1.5 Daewoo',
		'Помпа водяная NEXIA SOHC Daewoo',
		'Помпа водяная NEXIA SOHC GM',
		'Помпа водяная NEXIA SOHC Корея неориг.',
		'Порог MATIZ (метал) Klokkerholm, левый ',
		'Порог MATIZ (метал) Klokkerholm, правый',
		'Порог NEXIA Klokkerholm, левый',
		'Порог NEXIA Klokkerholm, правый',
		'Поршень LACETTI NEXIA DOHC (1.6)  +0.25 Uzdaewoo, комплект - 4 шт',
		'Поршень LACETTI NEXIA DOHC (1.6)  +0.5 Uzdaewoo, комплект - 4 шт',
		'Поршень LACETTI NEXIA DOHC (1.6)  STD GM, шт',
		'Поршень LACETTI NEXIA DOHC (1.6)  STD PMC | Onnuri , комплект - 4 шт',
		'Поршень MATIZ  STD GM, шт.',
		'Поршень MATIZ  STD UzDaewoo, комплект 3 шт.',
		'Поршень MATIZ 0.25 GM, шт.',
		'Поршень MATIZ 0.25 Uzdaewoo, комплект(3 шт.)',
		'Поршень MATIZ 0.5 GM, шт.',
		'Поршень MATIZ 0.5 UzDaewoo, комплект 3 шт. ',
		'Поршень NEXIA DOHC(1.5)  STD GM, штучно',
		'Поршень NEXIA DOHC(1.5)  STD KFM (c пальцем), Korea 4 шт.',
		'Поршень NEXIA DOHC(1.5)  STD Uzdaewoo (комплект), 4 шт',
		'Поршень NEXIA DOHC(1.5) +0.25 GM, штучно',
		'Поршень NEXIA DOHC(1.5) +0.25 KFM (c пальцем), Korea 4 шт.',
		'Поршень NEXIA DOHC(1.5) +0.25 UzDaewoo, 4 шт',
		'Поршень NEXIA DOHC(1.5) +0.5 GM, шт',
		'Поршень NEXIA DOHC(1.5) +0.5 KFM (c пальцем), Korea 4 шт.',
		'Поршень NEXIA SOHC  STD GM, шт',
		'Поршень NEXIA SOHC 0.25 GM, шт',
		'Поршень NEXIA SOHC 0.25 Неоригинал, 4 шт',
		'Поршень NEXIA SOHC 0.5 GM, шт',
		'Поршень NEXIA SOHC 0.5 Неоригинал, 4 шт',
		'Поршень суппорта переднего MATIZ GM ',
		'Предохранители NEXIA MATIZ TESLA',
		'Привод в сборе NEXIA DOHC Неоригинал, правый',
		'Привод лючка бензобака NEXIA GM',
		'Привод спидометра MATIZ GM',
		'Привод спидометра NEXIA GM',
		'Привод спидометра NEXIA Неоригинал',
		'Привод центрального замка NEXIA GM передний левый',
		'Привод центрального замка NEXIA GM передний правый',
		'Прикуриватель MATIZ LANOS GM',
		'Пробка головки блока цилиндров NEXIA DOHC GM',
		'Провода ВВ LEGANZA REZZO LACETTI (все 1.8/2.0 DOHC) PMC',
		'Провода ВВ MATIZ 0.8 Евро-3 Daewoo',
		'Провода ВВ MATIZ 0.8 Евро-3 PMC',
		'Провода ВВ MATIZ 0.8 под трамблер Daewoo',
		'Провода ВВ MATIZ 0.8 под трамблёр GM',
		'Провода ВВ MATIZ 1.0 DAEWOO ',
		'Провода ВВ MATIZ 1.0 GM',
		'Провода ВВ MATIZ 1.0 PMC ',
		'Провода ВВ NEXIA 1.6 LACETTI Daewoo',
		'Провода ВВ NEXIA 1.6 LACETTI GM ',
		'Провода ВВ NEXIA 1.6 LACETTI PMC',
		'Провода ВВ NEXIA DOHC 1.5 Daewoo',
		'Провода ВВ NEXIA DOHC 1.5 GM',
		'Провода ВВ NEXIA SOHC Daewoo, под трамблёр',
		'Провода ВВ NEXIA SOHC LANOS Euro Daewoo',
		'Провода ВВ NEXIA SOHC LANOS Euro GM',
		'Провода ВВ NEXIA SOHC LANOS Euro Неоригинал',
		'Прокладка MATIZ 0.8 впускного коллектора GM (1 отверстие)',
		'Прокладка MATIZ 0.8 впускного коллектора GM (3 отверстия)',
		'Прокладка MATIZ 0.8 впускного коллектора PMC (1 отверстие)',
		'Прокладка MATIZ 0.8 впускного коллектора PMC (3 отверстия)',
		'Прокладка MATIZ 0.8 выпускного коллектора GM ',
		'Прокладка MATIZ 0.8 выпускного коллектора PMC',
		'Прокладка MATIZ 0.8 выпускного коллектора UzDaewoo (паранит) ',
		'Прокладка MATIZ 0.8 корпуса трамблёра / MATIZ 1.0 Водяного насоса GM',
		'Прокладка MATIZ 1.0 впускного коллектора GM ',
		'Прокладка MATIZ 1.0 впускного коллектора PMC',
		'Прокладка MATIZ 1.0 выпускного коллектора GM',
		'Прокладка MATIZ 1.0 выпускного коллектора PMC',
		'Прокладка MATIZ дроссельной заслонки GM',
		'Прокладка MATIZ дроссельной заслонки PMC',
		'Прокладка MATIZ крышки задней (корпус сальников) GM',
		'Прокладка MATIZ крышки передней (насоса масляного) GM',
		'Прокладка MATIZ насоса топливного (металл. бак) GM',
		'Прокладка MATIZ помпы GM',
		'Прокладка NEXIA DOHC 1.6 впускного коллектора GM (кольцо), шт.',
		'Прокладка NEXIA DOHC 1.6 впускного коллектора Неоригинал (кольцо), шт.',
		'Прокладка NEXIA DOHC впускного коллектора GM',
		'Прокладка NEXIA DOHC впускного коллектора PMC',
		'Прокладка NEXIA DOHC выпускного коллектора GM',
		'Прокладка NEXIA DOHC выпускного коллектора PMC / Cardex',
		'Прокладка NEXIA SOHC впускного коллектора GM',
		'Прокладка NEXIA SOHC впускного коллектора PMC',
		'Прокладка NEXIA SOHC выпускного коллектора GM',
		'Прокладка NEXIA SOHC выпускного коллектора PMC',
		'Прокладка NEXIA насоса масляного GM',
		'"Прокладка NEXIA насоса масляного PMC	"',
		'Прокладка NEXIA насоса топливного GM',
		'Прокладка NEXIA помпы GM',
		'Прокладка ГБЦ LACETTI 1.8 PMC ',
		'Прокладка ГБЦ MATIZ 0.8 Daewoo',
		'Прокладка ГБЦ MATIZ 0.8 GM',
		'Прокладка ГБЦ MATIZ 0.8 PMC',
		'Прокладка ГБЦ MATIZ 1.0 Daewoo',
		'Прокладка ГБЦ MATIZ 1.0 PMC',
		'Прокладка ГБЦ NEXIA 1.6 (LACETTI) Daewoo/GM',
		'Прокладка ГБЦ NEXIA 1.6 (LACETTI) Daewoo/GM (МЕТАЛЛ. )',
		'Прокладка ГБЦ NEXIA 1.6 (LACETTI) PMC',
		'Прокладка ГБЦ NEXIA 1.6 (LACETTI) PMC (МЕТАЛЛ.) ',
		'Прокладка ГБЦ NEXIA DOHC Daewoo',
		'Прокладка ГБЦ NEXIA DOHC GM',
		'Прокладка ГБЦ NEXIA DOHC Viktor Reinz',
		'Прокладка ГБЦ NEXIA SOHC Daewoo',
		'Прокладка ГБЦ NEXIA SOHC GM',
		'Прокладка ГБЦ NEXIA SOHC PMC',
		'Прокладка глушителя LACETTI AVEO 03-11 приёмная часть GM',
		'Прокладка глушителя LACETTI AVEO 03-11 приёмная часть PMC',
		'Прокладка глушителя LANOS приёмной / средней части GM',
		'Прокладка глушителя LANOS средней / задней части GM',
		'Прокладка глушителя MATIZ приёмная часть GM',
		'Прокладка глушителя MATIZ приёмная часть PMC',
		'Прокладка глушителя NEXIA DOHC/SOHC (Euro) приёмная часть GM',
		'Прокладка глушителя NEXIA DOHC/SOHC (Euro) приёмная часть PMC',
		'Прокладка глушителя NEXIA SOHC (кольцо) приёмная часть PMC / GM / Bosal',
		'Прокладка глушителя NEXIA средняя часть GM',
		'Прокладка глушителя NEXIA средняя часть PMC',
		'Прокладка датчика уровня топлива NEXIA 3 отверстия GM',
		'Прокладка датчика уровня топлива NEXIA 5 отверстий GM',
		'Прокладка дроссельной заслонки NEXIA DOHC(1.5) GM',
		'Прокладка дроссельной заслонки NEXIA SOHC GM',
		'Прокладка катализатора приёмной части глушителя NEXIA DOHC 1.6 GM',
		'Прокладка клапана EGR MATIZ 0.8 GM',
		'Прокладка клапана EGR MATIZ 1.0 GM',
		'Прокладка клапанной крышки MATIZ 0.8 GM',
		'Прокладка клапанной крышки MATIZ 0.8 Неоригинал',
		'Прокладка клапанной крышки MATIZ 1.0 GM',
		'Прокладка клапанной крышки MATIZ 1.0 PMC',
		'Прокладка клапанной крышки NEXIA DOHC GM / Daewoo',
		'Прокладка клапанной крышки NEXIA DOHC PMC',
		'Прокладка клапанной крышки NEXIA SOHC (LANOS) евро-3, узкая GM / Daewoo',
		'Прокладка клапанной крышки NEXIA SOHC (LANOS) евро-3, узкая PMC',
		'Прокладка клапанной крышки NEXIA SOHC Elring',
		'Прокладка клапанной крышки NEXIA SOHC GM',
		'Прокладка КПП низ (корпуса подшипников) NEXIA GM',
		'Прокладка КПП низ (корпуса подшипников) NEXIA PMC',
		'Прокладка крышки КПП боковая NEXIA GM',
		'Прокладка крышки КПП боковая NEXIA PMC',
		'Прокладка крышки КПП верхняя NEXIA GM',
		'Прокладка поддона NEXIA SOHC Elring',
		'Прокладка поддона NEXIA SOHC GM/Daewoo',
		'Прокладка поддона КПП NEXIA 1.5 (10 отв) GM',
		'Прокладка поддона КПП NEXIA 1.5 (10 отв) PMC',
		'Прокладка поддона МКПП MATIZ NEXIA 1.6 REZZO CHANCE 1.5 (11 отв) GM',
		'Прокладка поддона МКПП MATIZ NEXIA 1.6 REZZO CHANCE 1.5 (11 отв) Неоригинал',
		'Прокладка пружины задней NEXIA (LANOS, CHANCE) GM, верхняя',
		'Прокладка пружины задней NEXIA (LANOS, CHANCE) GM, нижняя',
		'Прокладка пружины задней NEXIA (LANOS, CHANCE) усиленая (пара)',
		'Прокладка пружины задней NEXIA (LANOS, CHANCE) усиленая (пара) + серьги (крепежи, болты, гайки)',
		'Прокладка трубки вентиляции картера NEXIA LANOS GM',
		'Промывка 5минутная (0.25L) Nekker',
		'Промывка 5минутная (0.5L) Hi-Gear',
		'Промывка инжектора профессиональная WYNN\'S 1л',
		'Промывочное масло МПА-2 (3.5L) ОЙЛРАЙТ',
		'Проставка амортизатора заднего NEXIA KYB, пара',
		'Противотуманка MATIZ DEPO, левая',
		'Противотуманка MATIZ DEPO, правая',
		'Противотуманка MATIZ GM левая',
		'Противотуманка MATIZ GM, правая',
		'Противотуманка MATIZ Kитай, левая',
		'Противотуманка MATIZ Китай, правая',
		'Противотуманка NEXIA NEW (круглая) Depo, шт. ',
		'Противотуманка NEXIA NEW (круглая) Китай, шт.',
		'Противотуманка NEXIA NEW (широкая) Uzdaewoo, белая, (пара)',
		'Противотуманка NEXIA NEW (широкая) Uzdaewoo, белая, левая!',
		'Противотуманка NEXIA NEW (широкая) Uzdaewoo, чёрная (пара)',
		'Противотуманка NEXIA NEW (широкая) Uzdaewoo, чёрная, левая!',
		'Противотуманка NEXIA Китай, левая',
		'Противотуманка NEXIA Китай, правая',
		'Пружина MATIZ задняя GM, шт. ',
		'Пружина MATIZ передняя GM, шт.',
		'Пружина багажника левая NEXIA GM ',
		'Пружина багажника правая NEXIA GM',
		'Пружина верхней стяжки колодок задних NEXIA GM',
		'Пружина заднего барабана MATIZ 94580429 GM',
		'Пружина заднего барабана NEXIA, MATIZ. GM (94535388)',
		'Пружина задняя (комплект) STD NEXIA, LANOS, CHANCE. Клаксон, Россия',
		'Пружина капота NEXIA GM',
		'Пружина клапана MATIZ GM',
		'Пружина клапана NEXIA DOHC, LACETTI GM',
		'Пружина клапана NEXIA SOHC GM',
		'Пружина лючка бензобака MATIZ GM',
		'Пружина передних тормозных накладок NEXIA GM',
		'Пружина передняя (комплект) NEXIA. Клаксон, Россия',
		'Пружина приёмной трубы NEXIA SOHC Hans Pries',
		'Пряжка ремня безопасности MATIZ задняя, пряжка + пряжка GM',
		'Пряжка ремня безопасности MATIZ задняя, ремень + пряжка GM',
		'Пряжка ремня безопасности MATIZ перед лев GM',
		'Пряжка ремня безопасности MATIZ перед прав GM',
		'Пыльник амортизатора MATIZ перед. GM',
		'Пыльник поршня переднего суппорта MATIZ GM',
		'Пыльник рулевой рейки MATIZ Cardex (лев=прав), шт.',
		'Пыльник рулевой рейки MATIZ GM (лев=прав), шт.',
		'Пыльник рулевой рейки NEXIA (+/- гур) GM',
		'Пыльник рулевой рейки NEXIA (+/- гур) Lemforder, Germany',
		'Пыльник шруса внутренего MATIZ Cardex (+ набивка) ',
		'Пыльник шруса внутренего MATIZ GM',
		'Пыльник шруса внутренего NEXIA Cardex',
		''
	])
	
    let dataValue = reactive<IModelData[]>([
	{
		"Guid": "CE1C378B-9ACD-DEBA-96DD-7D74BF58E65C",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2023-11-09 15:30:22",
		"Сost": "79 079",
		"ProducingCountry": "Koszalin",
		"AgentEmail": "ante.vivamus@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "CB266105-152C-E841-3873-4C9753DDDD6D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-08-15 11:51:34",
		"Сost": "80 554",
		"ProducingCountry": "Pskov",
		"AgentEmail": "vehicula@google.net",
		"Comments": ""
	},
	{
		"Guid": "ED43C6DB-1CBA-6845-3A1D-79E1C6D9943A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2025-03-14 08:57:04",
		"Сost": "8 371",
		"ProducingCountry": "Nevers",
		"AgentEmail": "nam@google.ca",
		"Comments": ""
	},
	{
		"Guid": "3837DA25-6492-828B-A99B-CEE28B855A11",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-06-14 22:52:07",
		"Сost": "54 645",
		"ProducingCountry": "Alsemberg",
		"AgentEmail": "magna@google.ca",
		"Comments": ""
	},
	{
		"Guid": "856BAD9E-9ED4-0D4E-91F1-85F9A2DB34B2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-05-14 14:35:01",
		"Сost": "99 078",
		"ProducingCountry": "Wonju",
		"AgentEmail": "sapien.nunc.pulvinar@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "2493AF22-42D6-A3A5-C331-E9ABDC3DFCD9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-10-22 12:20:56",
		"Сost": "27 951",
		"ProducingCountry": "Jelenia Góra",
		"AgentEmail": "sit.amet.risus@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "5D37DA03-7AB6-D38B-13B5-D16D062682AB",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-06-11 06:50:26",
		"Сost": "37 081",
		"ProducingCountry": "Kursk",
		"AgentEmail": "mauris.suspendisse@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "8DF12BD7-6E41-4C63-3777-C0CE9BE1A9EC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-12-19 08:46:57",
		"Сost": "80 782",
		"ProducingCountry": "Ludwigsburg",
		"AgentEmail": "placerat.orci@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "D8B99B76-8029-4046-DC7F-1B29A5562A56",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2025-04-22 08:54:06",
		"Сost": "71 478",
		"ProducingCountry": "Riesa",
		"AgentEmail": "sit@google.couk",
		"Comments": ""
	},
	{
		"Guid": "CF815C1B-1226-C141-CC23-83B2416EDC4B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-12-17 01:04:44",
		"Сost": "45 630",
		"ProducingCountry": "Bolinne",
		"AgentEmail": "sem.ut@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "8978D316-9173-AA6A-7A39-B8BD775E753C",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-12-01 15:48:31",
		"Сost": "96 585",
		"ProducingCountry": "Steendorp",
		"AgentEmail": "sollicitudin.commodo@yahoo.com",
		"Comments": ""
	},
	{
		"Guid": "15BF6B82-8194-4C9B-3D5E-08751F3BA8B9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-05-07 15:44:19",
		"Сost": "84 082",
		"ProducingCountry": "Lidingo",
		"AgentEmail": "diam.nunc.ullamcorper@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "A3CDA694-CBB7-2D08-9973-C97CDD8781B7",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-06-01 09:59:08",
		"Сost": "61 789",
		"ProducingCountry": "Wenduine",
		"AgentEmail": "odio.vel@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "8DE43541-2D72-06A5-D1DB-89849A7246E4",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-12-04 05:54:25",
		"Сost": "34 516",
		"ProducingCountry": "Acquasanta Terme",
		"AgentEmail": "elit@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "AB5375E4-3181-DB47-C2A9-F8485EB2B919",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-04-05 00:27:36",
		"Сost": "60 325",
		"ProducingCountry": "Jacksonville",
		"AgentEmail": "eget.dictum@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "C65C342D-7F3A-5D74-E568-B9EBDFC6BB52",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-07-18 15:39:35",
		"Сost": "69 208",
		"ProducingCountry": "Ostrowiec Świętokrzyski",
		"AgentEmail": "euismod.urna@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "74E52F92-0FB4-9D2B-BE68-A65C58DE3ADA",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-11-03 22:19:27",
		"Сost": "37 494",
		"ProducingCountry": "Vienna",
		"AgentEmail": "arcu.nunc@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "82BEDEDF-082C-1C3B-35AC-7D57C0E9E5C9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-11-15 17:27:38",
		"Сost": "65 890",
		"ProducingCountry": "Ajaccio",
		"AgentEmail": "vel@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "8BD7DADB-FC1C-3A66-235B-E583B1AE3554",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-04-10 13:48:58",
		"Сost": "1 740",
		"ProducingCountry": "Eigenbrakel",
		"AgentEmail": "sapien.imperdiet@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "B763B831-17D3-D062-9812-4EC8ADADE0CB",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-07-07 05:19:26",
		"Сost": "73 601",
		"ProducingCountry": "Béziers",
		"AgentEmail": "sed@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "57212C6D-9D81-B71B-8D73-44F64ACC0199",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2025-05-08 00:19:18",
		"Сost": "58 361",
		"ProducingCountry": "Ludvika",
		"AgentEmail": "adipiscing.elit@aol.net",
		"Comments": ""
	},
	{
		"Guid": "763395A7-331C-7AC0-EB43-1DF86DDC7699",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-12-25 16:09:36",
		"Сost": "94 669",
		"ProducingCountry": "Osan",
		"AgentEmail": "proin.eget@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "42BD92EF-976C-1BF6-D63B-BB7114D9A3FC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-05-15 13:28:43",
		"Сost": "76 282",
		"ProducingCountry": "West Jordan",
		"AgentEmail": "congue@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "5F583616-EEA0-853D-19D9-114B60E57B15",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-11-15 11:29:05",
		"Сost": "45 343",
		"ProducingCountry": "Gongju",
		"AgentEmail": "sem@outlook.couk",
		"Comments": ""
	},
	{
		"Guid": "E9222B3E-764C-5313-82DA-530337851554",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-08-26 20:17:17",
		"Сost": "99 258",
		"ProducingCountry": "Moulins",
		"AgentEmail": "maecenas.mi.felis@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "59B58E5E-B28A-D422-4C89-7446DD8CC93B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2023-10-05 17:44:47",
		"Сost": "33 989",
		"ProducingCountry": "Rzeszów",
		"AgentEmail": "dapibus.rutrum@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "2AFA534D-40B5-BE7B-2A94-651660447044",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-04-27 01:04:27",
		"Сost": "89 510",
		"ProducingCountry": "Ełk",
		"AgentEmail": "nibh.quisque@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "3C5D4D97-1AE5-933D-658D-21328CCAB934",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-01-04 05:57:34",
		"Сost": "51 126",
		"ProducingCountry": "Valéncia",
		"AgentEmail": "curabitur.egestas@google.couk",
		"Comments": ""
	},
	{
		"Guid": "C86E27F1-A048-2972-4D16-690D278F29CA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2025-02-27 19:42:20",
		"Сost": "59 326",
		"ProducingCountry": "Volgograd",
		"AgentEmail": "sem.egestas@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "25AD3143-2850-174A-A69A-1A282EE2A656",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2025-02-14 05:05:45",
		"Сost": "33 131",
		"ProducingCountry": "Vienna",
		"AgentEmail": "donec.egestas@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "4D2339DA-B72D-833C-6138-EC39EB89D624",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2023-12-19 04:22:46",
		"Сost": "42 985",
		"ProducingCountry": "Fort Collins",
		"AgentEmail": "aliquam.fringilla@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "A9B6A59C-839A-A164-A748-AB177F79024B",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-02-11 04:00:35",
		"Сost": "99 699",
		"ProducingCountry": "Söderhamn",
		"AgentEmail": "accumsan.interdum@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "4CEE18B5-2C24-8969-165B-90608C71D8BB",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-05-18 06:20:10",
		"Сost": "48 312",
		"ProducingCountry": "Reutlingen",
		"AgentEmail": "sit.amet.consectetuer@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "7EE5ECEB-2168-FA69-B666-5D3A4423A699",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-02-23 10:29:58",
		"Сost": "83 318",
		"ProducingCountry": "Borås",
		"AgentEmail": "orci.in@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "ED9ECD41-0B42-8248-4152-1EFE0A1D2E7B",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-12-06 12:18:17",
		"Сost": "43 132",
		"ProducingCountry": "Arvier",
		"AgentEmail": "maecenas.ornare.egestas@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "A95F1E4F-B9CF-F513-BCD8-AB3A6C3CD63A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-10-23 22:59:44",
		"Сost": "70 676",
		"ProducingCountry": "Rodez",
		"AgentEmail": "velit@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "9C5B4644-6CFB-799A-3C9D-2BE5822C24DE",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-12-31 07:05:17",
		"Сost": "61 502",
		"ProducingCountry": "Chartres",
		"AgentEmail": "ante.maecenas@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "3E406956-A4A8-C721-BAE7-8BD950231F03",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-09-24 11:05:35",
		"Сost": "28 964",
		"ProducingCountry": "Feldkirchen in Kärnten",
		"AgentEmail": "egestas.duis@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "751DA133-ECA3-945E-8648-2B4E3A828311",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2025-02-04 11:24:16",
		"Сost": "65 291",
		"ProducingCountry": "Nederhasselt",
		"AgentEmail": "dui.fusce@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "A09D284A-16F4-D28A-5D7F-352CE85686C9",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-10-09 16:51:20",
		"Сost": 305,
		"ProducingCountry": "Kraków",
		"AgentEmail": "odio.nam@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "43512CCC-8CFE-EE1C-15AA-84333ECE76C4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2025-05-05 19:28:44",
		"Сost": "25 103",
		"ProducingCountry": "Novosibirsk",
		"AgentEmail": "tempor.erat@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "1830B28A-DFF5-7BB0-EBA2-B02175B40AF5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2025-01-02 09:21:12",
		"Сost": "57 090",
		"ProducingCountry": "Juneau",
		"AgentEmail": "eu.accumsan@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "32C2D294-94EE-CCFE-4B64-493A2CEF1912",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-11-04 08:16:28",
		"Сost": "92 382",
		"ProducingCountry": "Wrocław",
		"AgentEmail": "ut.erat@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "6DB317E1-8242-BC84-5DAE-DD347798982F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-05-12 04:55:50",
		"Сost": "34 027",
		"ProducingCountry": "Weiz",
		"AgentEmail": "ac@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "5312ECA8-4CDD-2DE8-271F-B51EACFC64E7",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-06-01 12:44:13",
		"Сost": "92 443",
		"ProducingCountry": "Santander",
		"AgentEmail": "iaculis@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "E952B41E-53B6-8EC7-662C-C59CFB977245",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-07-22 14:37:31",
		"Сost": "19 331",
		"ProducingCountry": "Lisieux",
		"AgentEmail": "malesuada.fames@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "7E0AFA4B-3654-5E7B-2671-BEDB76E7917A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-01-04 13:32:40",
		"Сost": "30 986",
		"ProducingCountry": "Moio Alcantara",
		"AgentEmail": "fusce.mi.lorem@outlook.couk",
		"Comments": ""
	},
	{
		"Guid": "4C0C348B-83B1-F759-9424-DEAF8339BC2D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2025-05-09 02:25:10",
		"Сost": "48 871",
		"ProducingCountry": "Verrayes",
		"AgentEmail": "massa@google.edu",
		"Comments": ""
	},
	{
		"Guid": "0EE559C4-D09C-C58E-8C12-6656BF8AC479",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2025-02-22 23:04:23",
		"Сost": "82 678",
		"ProducingCountry": "Corvino San Quirico",
		"AgentEmail": "eget.metus@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "ACEDF534-42FE-EE28-5427-ED573B79AB83",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-12-23 22:02:59",
		"Сost": "22 987",
		"ProducingCountry": "Lidköping",
		"AgentEmail": "neque.et@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "8974DB39-07FF-8759-3126-B716866B9EFD",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-03-11 13:04:49",
		"Сost": "22 516",
		"ProducingCountry": "Lauterach",
		"AgentEmail": "non.massa@google.ca",
		"Comments": ""
	},
	{
		"Guid": "BAA4CE3E-782C-8731-78C5-45AD93F73E71",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-10-05 18:05:54",
		"Сost": "42 640",
		"ProducingCountry": "Bad Ischl",
		"AgentEmail": "tellus@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "1AC5BB7C-6C71-9AF7-D0F9-22B54CE5C767",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2023-11-16 02:09:58",
		"Сost": "20 054",
		"ProducingCountry": "Tambov",
		"AgentEmail": "mauris.magna@aol.org",
		"Comments": ""
	},
	{
		"Guid": "0D7CDCE6-240C-DD74-E5EB-C7DE18E58EEE",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2024-08-28 21:38:01",
		"Сost": "96 879",
		"ProducingCountry": "Tranås",
		"AgentEmail": "velit.in.aliquet@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "C87AA635-C9EC-31D2-5C69-C673C91CC728",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-11-30 04:32:36",
		"Сost": "40 816",
		"ProducingCountry": "Kitzbühel",
		"AgentEmail": "convallis.est@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "5D9AAF9B-7B12-B43C-F903-940F190EC3D1",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-07-10 19:27:35",
		"Сost": "29 005",
		"ProducingCountry": "Springfield",
		"AgentEmail": "magna.ut.tincidunt@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "40AD5EA4-B3D5-A2BA-AE39-0928139268FF",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2025-03-05 21:35:52",
		"Сost": "37 945",
		"ProducingCountry": "Kędzierzyn-Koźle",
		"AgentEmail": "justo.proin@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "4352D226-2240-3B0D-1856-515C24E8DE71",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2025-04-25 02:06:33",
		"Сost": "25 401",
		"ProducingCountry": "Frauenkirchen",
		"AgentEmail": "felis@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "903152D1-6992-A466-6EA8-BD9886B66CA9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2025-02-11 23:55:00",
		"Сost": "5 237",
		"ProducingCountry": "Tula",
		"AgentEmail": "nulla@google.edu",
		"Comments": ""
	},
	{
		"Guid": "4E3EC9A2-5939-87FA-39D8-225D3C991CFF",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2023-10-11 11:41:28",
		"Сost": "81 659",
		"ProducingCountry": "Bremen",
		"AgentEmail": "egestas.a.scelerisque@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "E0B11138-2AC8-4C2F-567A-B83173FC8256",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-10-05 14:09:24",
		"Сost": "54 579",
		"ProducingCountry": "Jecheon",
		"AgentEmail": "ac.mattis.velit@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "5C4BA14A-37AC-ED12-2D6D-9EAEDBA1B626",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-05-09 14:27:05",
		"Сost": "90 429",
		"ProducingCountry": "Volgograd",
		"AgentEmail": "nulla.magna@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "81ED14EE-5088-C927-5665-5851CE32FDBE",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-07-24 09:46:41",
		"Сost": "48 018",
		"ProducingCountry": "Huesca",
		"AgentEmail": "suspendisse.non.leo@protonmail.ca",
		"Comments": ""
	},
	{
		"Guid": "02A563AD-EEC6-15E5-806E-9B8E31E3E871",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-06-01 06:04:22",
		"Сost": "48 871",
		"ProducingCountry": "New Haven",
		"AgentEmail": "placerat@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "DCAC866A-46A8-4221-830E-6C4A48C28A3B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-08-12 17:29:55",
		"Сost": "93 373",
		"ProducingCountry": "Güssing",
		"AgentEmail": "sodales.mauris@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "85E1B359-A516-D87E-93D7-698B7E2C82CA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-08-18 11:35:32",
		"Сost": "34 506",
		"ProducingCountry": "Sakhalin",
		"AgentEmail": "faucibus.leo@google.ca",
		"Comments": ""
	},
	{
		"Guid": "BF6E6F37-43D7-3BBC-7DE2-C5E2E674AC43",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-03-19 17:36:39",
		"Сost": "60 099",
		"ProducingCountry": "Tczew",
		"AgentEmail": "sagittis.semper.nam@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "6779B04B-18B3-8F15-36DA-750727CA3D58",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2025-03-07 18:37:06",
		"Сost": "57 464",
		"ProducingCountry": "Ebenthal in Kärnten",
		"AgentEmail": "a.dui.cras@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "056B5272-1A72-B4DA-EC5B-EEB67A8D648F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2025-03-07 13:32:28",
		"Сost": "52 601",
		"ProducingCountry": "Åkersberga",
		"AgentEmail": "sed@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "B427827D-ECE8-8B71-3911-9E492C699EC5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2024-11-14 01:55:35",
		"Сost": "73 087",
		"ProducingCountry": "Białystok",
		"AgentEmail": "feugiat.nec.diam@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "634C526E-D5C1-2569-7775-256EE5D97571",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-08-27 00:39:34",
		"Сost": "94 075",
		"ProducingCountry": "Częstochowa",
		"AgentEmail": "suspendisse.dui@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "5132850D-DBB6-A76B-713D-9B8A8D2C24D6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2025-04-26 08:08:12",
		"Сost": "71 541",
		"ProducingCountry": "Koekelberg",
		"AgentEmail": "purus.duis@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "88C5A66D-265E-14B0-C20A-85A36D731C6B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-04-15 11:39:20",
		"Сost": "54 229",
		"ProducingCountry": "Compiano",
		"AgentEmail": "nullam.enim@google.edu",
		"Comments": ""
	},
	{
		"Guid": "67699863-3D5C-19CC-D9DB-41C86D44D9AB",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2023-06-14 01:43:45",
		"Сost": "80 993",
		"ProducingCountry": "Logroño",
		"AgentEmail": "cras.dictum@google.ca",
		"Comments": ""
	},
	{
		"Guid": "78482C16-4E02-90A1-C30C-DA877FC64CCC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-09-25 21:47:45",
		"Сost": "99 308",
		"ProducingCountry": "West Jordan",
		"AgentEmail": "diam.proin.dolor@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "3C1B7F86-753A-A488-96A6-7853F5424473",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-12-22 12:51:11",
		"Сost": "78 152",
		"ProducingCountry": "Zeitz",
		"AgentEmail": "magna.ut.tincidunt@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "2B4F866D-DDB1-D5A9-7CA5-786954598866",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2023-09-23 23:47:36",
		"Сost": "1 937",
		"ProducingCountry": "Badajoz",
		"AgentEmail": "ligula.aenean@aol.org",
		"Comments": ""
	},
	{
		"Guid": "845B11B5-BB2C-61E8-E117-38316B3059C5",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-09-16 04:29:26",
		"Сost": "30 022",
		"ProducingCountry": "College",
		"AgentEmail": "habitant.morbi@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "577D2768-911B-BC8D-B361-B58C97602412",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-06-25 10:47:31",
		"Сost": "27 949",
		"ProducingCountry": "León",
		"AgentEmail": "nisi.dictum.augue@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "A292672E-5194-567A-F84D-9666976BD9BC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-01-21 11:34:29",
		"Сost": "75 785",
		"ProducingCountry": "Jönköping",
		"AgentEmail": "tellus.lorem.eu@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "887AABB3-24BB-9B3C-A64D-97CE5E1404C7",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-08-21 07:43:41",
		"Сost": "26 909",
		"ProducingCountry": "Ostrowiec Świętokrzyski",
		"AgentEmail": "nec.mollis@aol.org",
		"Comments": ""
	},
	{
		"Guid": "13A7DCA4-16B6-EE23-F154-A2E69AE2CD97",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-12-02 03:50:53",
		"Сost": "63 963",
		"ProducingCountry": "Narimanov",
		"AgentEmail": "ante.ipsum.primis@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "71BCF2A7-A72C-1050-17CC-BD04A5337793",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2023-09-23 12:14:55",
		"Сost": "49 458",
		"ProducingCountry": "Bolinne",
		"AgentEmail": "etiam.vestibulum@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "5ED851C5-882E-6E06-7D26-8B9BA65125A1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-07-04 17:46:00",
		"Сost": "12 448",
		"ProducingCountry": "Opole",
		"AgentEmail": "interdum.libero.dui@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "CA92742B-5289-106D-D73E-C57CB10189CE",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-05-31 18:58:57",
		"Сost": "68 096",
		"ProducingCountry": "Ryazan",
		"AgentEmail": "purus@outlook.couk",
		"Comments": ""
	},
	{
		"Guid": "C87BBECF-D34A-7D76-4633-8730BE9DF498",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-08-12 20:24:59",
		"Сost": "4 218",
		"ProducingCountry": "Toruń",
		"AgentEmail": "ipsum.cursus@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "D980D48C-F810-1B92-9CB6-77334AB1C953",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-01-03 13:41:06",
		"Сost": "18 325",
		"ProducingCountry": "Lodelinsart",
		"AgentEmail": "nunc.sed.libero@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "2679E226-2122-289B-8811-5B528F103A35",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-10-01 14:27:07",
		"Сost": "81 221",
		"ProducingCountry": "Fusignano",
		"AgentEmail": "pellentesque.tellus.sem@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "31D1789F-2ABA-C880-7492-314BE2A76463",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-07-31 23:39:24",
		"Сost": "59 535",
		"ProducingCountry": "Oviedo",
		"AgentEmail": "gravida.nunc@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "6145C444-22E9-AABC-D65D-9A58E0E9EC8A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-10-29 09:31:52",
		"Сost": "49 695",
		"ProducingCountry": "Houston",
		"AgentEmail": "velit.in.aliquet@google.ca",
		"Comments": ""
	},
	{
		"Guid": "7261327E-BA49-C648-EC8D-B68A8AA58AC7",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2025-03-04 19:25:26",
		"Сost": "1 334",
		"ProducingCountry": "Mjölby",
		"AgentEmail": "dis.parturient@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "3E2CACE4-1D43-EB8A-3637-B2882216255B",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-01-11 00:32:36",
		"Сost": "57 146",
		"ProducingCountry": "Solvychegodsk",
		"AgentEmail": "quisque.tincidunt.pede@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "6F465C96-2084-5990-DBCD-5993853E27DE",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-04-08 23:51:50",
		"Сost": "27 957",
		"ProducingCountry": "Tyumen",
		"AgentEmail": "aenean.gravida@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "93DAC647-1AD0-EA3B-99DA-0673D583CAE9",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-05-03 15:52:40",
		"Сost": "98 576",
		"ProducingCountry": "Torrevieja",
		"AgentEmail": "nunc.pulvinar@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "FA6BB5E2-6965-F61B-C9CC-5B3C683D5D18",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2023-06-14 06:30:48",
		"Сost": "69 292",
		"ProducingCountry": "Tomaszów Mazowiecki",
		"AgentEmail": "tempus.scelerisque@aol.net",
		"Comments": ""
	},
	{
		"Guid": "41E8D45B-7B58-26EF-9E82-84C4BFC97CE1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-12-04 20:41:37",
		"Сost": "11 274",
		"ProducingCountry": "Jeonju",
		"AgentEmail": "dictum.magna@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "FAB2E214-A5CA-7D07-EB04-FDC8B31B96E5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2025-03-20 06:24:48",
		"Сost": "17 980",
		"ProducingCountry": "Sakhalin",
		"AgentEmail": "et.magnis@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "FCDD7B64-41D5-A4E1-CBBA-0EAA95751FA1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-08-29 09:17:43",
		"Сost": "31 209",
		"ProducingCountry": "Saint-Quentin",
		"AgentEmail": "nulla.interdum@google.com",
		"Comments": ""
	},
	{
		"Guid": "25C5E16F-F334-47EB-F4AA-06FB3081BBF4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-11-03 20:02:00",
		"Сost": "64 006",
		"ProducingCountry": "Valladolid",
		"AgentEmail": "at.nisi@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "42B9E19C-C428-85E2-FB81-E539FE02D65D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2025-01-25 13:13:14",
		"Сost": "35 332",
		"ProducingCountry": "Oberwart",
		"AgentEmail": "vulputate.dui@aol.org",
		"Comments": ""
	},
	{
		"Guid": "245CC712-FC77-41A8-E83C-0536E67A45B1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-10-19 18:43:40",
		"Сost": "41 003",
		"ProducingCountry": "St. Veit an der Glan",
		"AgentEmail": "pharetra.sed@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "64D17DCE-A2EA-69FE-16F2-3DE15B646E17",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-09-21 02:00:07",
		"Сost": "56 042",
		"ProducingCountry": "Palencia",
		"AgentEmail": "morbi.tristique@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "5925805A-F673-F2A2-3464-D2A8C5254213",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-06-28 05:03:03",
		"Сost": "48 191",
		"ProducingCountry": "Jecheon",
		"AgentEmail": "turpis.nec@google.net",
		"Comments": ""
	},
	{
		"Guid": "B0A69818-13CA-C8C8-A6BE-22B2C4E7471F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-08-28 21:35:46",
		"Сost": 786,
		"ProducingCountry": "Bottidda",
		"AgentEmail": "neque.sed.sem@aol.com",
		"Comments": ""
	},
	{
		"Guid": "E7742C78-ED15-8C1C-2257-6CC16514E244",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-08-26 18:07:48",
		"Сost": "32 640",
		"ProducingCountry": "Tulsa",
		"AgentEmail": "curae.phasellus@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "8637657B-74BE-213D-83F0-EB983BFD2D79",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2025-01-12 01:33:58",
		"Сost": "29 491",
		"ProducingCountry": "Almería",
		"AgentEmail": "varius.ultrices@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "413A2042-33E8-2815-2EA9-CB0A5FD39E45",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-04-13 03:17:39",
		"Сost": "94 418",
		"ProducingCountry": "Telfs",
		"AgentEmail": "lectus.sit@google.net",
		"Comments": ""
	},
	{
		"Guid": "F7EC1BDB-CB85-9036-90C5-B84683BBFD6D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2025-03-28 11:00:06",
		"Сost": "15 400",
		"ProducingCountry": "Orenburg",
		"AgentEmail": "ligula.nullam.feugiat@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "D5D6DD6A-747C-21DC-D49B-8C8434A6B967",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-12-06 20:25:47",
		"Сost": "84 348",
		"ProducingCountry": "San Lorenzo",
		"AgentEmail": "id.ante@google.com",
		"Comments": ""
	},
	{
		"Guid": "D2B2BB53-A536-BCB9-B993-21E5E4A4C08D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-01-19 00:13:12",
		"Сost": "20 829",
		"ProducingCountry": "Pskov",
		"AgentEmail": "lorem.ipsum.dolor@google.net",
		"Comments": ""
	},
	{
		"Guid": "27989EDD-75E5-38B6-4365-4D347C52535E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2025-04-25 22:25:11",
		"Сost": "90 485",
		"ProducingCountry": "Berlin",
		"AgentEmail": "augue.eu.tempor@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "A1C92CDA-3B92-0BA3-0B47-82B179A26FE1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-11-07 13:35:08",
		"Сost": "23 898",
		"ProducingCountry": "Sakhalin",
		"AgentEmail": "quisque.purus@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "2DEE92D4-6777-0BDB-B000-43792B114B14",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-06-20 16:15:44",
		"Сost": "89 114",
		"ProducingCountry": "Saint-Herblain",
		"AgentEmail": "cum.sociis@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "728B4E27-28E7-A209-D58B-F42713E63892",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-12-17 19:40:02",
		"Сost": "18 679",
		"ProducingCountry": "Mielec",
		"AgentEmail": "egestas.a.dui@google.couk",
		"Comments": ""
	},
	{
		"Guid": "CBEE5F03-DD8B-B896-9892-A655CBAFE242",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-02-27 04:33:32",
		"Сost": "89 800",
		"ProducingCountry": "Beersel",
		"AgentEmail": "ut@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "B6BD2C68-3512-4C2F-D8BB-917C923DB7D9",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-12-28 13:58:01",
		"Сost": "13 263",
		"ProducingCountry": "Meerdonk",
		"AgentEmail": "facilisi.sed@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "F03217F2-7471-B596-9778-E4447DBCC7C4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-10-27 21:07:15",
		"Сost": "86 520",
		"ProducingCountry": "Asigliano Veneto",
		"AgentEmail": "metus@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "66BD0288-F5D9-A24B-9BDD-85E187191B65",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2025-04-13 11:04:37",
		"Сost": "97 501",
		"ProducingCountry": "Terni",
		"AgentEmail": "cras.convallis.convallis@google.org",
		"Comments": ""
	},
	{
		"Guid": "BDD8E550-DD95-DDCC-C180-833CDC57251F",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2025-04-07 03:49:13",
		"Сost": "18 784",
		"ProducingCountry": "Alès",
		"AgentEmail": "consectetuer.mauris.id@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "0F0E26DD-D4B5-867B-8876-FFA475A5DBDD",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2025-01-07 01:16:17",
		"Сost": "7 462",
		"ProducingCountry": "Valéncia",
		"AgentEmail": "ut.ipsum@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "5714F9D8-442C-29FE-A843-FA67E392112D",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-01-05 18:55:18",
		"Сost": "44 343",
		"ProducingCountry": "Albacete",
		"AgentEmail": "tempor.augue@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "0883E7D2-9352-8125-8671-88A455D3A0F5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-03-11 01:31:08",
		"Сost": "56 814",
		"ProducingCountry": "Melilla",
		"AgentEmail": "ante.dictum@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "47CE46A1-3DC7-977C-E26B-948612F5D2A5",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-07-18 14:10:57",
		"Сost": "80 089",
		"ProducingCountry": "Beauvais",
		"AgentEmail": "enim.curabitur.massa@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "D7838248-CAB7-45E2-ABAA-8D7DB1E65AF9",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2023-06-08 08:44:05",
		"Сost": "68 293",
		"ProducingCountry": "San Chirico Nuovo",
		"AgentEmail": "nec@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "6777B7F0-486B-17E3-19B8-3D486BEF61D5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-08-03 04:28:07",
		"Сost": "24 627",
		"ProducingCountry": "Calvello",
		"AgentEmail": "at.egestas@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "4C97DBC4-A8B1-A4E8-5105-2EAF37C8B61D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-08-30 01:10:10",
		"Сost": "63 889",
		"ProducingCountry": "Berlin",
		"AgentEmail": "curabitur@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "D7955004-9ACF-591E-56D7-ACD96681723A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-02-06 10:57:14",
		"Сost": "44 354",
		"ProducingCountry": "Norrköping",
		"AgentEmail": "in@google.edu",
		"Comments": ""
	},
	{
		"Guid": "BC0358AB-87A5-B3D4-9BE8-52AD5134C77E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-07-11 09:56:45",
		"Сost": "98 522",
		"ProducingCountry": "Ryazan",
		"AgentEmail": "eros@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "7D6EC0A8-AC77-34AE-9A3E-8EE8BA022D11",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-10-29 16:53:27",
		"Сost": "30 936",
		"ProducingCountry": "Novgorod",
		"AgentEmail": "mi.ac.mattis@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "24B1A265-F1F3-1539-8C16-1E35DF8DAC86",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-12-17 05:46:20",
		"Сost": "82 616",
		"ProducingCountry": "Tours",
		"AgentEmail": "semper.nam@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "E77D2ABE-732D-2E2B-D722-1784173B0BCB",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-03-27 13:54:05",
		"Сost": "84 033",
		"ProducingCountry": "Suncheon",
		"AgentEmail": "taciti.sociosqu@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "178BE67C-6E3A-ED15-14BE-42A7ED3E872C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-10-04 03:03:21",
		"Сost": "26 953",
		"ProducingCountry": "San Cristóbal de la Laguna",
		"AgentEmail": "massa@outlook.couk",
		"Comments": ""
	},
	{
		"Guid": "27F5EDC9-3BA7-E5AC-6869-21A25E9D327C",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-01-15 16:12:28",
		"Сost": "33 753",
		"ProducingCountry": "Pamplona",
		"AgentEmail": "aliquam@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "ADE171A4-7825-FE39-A3A2-2369B4197F0A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-08-21 00:29:44",
		"Сost": "93 589",
		"ProducingCountry": "Logroño",
		"AgentEmail": "elementum.at@google.net",
		"Comments": ""
	},
	{
		"Guid": "FD93772C-2FFB-D372-F8B8-9499EB9627A6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-06-27 10:05:27",
		"Сost": "67 853",
		"ProducingCountry": "Vetlanda",
		"AgentEmail": "justo.praesent.luctus@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "71525A3A-6C15-5EF4-DC12-26405E1A19CD",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-09-05 08:15:07",
		"Сost": "30 231",
		"ProducingCountry": "Las Palmas",
		"AgentEmail": "in@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "159C94E6-9BC2-B573-9AE9-2F1A04C89E1B",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-12-10 21:18:13",
		"Сost": "22 630",
		"ProducingCountry": "Bollnäs",
		"AgentEmail": "ullamcorper.duis@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "3C8B2BCB-7E33-4A86-3D32-8465ED90AD4E",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-10-09 10:28:56",
		"Сost": "42 575",
		"ProducingCountry": "Beauvais",
		"AgentEmail": "in.cursus@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "B74FEA84-ACE9-6CD5-29B7-C32CE718B108",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-04-10 14:43:24",
		"Сost": "49 957",
		"ProducingCountry": "Värnamo",
		"AgentEmail": "sapien.cursus.in@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "EF2832B4-56D2-F13A-EA72-EB6129714ADE",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-04-29 05:41:48",
		"Сost": "6 001",
		"ProducingCountry": "León",
		"AgentEmail": "donec.est@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "AD5FFCD5-87DE-5FA4-3F75-2D757B163ED2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-08-23 22:25:21",
		"Сost": "60 590",
		"ProducingCountry": "Jeju",
		"AgentEmail": "sed.dictum@google.couk",
		"Comments": ""
	},
	{
		"Guid": "AF982BFC-469C-7D95-BA9E-BD3266AAAC52",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-02-20 19:53:22",
		"Сost": "61 354",
		"ProducingCountry": "Teruel",
		"AgentEmail": "lacus.nulla.tincidunt@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "3457684A-FAC3-7E4F-8734-7F9D71939DEC",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-08-04 07:10:15",
		"Сost": "57 801",
		"ProducingCountry": "Hollabrunn",
		"AgentEmail": "donec.tempus.lorem@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "D1D5DC8A-509E-EE46-7335-8DB684124D93",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-03-23 01:46:06",
		"Сost": "12 064",
		"ProducingCountry": "Ełk",
		"AgentEmail": "sagittis.duis@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "5916E1AB-F24B-4753-32EB-576DC07A08C5",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-07-21 07:45:29",
		"Сost": "71 452",
		"ProducingCountry": "De Klinge",
		"AgentEmail": "commodo.auctor@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "BB5DEA71-1645-6684-D013-986A62593193",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2025-03-24 14:28:09",
		"Сost": "47 381",
		"ProducingCountry": "Enns",
		"AgentEmail": "a.purus.duis@aol.org",
		"Comments": ""
	},
	{
		"Guid": "12252ED1-B279-FB1B-7821-7D066756FBB5",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-07-21 16:53:05",
		"Сost": "73 283",
		"ProducingCountry": "Kemerovo",
		"AgentEmail": "dictum@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "B96A93EA-FDF4-D53F-68BA-61EDDFED3D4F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-08-22 08:47:22",
		"Сost": "6 488",
		"ProducingCountry": "Huesca",
		"AgentEmail": "augue@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "C9D01C17-8963-B229-2ABC-5665CE71E62E",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-10-11 17:09:30",
		"Сost": "32 479",
		"ProducingCountry": "Pelago",
		"AgentEmail": "est.mauris@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "33141439-B3CC-352C-9815-3ED9469CFE87",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-10-16 03:58:12",
		"Сost": "44 373",
		"ProducingCountry": "Innsbruck",
		"AgentEmail": "mauris.erat.eget@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "A671489C-0AC3-153C-D1B9-FCCFDC6A5D1E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-09-20 11:15:58",
		"Сost": "99 777",
		"ProducingCountry": "Traiskirchen",
		"AgentEmail": "et.ipsum.cursus@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "B05EB117-EE58-54AD-4E15-3CAA64C428C6",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-10-27 11:01:01",
		"Сost": "87 489",
		"ProducingCountry": "Mora",
		"AgentEmail": "euismod.urna@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "D7634313-6D4A-8B75-711D-D2A8A6439884",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-07-06 18:44:51",
		"Сost": "1 675",
		"ProducingCountry": "Kaluga",
		"AgentEmail": "tempus@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "513CC86B-E9E5-B532-E3C4-CB04286A8690",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-02-29 11:44:57",
		"Сost": "85 618",
		"ProducingCountry": "Gasteiz",
		"AgentEmail": "primis@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "40C6CAAD-5918-1F55-1254-A6DA3822E940",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-07-09 18:54:44",
		"Сost": "57 967",
		"ProducingCountry": "Deutschkreutz",
		"AgentEmail": "vivamus.sit@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "782C5B3B-2D84-0DF9-E981-391ECFC64160",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-06-08 19:15:14",
		"Сost": 973,
		"ProducingCountry": "Altamura",
		"AgentEmail": "tellus.aenean@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "68B25F5F-AE32-6BC3-681A-E14A17DB0B31",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-12-03 16:02:52",
		"Сost": "32 617",
		"ProducingCountry": "Waarmaarde",
		"AgentEmail": "eleifend.nunc@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "D7B07AC6-49B5-0AE6-984D-15816D2E2AA0",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-07-19 14:32:47",
		"Сost": "54 207",
		"ProducingCountry": "Volgograd",
		"AgentEmail": "massa@google.org",
		"Comments": ""
	},
	{
		"Guid": "75ECE603-5553-C658-7123-A9E9C8DA6A15",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-10-02 15:15:19",
		"Сost": "97 165",
		"ProducingCountry": "Tambov",
		"AgentEmail": "scelerisque.neque@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "170C9746-A2D5-1B08-B5B7-4EB127C4B60E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-10-05 00:18:32",
		"Сost": "14 992",
		"ProducingCountry": "Linköping",
		"AgentEmail": "non.sollicitudin@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "6EC2E6A5-3241-0092-21F3-97EACCCBC50D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2023-06-15 23:57:35",
		"Сost": "96 806",
		"ProducingCountry": "Finkenstein am Faaker See",
		"AgentEmail": "nisl.sem@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "8A7B98DE-7787-D52B-9A1C-6A36EB4AB2D8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-11-17 08:22:02",
		"Сost": "57 494",
		"ProducingCountry": "Söderhamn",
		"AgentEmail": "in.faucibus.orci@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "8E7181A1-EE5A-189D-8688-AD43AB4C615F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-06-19 11:44:14",
		"Сost": "56 619",
		"ProducingCountry": "Kędzierzyn-Koźle",
		"AgentEmail": "lorem@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "8BFFAEBA-EE4E-0368-4B96-C8E5624BC95E",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-07-09 00:38:28",
		"Сost": "55 304",
		"ProducingCountry": "Bad Vöslau",
		"AgentEmail": "vulputate@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "A9DEAE9D-421B-47ED-9ED5-A6F68476DAD6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-02-16 17:51:45",
		"Сost": "93 248",
		"ProducingCountry": "Kungälv",
		"AgentEmail": "nibh.dolor@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "72A91633-BDD9-4478-633D-5A2355A615ED",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-10-03 12:30:55",
		"Сost": "79 195",
		"ProducingCountry": "Cheongju",
		"AgentEmail": "mauris.magna@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "2A85DC5A-AAEC-B875-A727-473584B26DB4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-04-16 19:35:18",
		"Сost": "55 241",
		"ProducingCountry": "Madison",
		"AgentEmail": "nisl.sem@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "EED2491D-63AE-4B4F-7A15-A6BF1A2ED84A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-10-17 17:15:13",
		"Сost": "65 765",
		"ProducingCountry": "Norrköping",
		"AgentEmail": "mi.duis@google.edu",
		"Comments": ""
	},
	{
		"Guid": "421EA553-94D6-3BE5-175D-04587CA48305",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2025-04-18 06:38:46",
		"Сost": "71 660",
		"ProducingCountry": "Wals-Siezenheim",
		"AgentEmail": "ultricies.ligula@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "7EAC26DD-A45A-2847-C587-4BCBF64B22E0",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-05-26 11:42:41",
		"Сost": "1 694",
		"ProducingCountry": "Ehein",
		"AgentEmail": "pharetra@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "6F4B19BF-5F8D-482E-1CCF-759C2E45500D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2025-02-15 00:57:45",
		"Сost": "52 484",
		"ProducingCountry": "Santander",
		"AgentEmail": "neque.tellus@yahoo.com",
		"Comments": ""
	},
	{
		"Guid": "9092146B-E434-D6F4-87C6-B14F964A6953",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-03-22 10:04:17",
		"Сost": "8 927",
		"ProducingCountry": "Essen",
		"AgentEmail": "tellus.phasellus@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "58118B9C-9AAB-E54D-3E73-7C2D71347684",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-12-24 00:44:15",
		"Сost": "76 228",
		"ProducingCountry": "Dangjin",
		"AgentEmail": "ac.mi.eleifend@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "E3C413A6-07A4-9ECC-9222-8A2C2021DBD8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2025-02-27 15:29:10",
		"Сost": "12 672",
		"ProducingCountry": "Kempten",
		"AgentEmail": "nec.metus@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "707EABA9-E7D1-E6A4-DCFD-5A97B1865287",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-06-02 16:43:51",
		"Сost": "61 055",
		"ProducingCountry": "Åkersberga",
		"AgentEmail": "lobortis.quis.pede@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "D8ED88DE-857C-9B4D-BC9D-F066725F3342",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2025-01-30 08:58:07",
		"Сost": "93 570",
		"ProducingCountry": "Moscow",
		"AgentEmail": "pede.nonummy@google.couk",
		"Comments": ""
	},
	{
		"Guid": "88793DAB-174B-08A3-F7B7-DB843451F164",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-12-04 10:16:15",
		"Сost": "23 187",
		"ProducingCountry": "Atlanta",
		"AgentEmail": "proin.velit@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "397A415B-B438-426B-92B4-4A1BEDDD23A1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-07-31 18:22:58",
		"Сost": "49 571",
		"ProducingCountry": "Orenburg",
		"AgentEmail": "blandit.nam@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "192EB815-F44C-FE17-1B35-B4A5C16C248B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-07-20 14:15:27",
		"Сost": "49 030",
		"ProducingCountry": "Santander",
		"AgentEmail": "convallis.ligula.donec@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "34B40933-6716-223C-E69D-476AA9AD7056",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2025-03-13 08:29:20",
		"Сost": "5 662",
		"ProducingCountry": "Pontevedra",
		"AgentEmail": "dolor@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "4EBBD2C4-143A-41C1-C95A-A6572AE72017",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-06-11 10:54:45",
		"Сost": "8 132",
		"ProducingCountry": "Logroño",
		"AgentEmail": "dolor.egestas@google.org",
		"Comments": ""
	},
	{
		"Guid": "EDFE3C22-94CB-61BD-8CD1-7A204B9E6B94",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-04-26 22:34:20",
		"Сost": "91 486",
		"ProducingCountry": "Wolfurt",
		"AgentEmail": "erat@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "610FFE2D-E147-CE4A-6F68-CE637824CACE",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-03-30 22:27:00",
		"Сost": "33 788",
		"ProducingCountry": "Mörfelden-Walldorf",
		"AgentEmail": "lacus@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "C8A6826E-85A7-0AE2-4C98-425649DA9AFE",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-05-16 06:11:51",
		"Сost": "74 253",
		"ProducingCountry": "Saalfelden am Steinernen Meer",
		"AgentEmail": "natoque@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "BD679056-C1BC-9142-AAC8-447ACD143E56",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-03-29 18:31:13",
		"Сost": "16 786",
		"ProducingCountry": "Metz",
		"AgentEmail": "consequat@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "663C8F44-56BE-0C4C-324C-E610CC5EF5C8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-04-05 06:56:34",
		"Сost": "39 914",
		"ProducingCountry": "Madrid",
		"AgentEmail": "sed.malesuada.augue@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "39387EB7-31D5-55D9-B3BC-786C5A4ED883",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2025-01-02 06:59:03",
		"Сost": "42 679",
		"ProducingCountry": "Vöcklabruck",
		"AgentEmail": "ante.nunc@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "41ED9544-DD46-6CF4-64C3-90D2834FD4D9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-06-27 12:31:38",
		"Сost": "85 871",
		"ProducingCountry": "Gijón",
		"AgentEmail": "aenean.gravida@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "B82D6CB4-996B-D7B1-E58C-B1B58A2D53AA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-05-06 05:01:13",
		"Сost": "99 253",
		"ProducingCountry": "Avesta",
		"AgentEmail": "est@google.ca",
		"Comments": ""
	},
	{
		"Guid": "3566153C-D67C-EA21-F472-BD2B8982632E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-07-28 03:40:54",
		"Сost": "52 252",
		"ProducingCountry": "Bevagna",
		"AgentEmail": "molestie.sodales@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "81BDE992-8281-3A83-4BEE-351774DA2771",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-11-13 02:55:22",
		"Сost": "12 267",
		"ProducingCountry": "Badajoz",
		"AgentEmail": "neque.morbi.quis@aol.net",
		"Comments": ""
	},
	{
		"Guid": "AE97DCD8-75A3-E49C-A23D-DD9D87781B6C",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-02-07 18:30:59",
		"Сost": "40 463",
		"ProducingCountry": "Laval",
		"AgentEmail": "hymenaeos@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "1967D49D-CADF-731A-9653-875B35EA7EF0",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2025-02-11 07:53:34",
		"Сost": "32 831",
		"ProducingCountry": "Cáceres",
		"AgentEmail": "risus.nulla@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "9E55DB28-4627-CD4C-61A6-94AB23E1E9FC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-09-04 14:10:11",
		"Сost": "7 493",
		"ProducingCountry": "Marseille",
		"AgentEmail": "diam@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "1587CCAD-E6AE-ECD3-CB64-857F8ABAA901",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-05-12 15:04:19",
		"Сost": "75 889",
		"ProducingCountry": "Jeju",
		"AgentEmail": "dolor.dapibus@google.couk",
		"Comments": ""
	},
	{
		"Guid": "BD613EE2-C93F-EB4E-CCDD-568EC59EDD71",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-11-19 18:46:03",
		"Сost": "78 940",
		"ProducingCountry": "Namyangju",
		"AgentEmail": "dictum@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "2CE3D838-BFAC-5476-316A-7D7D0FD24BFA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2025-02-26 22:25:53",
		"Сost": "14 052",
		"ProducingCountry": "Celle",
		"AgentEmail": "ornare.fusce.mollis@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "13446D0C-9AA9-36C9-6431-1C753967A7CD",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-12-24 02:53:05",
		"Сost": "83 388",
		"ProducingCountry": "Sambreville",
		"AgentEmail": "tempor.erat@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "3214C266-5A8A-83DA-564B-A43852793EA2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-07-07 19:24:16",
		"Сost": "39 474",
		"ProducingCountry": "Calais",
		"AgentEmail": "at@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "A4196814-AC77-1BE4-5F87-7A1B0DC49DB2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-10-15 14:02:23",
		"Сost": "93 062",
		"ProducingCountry": "Paju",
		"AgentEmail": "elit.pellentesque.a@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "B943EC21-B6C4-6E15-27F0-54F2314E7D35",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-12-21 00:19:34",
		"Сost": "58 361",
		"ProducingCountry": "Gary",
		"AgentEmail": "ut@aol.net",
		"Comments": ""
	},
	{
		"Guid": "D343B6EB-43D7-49C6-C7AB-B516EEC1695C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-07-17 18:54:24",
		"Сost": "32 658",
		"ProducingCountry": "Campobasso",
		"AgentEmail": "sociis@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "8924E405-12B1-1778-35D9-BE8AA2B5B3D8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2025-04-24 17:14:50",
		"Сost": "62 403",
		"ProducingCountry": "Kelkheim",
		"AgentEmail": "dis.parturient@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "E3BE1AF3-1B01-807C-8493-8FFFDDD2A7D4",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-12-25 22:48:22",
		"Сost": "33 580",
		"ProducingCountry": "Jeju",
		"AgentEmail": "at.augue@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "16406BC5-C7B4-1D7A-8097-B26A912045FD",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-05-09 19:52:04",
		"Сost": "32 317",
		"ProducingCountry": "Wittenberg",
		"AgentEmail": "id.sapien.cras@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "223E3273-5428-73BD-ABCC-1AE7ECEC8332",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-04-06 20:21:09",
		"Сost": "2 841",
		"ProducingCountry": "Gijón",
		"AgentEmail": "ultricies.dignissim.lacus@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "ABEF9E42-9713-249B-A1A5-8751D55E99C7",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-06-04 20:59:24",
		"Сost": "96 021",
		"ProducingCountry": "San Giovanni la Punta",
		"AgentEmail": "purus@aol.net",
		"Comments": ""
	},
	{
		"Guid": "BA2E996E-A7E5-8485-5AED-B673687A48A5",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-02-05 22:16:27",
		"Сost": "33 190",
		"ProducingCountry": "Innsbruck",
		"AgentEmail": "amet@outlook.couk",
		"Comments": ""
	},
	{
		"Guid": "7EA32A00-68A8-8CDA-1A7D-DF2AACDA4DA3",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-10-28 07:13:16",
		"Сost": "9 155",
		"ProducingCountry": "Orvault",
		"AgentEmail": "varius.orci@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "E267D5DE-D497-B895-8FBC-14892673379C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2025-03-18 23:50:50",
		"Сost": "4 802",
		"ProducingCountry": "Orsogna",
		"AgentEmail": "felis.nulla@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "2B4D9B9E-31FD-5196-9359-04D2E905B901",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-11-17 23:47:20",
		"Сost": "74 316",
		"ProducingCountry": "Elmshorn",
		"AgentEmail": "malesuada.vel@google.org",
		"Comments": ""
	},
	{
		"Guid": "467F8B95-BB50-6524-5433-CE1346896A4C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2025-02-23 23:40:42",
		"Сost": "24 542",
		"ProducingCountry": "Yaroslavl",
		"AgentEmail": "fusce@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "6851A97C-575D-98C9-9AE6-D9EB6CA21178",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2025-01-18 01:05:51",
		"Сost": "93 918",
		"ProducingCountry": "Tarzo",
		"AgentEmail": "placerat.cras.dictum@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "A0B7B888-638E-5457-E828-2A9F6D28DEA7",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-05-07 13:26:20",
		"Сost": "35 391",
		"ProducingCountry": "Berlin",
		"AgentEmail": "eleifend.vitae.erat@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "F4667735-A09E-45FD-7FEC-416AA51177D3",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-06-25 16:49:33",
		"Сost": "67 542",
		"ProducingCountry": "Gatchina",
		"AgentEmail": "mi.aliquam.gravida@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "9E728BFF-CF8E-C625-5DE2-166943E4E163",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2025-04-15 08:51:28",
		"Сost": "19 344",
		"ProducingCountry": "Värnamo",
		"AgentEmail": "nibh.lacinia@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "4D972580-491C-8E12-D97B-F309B4E7372C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-11-15 02:36:29",
		"Сost": "72 563",
		"ProducingCountry": "Anchorage",
		"AgentEmail": "semper@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "C7B1714C-2026-61DD-17ED-C3B9335835B8",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-02-20 13:07:03",
		"Сost": 170,
		"ProducingCountry": "Orenburg",
		"AgentEmail": "nisi.dictum.augue@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "79C3B421-5A93-3E12-D616-4108E73BA523",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-04-06 22:16:28",
		"Сost": "63 346",
		"ProducingCountry": "Saarlouis",
		"AgentEmail": "turpis.vitae@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "1C999557-F34E-69F1-18CC-E0EA39C42DEF",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-12-03 08:42:50",
		"Сost": "53 931",
		"ProducingCountry": "Portland",
		"AgentEmail": "praesent.eu@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "99767187-D36A-5D86-73F4-0A5591A62EF9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-03-24 15:52:47",
		"Сost": "94 273",
		"ProducingCountry": "Vielsalm",
		"AgentEmail": "eu.placerat@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "6C2F574D-6EA4-774A-237F-7C78566D510A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-09-26 04:10:55",
		"Сost": "43 311",
		"ProducingCountry": "Nonsan",
		"AgentEmail": "vel@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "9A4EDDFA-E76C-4434-FA36-6231F96D45B4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-08-13 14:08:51",
		"Сost": "80 730",
		"ProducingCountry": "Vannes",
		"AgentEmail": "mauris.sit@google.ca",
		"Comments": ""
	},
	{
		"Guid": "D9EC41D8-F0ED-34A5-20F5-A34916B789A6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-09-08 07:16:45",
		"Сost": "40 364",
		"ProducingCountry": "Ajaccio",
		"AgentEmail": "ac.libero@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "D5A7543A-592A-E76C-366F-173170BE434D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-12-02 01:22:51",
		"Сost": "3 983",
		"ProducingCountry": "Płock",
		"AgentEmail": "fringilla.porttitor.vulputate@google.edu",
		"Comments": ""
	},
	{
		"Guid": "11591AC8-C352-FBDB-775B-DB4637A4EAA6",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-10-11 02:35:40",
		"Сost": "2 378",
		"ProducingCountry": "Orenburg",
		"AgentEmail": "fames.ac.turpis@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "777455C2-DB58-1A48-08E2-F9125843B0DC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-02-27 15:41:09",
		"Сost": "29 427",
		"ProducingCountry": "Bosa",
		"AgentEmail": "nunc.est@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "9ECC06D9-E6DE-3E7B-3547-CD9828F45343",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-06-07 00:03:05",
		"Сost": "79 174",
		"ProducingCountry": "Feldkirch",
		"AgentEmail": "et.malesuada@google.ca",
		"Comments": ""
	},
	{
		"Guid": "63D64A9A-C747-DAA3-935B-B217ADE18BDE",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2023-06-28 02:17:32",
		"Сost": "36 406",
		"ProducingCountry": "Berlin",
		"AgentEmail": "lorem.ut.aliquam@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "68281FC4-2ADB-DBED-76AB-3565361D5F21",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-05-27 04:22:09",
		"Сost": "35 392",
		"ProducingCountry": "Bekegem",
		"AgentEmail": "ut.sagittis.lobortis@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "CE86A3FC-B77B-E237-7085-73250C6C32A4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2023-06-11 16:32:39",
		"Сost": "42 960",
		"ProducingCountry": "Yeosu",
		"AgentEmail": "eu.tempor@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "83107069-334B-F9D9-5DEC-AA31428BAC17",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-12-29 03:17:47",
		"Сost": "43 893",
		"ProducingCountry": "Vidnoye",
		"AgentEmail": "est.mauris.rhoncus@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "09E4C41B-9BCE-216C-8ECA-EABD29240D14",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2023-12-24 11:28:00",
		"Сost": 220,
		"ProducingCountry": "Saint Paul",
		"AgentEmail": "morbi@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "7658B4D9-4AEF-845E-FD6C-A63329E012AA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-06-17 18:34:11",
		"Сost": "2 379",
		"ProducingCountry": "Mora",
		"AgentEmail": "a.arcu@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "53A1B1C9-787E-D646-1EF7-0073D77BB7CF",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-07-27 09:23:28",
		"Сost": "6 381",
		"ProducingCountry": "Bexbach",
		"AgentEmail": "sollicitudin.commodo@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "5BB73BA7-DC96-61E5-BB19-7E518BDD7A6A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2025-03-24 20:18:36",
		"Сost": "82 481",
		"ProducingCountry": "Neder-Over-Heembeek",
		"AgentEmail": "nulla.tempor@google.com",
		"Comments": ""
	},
	{
		"Guid": "4DAB72F1-C886-A7DF-89EE-9ED1A4A316EC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2023-07-26 00:44:16",
		"Сost": "73 601",
		"ProducingCountry": "Bergen Mons",
		"AgentEmail": "in.magna@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "51AAEB47-AA84-4C5A-9BD8-8FBB1F75C286",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-06-16 15:42:23",
		"Сost": "7 227",
		"ProducingCountry": "Ceuta",
		"AgentEmail": "eros.turpis@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "31B4F445-1EE8-4D4B-57FD-34486545BB1D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-05-03 02:28:38",
		"Сost": "66 537",
		"ProducingCountry": "Creil",
		"AgentEmail": "non.sollicitudin.a@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "AA56A9EE-C574-DCC9-C2C7-B4E5759F81B4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-01-24 17:04:30",
		"Сost": "51 038",
		"ProducingCountry": "Gatchina",
		"AgentEmail": "gravida.nunc.sed@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "95924513-64AC-748D-5395-64CD6842462A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-10-09 02:15:26",
		"Сost": "97 398",
		"ProducingCountry": "Blieskastel",
		"AgentEmail": "erat.vel@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "5CE29BB9-7BA7-3557-BB29-6CB86F03C7B2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-11-03 12:34:57",
		"Сost": "45 444",
		"ProducingCountry": "Svobodny",
		"AgentEmail": "pellentesque.tellus.sem@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "EB14E70D-8753-C189-59D5-4488A2754212",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-12-13 03:21:12",
		"Сost": "94 514",
		"ProducingCountry": "Sevastopol",
		"AgentEmail": "mauris.aliquam.eu@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "52E54BC1-1943-D2F8-E74B-4E691E2BC743",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-02-09 12:08:20",
		"Сost": "48 237",
		"ProducingCountry": "Bad Vöslau",
		"AgentEmail": "tellus.phasellus@google.edu",
		"Comments": ""
	},
	{
		"Guid": "CE936AB6-D48C-A2D6-801B-A9C19C989598",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-12-26 04:25:31",
		"Сost": "67 534",
		"ProducingCountry": "Telfs",
		"AgentEmail": "molestie.dapibus@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "223179E9-16CC-44D6-E138-8FB48783F249",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2023-08-28 01:58:06",
		"Сost": "10 213",
		"ProducingCountry": "Squillace",
		"AgentEmail": "nisl@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "517E4565-57DA-9B8D-DC82-41066793BC79",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-03-13 09:38:02",
		"Сost": "1 239",
		"ProducingCountry": "Bremerhaven",
		"AgentEmail": "luctus@google.couk",
		"Comments": ""
	},
	{
		"Guid": "A7574B71-BC64-1987-986C-608B5B93CCFA",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-01-09 22:30:50",
		"Сost": "37 329",
		"ProducingCountry": "Berlin",
		"AgentEmail": "donec.luctus@aol.com",
		"Comments": ""
	},
	{
		"Guid": "77C34C58-04F9-C158-E547-4539A7E87C41",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-06-06 16:54:43",
		"Сost": "70 741",
		"ProducingCountry": "Gooik",
		"AgentEmail": "odio.semper@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "E6FBC8CD-1994-5602-9D15-5501731E55CC",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-09-11 03:19:41",
		"Сost": "75 365",
		"ProducingCountry": "Impe",
		"AgentEmail": "eu.ligula@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "54BA7D35-C78E-C025-52FA-8CE75D7952CC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-03-07 22:46:54",
		"Сost": "65 113",
		"ProducingCountry": "Vienna",
		"AgentEmail": "molestie@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "0D8E80C3-8EA2-C99E-3B26-34B4936504AA",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-01-13 07:43:23",
		"Сost": "27 232",
		"ProducingCountry": "Boryeong",
		"AgentEmail": "a.facilisis@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "C18DEEE1-A9E5-E922-B3A8-2E1E38A1246D",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2025-02-07 04:18:16",
		"Сost": "17 207",
		"ProducingCountry": "Baden",
		"AgentEmail": "sem.mollis@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "D478707B-D321-512B-6A2B-31460D932211",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-09-09 16:50:10",
		"Сost": "16 103",
		"ProducingCountry": "Bastia",
		"AgentEmail": "enim@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "D5062503-578C-16ED-168A-23E1A74D9343",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-07-31 11:46:57",
		"Сost": "71 974",
		"ProducingCountry": "Bad Homburg v. d. Höhe",
		"AgentEmail": "donec.dignissim@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "213EA650-0CC5-4BA2-0062-5A4BA32951B4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-09-11 18:46:17",
		"Сost": "35 954",
		"ProducingCountry": "Bellevue",
		"AgentEmail": "ut@google.org",
		"Comments": ""
	},
	{
		"Guid": "89372259-428B-F8AE-A7E5-15F85C61AA4E",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-03-21 11:33:59",
		"Сost": "83 050",
		"ProducingCountry": "Habay",
		"AgentEmail": "nec.ligula@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "752F24C4-7A38-4263-1931-5AC259BA81A3",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-08-02 15:15:39",
		"Сost": "59 133",
		"ProducingCountry": "Omsk",
		"AgentEmail": "ut.odio.vel@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "737299C8-7EE0-A7FD-7C09-4D64437BEE8D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2023-07-21 10:08:42",
		"Сost": "75 204",
		"ProducingCountry": "Delitzsch",
		"AgentEmail": "vulputate.lacus@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "322C9CDC-34CD-E2DD-6AE2-A58A46D05363",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2025-03-03 07:25:18",
		"Сost": "41 009",
		"ProducingCountry": "Rostock",
		"AgentEmail": "vitae.aliquet@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "EC5D7405-F99B-DE6F-7335-337186ABB3E4",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-05-06 03:06:02",
		"Сost": "47 391",
		"ProducingCountry": "Gliwice",
		"AgentEmail": "a.sollicitudin.orci@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "7EB74673-1F6F-9674-F869-2EC71DB2F539",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-08-10 14:22:26",
		"Сost": "85 070",
		"ProducingCountry": "Kurgan",
		"AgentEmail": "sed.turpis@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "16C7D354-833B-4214-7476-ECDB6E3556CB",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-11-29 16:27:25",
		"Сost": "35 433",
		"ProducingCountry": "Saint-Marcel",
		"AgentEmail": "gravida.nunc@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "B37E50F4-44BB-5C63-85CD-D93E5C55D7A4",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2025-02-27 12:25:40",
		"Сost": "1 391",
		"ProducingCountry": "Sandviken",
		"AgentEmail": "lobortis.class@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "407B74BB-3D62-632D-DC08-C965785B4293",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2025-04-17 08:54:57",
		"Сost": "94 726",
		"ProducingCountry": "Königs Wusterhausen",
		"AgentEmail": "dictum.ultricies@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "EFA721A2-D84E-233D-2F29-911947D7BD64",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-03-09 12:00:23",
		"Сost": "2 887",
		"ProducingCountry": "Glendale",
		"AgentEmail": "arcu@google.org",
		"Comments": ""
	},
	{
		"Guid": "498C23D9-04E1-030C-CB2C-DD59656932A6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-05-30 14:30:05",
		"Сost": "47 095",
		"ProducingCountry": "Riesa",
		"AgentEmail": "posuere.enim@google.org",
		"Comments": ""
	},
	{
		"Guid": "5F758441-6DE2-2756-CB8E-7AE38DC1BA53",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-02-12 18:24:31",
		"Сost": "10 599",
		"ProducingCountry": "Konstanz",
		"AgentEmail": "commodo@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "077C252B-2036-B2D9-352B-E3CEA54E7CD1",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-07-03 14:03:27",
		"Сost": "19 914",
		"ProducingCountry": "Ivangorod",
		"AgentEmail": "a.magna.lorem@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "6988899F-EB74-4812-A2CC-7C1975E45A32",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-06-10 23:17:41",
		"Сost": "23 165",
		"ProducingCountry": "Zevekote",
		"AgentEmail": "gravida.praesent.eu@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "3A50A915-E135-A198-7D9D-8E41C39756E2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-01-25 05:52:53",
		"Сost": "68 983",
		"ProducingCountry": "Teruel",
		"AgentEmail": "morbi.accumsan.laoreet@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "0B9E581E-C618-5E53-8B1A-07D18E2CA8D8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-07-23 08:05:22",
		"Сost": "61 428",
		"ProducingCountry": "Kirov",
		"AgentEmail": "non.dapibus@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "48F29379-8EC3-BA6D-1B1F-8A637D7570A3",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2025-02-21 20:26:57",
		"Сost": "41 678",
		"ProducingCountry": "Tomaszów Mazowiecki",
		"AgentEmail": "cursus.vestibulum@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "6A512A1B-C5D9-8623-92BC-D05821928CF8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-06-27 04:26:44",
		"Сost": "6 029",
		"ProducingCountry": "Cherbourg-Octeville",
		"AgentEmail": "libero.mauris.aliquam@google.edu",
		"Comments": ""
	},
	{
		"Guid": "7E97AA4A-9039-B7CE-ABA2-FA036A92442A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-05-17 23:17:55",
		"Сost": "30 856",
		"ProducingCountry": "Gmunden",
		"AgentEmail": "nulla.dignissim@google.ca",
		"Comments": ""
	},
	{
		"Guid": "A43CCD31-DEA9-C169-6AE7-A2572BB81B9A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-10-02 16:39:27",
		"Сost": "47 345",
		"ProducingCountry": "Bastia Umbra",
		"AgentEmail": "diam.nunc@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "3AF12827-C198-22E3-9ECE-5826C1AFA308",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-07-24 08:52:26",
		"Сost": "57 007",
		"ProducingCountry": "Ávila",
		"AgentEmail": "imperdiet.nec@google.ca",
		"Comments": ""
	},
	{
		"Guid": "0DB5FBAB-DCB8-EAB2-B683-CABF17DAAB41",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2025-04-29 12:54:31",
		"Сost": "20 864",
		"ProducingCountry": "Mülheim",
		"AgentEmail": "tincidunt.tempus@google.ca",
		"Comments": ""
	},
	{
		"Guid": "974B82BA-EC7B-4AEF-6652-E696733537C3",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-04-09 00:59:26",
		"Сost": 238,
		"ProducingCountry": "Berlin",
		"AgentEmail": "ipsum.ac.mi@aol.net",
		"Comments": ""
	},
	{
		"Guid": "B8824122-ED5D-01B2-1437-108E7517D556",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2024-09-06 04:17:27",
		"Сost": "62 364",
		"ProducingCountry": "Smolensk",
		"AgentEmail": "vulputate@google.edu",
		"Comments": ""
	},
	{
		"Guid": "2D3668B8-4EB7-795C-7031-44D99B9035C7",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2025-04-01 15:27:22",
		"Сost": "82 143",
		"ProducingCountry": "Beho",
		"AgentEmail": "lacinia@aol.org",
		"Comments": ""
	},
	{
		"Guid": "8640EF51-EA6A-836F-B29E-D4F5D90FBAD9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-08-17 08:57:12",
		"Сost": "46 113",
		"ProducingCountry": "Schwaz",
		"AgentEmail": "duis.volutpat.nunc@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "DC023C3A-E8C2-45AB-FE09-AB2EBC213CBA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-09-23 01:22:56",
		"Сost": "20 150",
		"ProducingCountry": "Segovia",
		"AgentEmail": "malesuada.id@aol.com",
		"Comments": ""
	},
	{
		"Guid": "A9D2C4C8-71EE-1DAE-244B-F054538368E8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2025-03-21 03:37:45",
		"Сost": "46 131",
		"ProducingCountry": "Heist-op-den-Berg",
		"AgentEmail": "convallis.dolor.quisque@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "6DD833E0-9866-8D22-DA49-695C2860299D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-01-17 09:08:16",
		"Сost": "92 423",
		"ProducingCountry": "Skövde",
		"AgentEmail": "consequat@protonmail.ca",
		"Comments": ""
	},
	{
		"Guid": "A20A674F-0383-838B-C8BA-47DA6D918EC6",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-10-05 08:01:47",
		"Сost": "13 464",
		"ProducingCountry": "Kostroma",
		"AgentEmail": "mauris.id@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "C1B7063F-4A66-933F-C73B-3B549E421586",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-11-23 13:10:18",
		"Сost": "1 439",
		"ProducingCountry": "Berlin",
		"AgentEmail": "pede.suspendisse.dui@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "5B3C2BE4-AA88-3AED-6F58-2F7D433793EF",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-12-10 07:04:38",
		"Сost": "55 546",
		"ProducingCountry": "West Valley City",
		"AgentEmail": "nec.eleifend@google.net",
		"Comments": ""
	},
	{
		"Guid": "39A738E8-FCB0-A9E6-A705-F3648C2E9005",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-05-28 03:52:05",
		"Сost": "27 679",
		"ProducingCountry": "Tyumen",
		"AgentEmail": "egestas.urna@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "5CA3704B-73DB-15CA-542B-F14DDC0C2915",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-09-09 09:48:08",
		"Сost": "87 587",
		"ProducingCountry": "Oudenburg",
		"AgentEmail": "etiam.gravida.molestie@protonmail.ca",
		"Comments": ""
	},
	{
		"Guid": "0A94CB9E-5DE7-4BCD-A112-5EAE75DBED59",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-09-27 16:29:05",
		"Сost": "45 173",
		"ProducingCountry": "A Coruña",
		"AgentEmail": "ac.mattis@google.net",
		"Comments": ""
	},
	{
		"Guid": "D4D83616-148D-5BB2-FD05-82892D5D2D3F",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-04-27 15:42:24",
		"Сost": "73 717",
		"ProducingCountry": "Dongelberg",
		"AgentEmail": "ut@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "EFC79C81-7F95-FF42-A067-17AC274729A8",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-12-22 23:00:08",
		"Сost": "20 022",
		"ProducingCountry": "Yeosu",
		"AgentEmail": "quis.arcu.vel@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "A93832E3-8D12-9599-AB7C-EE70DECA71E5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-12-12 21:51:52",
		"Сost": "54 191",
		"ProducingCountry": "Outrijve",
		"AgentEmail": "sapien@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "7619962A-4F74-972D-6236-7E01D88EE1D5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2025-01-21 10:00:42",
		"Сost": "48 663",
		"ProducingCountry": "LiŽge",
		"AgentEmail": "nec.malesuada@google.net",
		"Comments": ""
	},
	{
		"Guid": "2E494877-627D-5DFE-E2F8-459DDC2D4959",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-12-08 01:48:56",
		"Сost": "68 314",
		"ProducingCountry": "Ludwigsfelde",
		"AgentEmail": "vitae.mauris@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "9E90A6FB-C3EC-94D7-8965-470B5E7B960B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-06-30 08:23:03",
		"Сost": "10 446",
		"ProducingCountry": "Vielsalm",
		"AgentEmail": "mauris.vestibulum@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "84A5B9D6-2E8E-33A4-9E62-8237F396B3CE",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2023-10-31 21:50:14",
		"Сost": "98 055",
		"ProducingCountry": "Zele",
		"AgentEmail": "duis.mi@google.edu",
		"Comments": ""
	},
	{
		"Guid": "25BA6C5A-1A97-9451-29AC-573A1171B208",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-06-21 17:16:58",
		"Сost": "40 443",
		"ProducingCountry": "Ludvika",
		"AgentEmail": "nulla.facilisis@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "588042AD-42FC-5B16-14CD-E2327D515C28",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-06-06 23:37:39",
		"Сost": "67 709",
		"ProducingCountry": "Tarrasa",
		"AgentEmail": "consectetuer.euismod@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "5143AE04-D881-60EE-4C14-CE9249D2D9FF",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2025-02-23 15:10:30",
		"Сost": "6 807",
		"ProducingCountry": "Landshut",
		"AgentEmail": "id.magna@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "B0B6C991-BABB-3330-4FC3-AE2858464F10",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2023-05-15 20:04:05",
		"Сost": "59 147",
		"ProducingCountry": "Murcia",
		"AgentEmail": "fermentum.risus@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "83E53BBB-A37E-0BD6-E176-43065167487D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-06-14 07:21:27",
		"Сost": "70 230",
		"ProducingCountry": "Bakal",
		"AgentEmail": "dignissim@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "ED54EE0D-537E-E47E-43C9-53C7E971B9BB",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-12-17 16:14:33",
		"Сost": "10 482",
		"ProducingCountry": "Clermont-Ferrand",
		"AgentEmail": "semper.tellus@aol.org",
		"Comments": ""
	},
	{
		"Guid": "DCD194A4-47CC-266A-66DF-8229A2E7E6C2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-07-26 04:45:31",
		"Сost": "37 741",
		"ProducingCountry": "Pamplona",
		"AgentEmail": "morbi.metus@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "AAC76CE5-E049-476C-EAD3-0CCFA2A0CEC2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-09-25 23:47:51",
		"Сost": "38 105",
		"ProducingCountry": "Gongju",
		"AgentEmail": "neque@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "4E1E75D1-BD35-CCAE-071C-6F343CDA5CED",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-06-15 08:33:08",
		"Сost": "89 628",
		"ProducingCountry": "Neuruppin",
		"AgentEmail": "suspendisse.aliquet@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "47672302-6C17-1A58-628A-2792DFA2DB79",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-03-10 14:42:07",
		"Сost": "47 082",
		"ProducingCountry": "Sant'Elpidio a Mare",
		"AgentEmail": "mollis.phasellus.libero@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "7824B4D5-8C3B-1A55-446E-C1CEC0966372",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-11-09 04:20:12",
		"Сost": "6 963",
		"ProducingCountry": "Seogwipo",
		"AgentEmail": "mauris.eu.elit@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "2F773FAE-2643-B13D-C8F7-CFFE93DAA40F",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-01-13 05:22:12",
		"Сost": "54 266",
		"ProducingCountry": "Oldenburg",
		"AgentEmail": "class.aptent@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "14209397-5363-3FEC-2175-3219669DEF83",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-04-26 06:36:11",
		"Сost": "94 381",
		"ProducingCountry": "Linköping",
		"AgentEmail": "enim.etiam@google.com",
		"Comments": ""
	},
	{
		"Guid": "F6C78DCA-5AC6-DA51-D384-7494BB641290",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-04-12 19:07:17",
		"Сost": "51 045",
		"ProducingCountry": "Sakhalin",
		"AgentEmail": "fermentum.arcu@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "59D99D37-61FA-ABDE-989E-2D9A821BA4C5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-09-19 05:36:13",
		"Сost": "33 932",
		"ProducingCountry": "Aurora",
		"AgentEmail": "orci@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "1A8E1035-B2D4-E87D-B2E3-49CEBB785E3B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-06-07 18:00:37",
		"Сost": "73 496",
		"ProducingCountry": "Voronezh",
		"AgentEmail": "dolor.donec@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "A6EC2044-4D95-26C4-B1AA-A8ABDCF921E4",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-02-17 14:36:43",
		"Сost": "56 664",
		"ProducingCountry": "Dillenburg",
		"AgentEmail": "conubia.nostra.per@google.org",
		"Comments": ""
	},
	{
		"Guid": "FD4769AE-A2DE-AA1A-7E89-1FA5B8B63F9B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-09-14 10:14:19",
		"Сost": "47 439",
		"ProducingCountry": "Hofors",
		"AgentEmail": "varius.ultrices.mauris@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "4042F52D-2AFC-8C0F-B828-DA09D61078A3",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-07-25 02:37:34",
		"Сost": "99 690",
		"ProducingCountry": "Ebenthal in Kärnten",
		"AgentEmail": "interdum.enim@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "5499ADCE-5C2B-3648-6186-C29A941EF608",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-12-21 07:58:54",
		"Сost": "6 070",
		"ProducingCountry": "Mjölby",
		"AgentEmail": "nulla.integer@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "9BC1CE47-8B3E-C8AA-03BE-93CA2B104495",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-08-26 14:11:10",
		"Сost": "30 475",
		"ProducingCountry": "Sevastopol",
		"AgentEmail": "parturient@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "2C9EE398-8276-A5AA-9EF5-8DC3E4D7E5E2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2025-03-26 07:15:20",
		"Сost": "2 703",
		"ProducingCountry": "Yeongju",
		"AgentEmail": "phasellus@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "177EA10C-DAEB-CE75-77AC-7E1D3058118E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2025-04-25 22:28:18",
		"Сost": "58 230",
		"ProducingCountry": "Hillsboro",
		"AgentEmail": "non@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "9B80E0DC-ED6A-C3D6-C1F5-ADF5B62F07D9",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-01-31 18:57:57",
		"Сost": 751,
		"ProducingCountry": "Klagenfurt",
		"AgentEmail": "ut.odio@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "DC734107-DDEB-8C1B-378E-ED914656DA35",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2023-11-27 09:39:46",
		"Сost": "61 936",
		"ProducingCountry": "Lingen",
		"AgentEmail": "cum.sociis@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "C875CA9B-6491-642E-1A1F-9DF2D1018E65",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-08-19 13:12:46",
		"Сost": "4 427",
		"ProducingCountry": "Bremerhaven",
		"AgentEmail": "quam.dignissim.pharetra@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "4D476345-670D-7401-CC4C-A3B63B9165B5",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2025-02-12 20:32:40",
		"Сost": "90 450",
		"ProducingCountry": "Limoges",
		"AgentEmail": "ipsum.dolor.sit@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "4451E1F3-BD65-658E-E029-B76466A42C31",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-04-05 08:25:23",
		"Сost": "5 320",
		"ProducingCountry": "Ockelbo",
		"AgentEmail": "rhoncus@yahoo.com",
		"Comments": ""
	},
	{
		"Guid": "DD7FFFCA-3775-697A-8866-3EADD7CE6353",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-11-26 15:18:59",
		"Сost": "22 723",
		"ProducingCountry": "Schwedt",
		"AgentEmail": "nunc.risus@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "E3145927-370D-0688-5BBC-0C58145D7279",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-04-15 08:48:55",
		"Сost": "46 405",
		"ProducingCountry": "Murmansk",
		"AgentEmail": "non.hendrerit@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "8810BF15-B672-B16E-DDB1-D77954C2D6D9",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-08-15 16:38:33",
		"Сost": "19 997",
		"ProducingCountry": "Altach",
		"AgentEmail": "id@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "B099C4B1-5451-80C5-EB96-D187D2D10572",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-09-27 01:53:09",
		"Сost": "22 287",
		"ProducingCountry": "Palma de Mallorca",
		"AgentEmail": "magna@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "3CC645C7-A94E-D7A4-1E72-36B0A460B26B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2025-04-28 17:35:22",
		"Сost": "52 106",
		"ProducingCountry": "Wattrelos",
		"AgentEmail": "nunc.ac@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "ED83B3D2-AF94-5063-C2D5-7787582CD75E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-09-19 23:43:00",
		"Сost": "8 826",
		"ProducingCountry": "Borås",
		"AgentEmail": "nisl.sem@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "11B1EB46-A683-01C3-DD3A-6060DDCFCA57",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-01-13 16:28:54",
		"Сost": "88 011",
		"ProducingCountry": "Istres",
		"AgentEmail": "dui.fusce@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "B83802BD-59AB-E1F1-3393-E2EB7BD788B3",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-09-09 18:58:35",
		"Сost": "20 320",
		"ProducingCountry": "Omaha",
		"AgentEmail": "fringilla.porttitor@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "68BB3598-8657-617A-1C6C-BAEB48AA92D1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-09-27 07:38:34",
		"Сost": "74 971",
		"ProducingCountry": "Schwedt",
		"AgentEmail": "praesent@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "A9CA1843-C7AA-07CB-8057-D48684435CF5",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-06-12 01:59:55",
		"Сost": "20 596",
		"ProducingCountry": "Staßfurt",
		"AgentEmail": "tellus@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "807EC359-E0CC-3159-338A-2DCFEF988D56",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-12-20 17:50:28",
		"Сost": "16 725",
		"ProducingCountry": "Smetlede",
		"AgentEmail": "donec.sollicitudin.adipiscing@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "9E4BCA5B-DBD0-B131-BEEE-54A3F873CCBD",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-07-01 01:31:36",
		"Сost": "40 277",
		"ProducingCountry": "Norfolk",
		"AgentEmail": "arcu.morbi@aol.org",
		"Comments": ""
	},
	{
		"Guid": "A2D18E39-5269-C9E0-E82A-AE996A939C45",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-12-06 17:08:20",
		"Сost": "69 416",
		"ProducingCountry": "Schweinfurt",
		"AgentEmail": "ornare.sagittis@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "6EA368BC-DB58-A4DA-6579-CB0B23154DB6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2025-03-19 04:56:21",
		"Сost": "28 140",
		"ProducingCountry": "Vallentuna",
		"AgentEmail": "placerat.orci.lacus@google.org",
		"Comments": ""
	},
	{
		"Guid": "DDD7ECC7-1CB6-1521-0E46-ACE36D585EAA",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-10-13 20:54:11",
		"Сost": "27 726",
		"ProducingCountry": "Marchtrenk",
		"AgentEmail": "dictum.eu.placerat@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "84785F48-4836-3875-3693-047FC5D921B3",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-12-12 23:29:13",
		"Сost": "43 568",
		"ProducingCountry": "Jefferson City",
		"AgentEmail": "erat.vivamus.nisi@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "C85AA01B-18C8-43A1-3877-1BC68B871A2E",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-03-29 01:54:41",
		"Сost": "22 127",
		"ProducingCountry": "Chesapeake",
		"AgentEmail": "amet.orci@aol.org",
		"Comments": ""
	},
	{
		"Guid": "DDED4387-12B7-018C-558D-A2A7278224EA",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-12-19 12:47:47",
		"Сost": "97 143",
		"ProducingCountry": "Bad Neuenahr-Ahrweiler",
		"AgentEmail": "aliquet@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "3A10514A-A2A0-C71D-1BAE-4E0A275EB194",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-08-31 22:38:00",
		"Сost": "33 281",
		"ProducingCountry": "Saarlouis",
		"AgentEmail": "orci.adipiscing@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "5C95E828-881B-393F-383E-7E1116F3243C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2023-07-07 09:26:43",
		"Сost": "86 122",
		"ProducingCountry": "Aalen",
		"AgentEmail": "ultrices.posuere@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "2ABBFAE9-95D1-8815-3179-BB66A6174040",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2025-05-07 03:39:51",
		"Сost": "97 196",
		"ProducingCountry": "Orlando",
		"AgentEmail": "ultrices.duis@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "B3C5A339-4716-ACC2-8E45-6D9FD9E33AE9",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-07-28 05:09:11",
		"Сost": "38 645",
		"ProducingCountry": "Jecheon",
		"AgentEmail": "dolor.sit@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "26D383C7-15FB-C1C3-55F4-2824C74B3CDC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-12-23 13:18:17",
		"Сost": "52 891",
		"ProducingCountry": "Ostrowiec Świętokrzyski",
		"AgentEmail": "lacus.aliquam@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "5D69C759-0709-112B-BE49-B0336A7DE337",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-07-05 21:17:53",
		"Сost": "44 713",
		"ProducingCountry": "Tambov",
		"AgentEmail": "mi@aol.org",
		"Comments": ""
	},
	{
		"Guid": "BC62B4E7-D97E-030B-701A-E9CA28E79BB4",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-09-07 20:08:30",
		"Сost": "89 492",
		"ProducingCountry": "Sioux City",
		"AgentEmail": "imperdiet.ullamcorper.duis@icloud.couk",
		"Comments": ""
	},
	{
		"Guid": "090D731C-AF68-87E1-0969-A8755B9CD160",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-06-13 05:48:11",
		"Сost": "9 975",
		"ProducingCountry": "Mataró",
		"AgentEmail": "nulla.dignissim@protonmail.net",
		"Comments": ""
	},
	{
		"Guid": "E533C2D4-74F9-B50F-6B75-C0E6CE1AA14D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-10-05 23:37:31",
		"Сost": "76 069",
		"ProducingCountry": "Lunel",
		"AgentEmail": "auctor.odio@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "826D8116-4C3D-31A3-5981-EBCBEB9B4444",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2023-11-15 03:22:17",
		"Сost": "33 756",
		"ProducingCountry": "Avesta",
		"AgentEmail": "vestibulum.neque.sed@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "A7567F4A-EF78-9838-9C7A-92F1E2EE577B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2023-08-10 21:43:34",
		"Сost": "88 469",
		"ProducingCountry": "Lauco",
		"AgentEmail": "enim@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "78F2DACB-2FCE-AE6B-E062-147693230C4C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-03-23 06:51:06",
		"Сost": "59 020",
		"ProducingCountry": "Yeongju",
		"AgentEmail": "dolor.nulla@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "93710CB8-5889-A0D2-C1B1-0F264EC98EC4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-10-21 23:57:19",
		"Сost": "77 546",
		"ProducingCountry": "Telfs",
		"AgentEmail": "integer.vulputate.risus@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "D2F919C9-6DF7-7092-3C5B-8D462963511E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-05-31 23:34:55",
		"Сost": "7 161",
		"ProducingCountry": "Ciudad Real",
		"AgentEmail": "cras.sed@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "1952BB93-88A7-915E-C099-DE4888EA2319",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2025-01-05 10:44:18",
		"Сost": "26 958",
		"ProducingCountry": "Couillet",
		"AgentEmail": "dolor.sit@google.com",
		"Comments": ""
	},
	{
		"Guid": "1BF92628-8EDC-4948-6AF3-8A525DB8B01B",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-03-30 17:54:20",
		"Сost": "51 842",
		"ProducingCountry": "Berlin",
		"AgentEmail": "aliquet.proin.velit@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "F03D1FC2-B1D3-93E4-9AFB-2535F317460A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-10-26 09:42:26",
		"Сost": "40 492",
		"ProducingCountry": "Rostov",
		"AgentEmail": "integer@protonmail.ca",
		"Comments": ""
	},
	{
		"Guid": "FD6D3AC8-DEF2-7183-624F-31AC2278826E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2025-01-18 22:54:06",
		"Сost": 651,
		"ProducingCountry": "Fort Worth",
		"AgentEmail": "nisl.maecenas@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "511E75A9-203C-764D-B66E-B76B5D1EE713",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-07-03 21:49:17",
		"Сost": "16 683",
		"ProducingCountry": "Cherain",
		"AgentEmail": "nullam@google.edu",
		"Comments": ""
	},
	{
		"Guid": "38C21097-62C1-15B4-398C-4343D5BB5969",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-06-08 21:51:56",
		"Сost": "31 766",
		"ProducingCountry": "Cherbourg-Octeville",
		"AgentEmail": "nibh.quisque.nonummy@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "2E04FD77-3849-DDA1-92B3-4915C7B39506",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-05-19 08:38:57",
		"Сost": "88 329",
		"ProducingCountry": "Nizhny",
		"AgentEmail": "non.enim@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "5DA1B866-9E34-1B9E-4EC4-09D48341AAE7",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-08-23 10:35:27",
		"Сost": "51 369",
		"ProducingCountry": "Lustenau",
		"AgentEmail": "curabitur.dictum@google.com",
		"Comments": ""
	},
	{
		"Guid": "99A1EDAB-7E44-1B54-0168-20A15ABB1C99",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-10-19 16:39:30",
		"Сost": "15 958",
		"ProducingCountry": "Szczecin",
		"AgentEmail": "enim@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "34EB4A46-2A66-49EE-4A55-2D981CC68883",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-09-08 20:52:14",
		"Сost": "56 729",
		"ProducingCountry": "Götzis",
		"AgentEmail": "nisl.quisque@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "5E40D352-BDF1-233D-A5AD-5AD23EBE3E51",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2024-02-22 19:15:14",
		"Сost": 637,
		"ProducingCountry": "Mazenzele",
		"AgentEmail": "lorem@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "B27C4E97-DE92-D36C-8D32-493D623A66EE",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-09-07 16:19:05",
		"Сost": "53 246",
		"ProducingCountry": "Orp-Jauche",
		"AgentEmail": "eget.varius@google.edu",
		"Comments": ""
	},
	{
		"Guid": "CA8D79D0-5F34-C25C-0D81-B96B2EBBC5D6",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-12-25 03:41:00",
		"Сost": "57 504",
		"ProducingCountry": "León",
		"AgentEmail": "placerat.velit.quisque@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "235B59C8-763D-24AA-2187-46C62596747F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-12-02 16:29:20",
		"Сost": "33 800",
		"ProducingCountry": "Joliet",
		"AgentEmail": "cras@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "0F94A1CD-8186-BE13-3E5A-8DC2BED8D381",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-11-17 14:27:21",
		"Сost": "4 611",
		"ProducingCountry": "Louisville",
		"AgentEmail": "sed@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "2EE3CD53-AC4E-E53F-7168-EA6D3B7ED947",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2023-10-31 02:29:55",
		"Сost": "51 113",
		"ProducingCountry": "Limoges",
		"AgentEmail": "massa.rutrum@aol.org",
		"Comments": ""
	},
	{
		"Guid": "8678B0C7-CBAE-0422-4590-BE362807E174",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-10-07 14:15:37",
		"Сost": "46 797",
		"ProducingCountry": "Tongyeong",
		"AgentEmail": "quisque@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "49647211-CBDD-C452-AAD8-17C721AD8A3E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2023-08-25 15:41:17",
		"Сost": "67 645",
		"ProducingCountry": "Kaneohe",
		"AgentEmail": "dui@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "1263E0BB-C3CB-43F3-8479-C9E99411EB24",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-07-21 04:00:06",
		"Сost": "89 551",
		"ProducingCountry": "Gdynia",
		"AgentEmail": "ipsum.suspendisse@aol.couk",
		"Comments": ""
	},
	{
		"Guid": "9BF892B3-89B5-1593-B71D-273B704EB78A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-09-07 05:48:57",
		"Сost": "16 722",
		"ProducingCountry": "Pinneberg",
		"AgentEmail": "blandit@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "D9BD648C-B764-7ABD-31B1-60C1A2D7A98A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-08-02 08:47:08",
		"Сost": "69 911",
		"ProducingCountry": "Fratta Todina",
		"AgentEmail": "fusce.feugiat@google.couk",
		"Comments": ""
	},
	{
		"Guid": "082B5A24-30A3-AF76-8982-DD66E4B33AD8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-12-13 04:59:48",
		"Сost": "66 535",
		"ProducingCountry": "Butzbach",
		"AgentEmail": "fringilla.cursus.purus@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "EA9AE114-D07A-BE1A-F24C-C3343221D9A2",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2025-03-02 10:53:24",
		"Сost": "51 775",
		"ProducingCountry": "Ragnies",
		"AgentEmail": "tellus.faucibus@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "11D12A34-E898-EB24-AA41-56495AD571ED",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2025-02-20 03:26:16",
		"Сost": "27 638",
		"ProducingCountry": "Ludvika",
		"AgentEmail": "aliquam.auctor@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "12553717-1622-A432-7CA7-DE59CED14D0D",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2025-04-30 02:32:04",
		"Сost": "5 890",
		"ProducingCountry": "Lipetsk",
		"AgentEmail": "libero@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "3D53D768-D1AB-665F-7BBB-CB8C6E449917",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2025-04-24 03:30:11",
		"Сost": "41 056",
		"ProducingCountry": "Palma de Mallorca",
		"AgentEmail": "a.sollicitudin@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "7D7D147C-2351-CBED-8BE7-039F13FC29E7",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-12-29 19:58:45",
		"Сost": "44 915",
		"ProducingCountry": "Koblenz",
		"AgentEmail": "at.nisi.cum@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "213E999B-CC00-6A18-3B2A-99057F8E65E8",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2025-03-25 07:27:06",
		"Сost": "6 164",
		"ProducingCountry": "Lerum",
		"AgentEmail": "vivamus.nibh@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "6157794A-B611-2772-65AC-B63C8D1B8A1C",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-01-24 19:48:57",
		"Сost": "69 737",
		"ProducingCountry": "Zignago",
		"AgentEmail": "ut.pharetra@google.com",
		"Comments": ""
	},
	{
		"Guid": "E0F27A19-EE82-23E5-5D91-B783EADB794A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-11-23 11:37:59",
		"Сost": "96 631",
		"ProducingCountry": "Brunn am Gebirge",
		"AgentEmail": "aenean@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "7A14C233-9C67-56E0-915C-7E13B9D2FA65",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-03-27 00:16:44",
		"Сost": "88 691",
		"ProducingCountry": "Wilmington",
		"AgentEmail": "magna.praesent@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "9863E2AB-EE1E-77D6-9B58-A40C69DEBDD6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2024-10-12 20:58:00",
		"Сost": "69 334",
		"ProducingCountry": "Kortrijk",
		"AgentEmail": "a.mi.fringilla@aol.org",
		"Comments": ""
	},
	{
		"Guid": "E4CEDAA9-7860-6CB1-5ADB-4FBA4A6EF86D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-10-23 14:35:11",
		"Сost": "39 692",
		"ProducingCountry": "Mâcon",
		"AgentEmail": "eu.neque@aol.net",
		"Comments": ""
	},
	{
		"Guid": "89116262-E22F-A5DA-1CF8-2A19EE3439E8",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-01-07 13:10:57",
		"Сost": "58 935",
		"ProducingCountry": "Lowell",
		"AgentEmail": "mus@google.ca",
		"Comments": ""
	},
	{
		"Guid": "94AA16AC-26AD-422D-96CA-28D7AC722888",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-08-15 10:29:53",
		"Сost": "32 886",
		"ProducingCountry": "Bangor",
		"AgentEmail": "nullam@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "CBB6D1DA-B890-66C6-03A9-C4160C3E211D",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-08-06 01:53:03",
		"Сost": "83 387",
		"ProducingCountry": "Salamanca",
		"AgentEmail": "nulla.at@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "955CAB49-53D0-E364-19B9-314DDDACC3CC",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2023-06-15 12:32:17",
		"Сost": "84 343",
		"ProducingCountry": "Nonsan",
		"AgentEmail": "consectetuer@outlook.ca",
		"Comments": ""
	},
	{
		"Guid": "4156C32D-3E39-2F84-7638-68A9A825843E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-11-01 19:58:59",
		"Сost": "99 231",
		"ProducingCountry": "Algeciras",
		"AgentEmail": "erat.semper@aol.net",
		"Comments": ""
	},
	{
		"Guid": "8242418D-9133-1A6F-ECB7-6D4F3A87E59A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-10-18 10:36:26",
		"Сost": "5 830",
		"ProducingCountry": "Loppem",
		"AgentEmail": "quam.quis.diam@yahoo.edu",
		"Comments": ""
	},
	{
		"Guid": "4226689B-18CE-6ECF-AA5A-97DDF8A59656",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-01-11 05:57:19",
		"Сost": "17 554",
		"ProducingCountry": "Arquata del Tronto",
		"AgentEmail": "vel@google.com",
		"Comments": ""
	},
	{
		"Guid": "1AD77855-769F-F032-B534-40A5C50ABD39",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-12-08 15:09:42",
		"Сost": 664,
		"ProducingCountry": "Bollnäs",
		"AgentEmail": "mus.aenean.eget@google.com",
		"Comments": ""
	},
	{
		"Guid": "D87A9725-3F77-85F4-BD79-51A21EEC8612",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-02-22 08:33:34",
		"Сost": "21 645",
		"ProducingCountry": "Jecheon",
		"AgentEmail": "eu.eleifend@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "4CB19D14-423B-1718-E1FC-274BBA649F16",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2024-12-07 21:42:15",
		"Сost": "66 838",
		"ProducingCountry": "Badalona",
		"AgentEmail": "sem.ut@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "F5933CF1-7193-1C8A-DA85-4A3CEFE73B25",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2025-01-17 03:49:48",
		"Сost": "15 727",
		"ProducingCountry": "Tomsk",
		"AgentEmail": "odio.vel.est@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "219A1D57-1C11-E2B1-A45C-712939785BA8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-09-29 11:21:41",
		"Сost": "27 819",
		"ProducingCountry": "Berlin",
		"AgentEmail": "neque.vitae@google.net",
		"Comments": ""
	},
	{
		"Guid": "E17472B8-B9E9-6D1D-5AFA-6D4DA7B02C56",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-01-07 22:17:51",
		"Сost": "26 035",
		"ProducingCountry": "Nässjö",
		"AgentEmail": "consectetuer@aol.org",
		"Comments": ""
	},
	{
		"Guid": "03BE48D7-61E8-DDDC-3234-72B7AA864ED2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2023-09-12 13:11:14",
		"Сost": "32 062",
		"ProducingCountry": "Gorzów Wielkopolski",
		"AgentEmail": "quam@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "7DC2CA3F-040B-0645-54F2-D1AF59589C08",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-07-11 19:55:02",
		"Сost": "97 101",
		"ProducingCountry": "Piła",
		"AgentEmail": "magnis.dis.parturient@google.couk",
		"Comments": ""
	},
	{
		"Guid": "2AD8DE7D-618A-186B-B4E3-815ACAADDCB3",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-04-09 14:21:41",
		"Сost": "57 225",
		"ProducingCountry": "Tumba",
		"AgentEmail": "arcu@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "6C54C2CB-12B7-3C4A-1260-EEEC8B8A7E01",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2025-03-17 12:26:23",
		"Сost": "88 427",
		"ProducingCountry": "Meerdonk",
		"AgentEmail": "ad.litora.torquent@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "7CE6170F-2BA1-1A30-3757-CEC4B899285D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-08-06 00:43:56",
		"Сost": "89 383",
		"ProducingCountry": "Ludvika",
		"AgentEmail": "fermentum@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "5A3A82E5-1184-1AF4-8A2A-FDA0064A394A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2025-04-03 15:39:00",
		"Сost": "48 730",
		"ProducingCountry": "Ludvika",
		"AgentEmail": "enim.commodo.hendrerit@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "B5218CE4-C0F4-9191-E5F2-D4A9D349F36E",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-05-20 01:29:29",
		"Сost": "29 632",
		"ProducingCountry": "Prenzlau",
		"AgentEmail": "a@google.edu",
		"Comments": ""
	},
	{
		"Guid": "E75DF0A8-431B-6D25-567B-647C870E3D81",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-11-13 16:42:36",
		"Сost": "49 209",
		"ProducingCountry": "Gresham",
		"AgentEmail": "feugiat@google.ca",
		"Comments": ""
	},
	{
		"Guid": "1A3E9B26-4E81-A0B4-3153-D7AAB5B6D49E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-05-02 23:53:31",
		"Сost": "46 050",
		"ProducingCountry": "Motala",
		"AgentEmail": "tortor@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "24911874-EA02-ABEC-BC1D-18E528725A8F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-08-02 02:17:13",
		"Сost": "5 809",
		"ProducingCountry": "Shenkursk",
		"AgentEmail": "morbi.non.sapien@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "EDB8E3CF-8434-CD06-BE4B-25DA4534811D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-09-13 14:17:44",
		"Сost": "80 269",
		"ProducingCountry": "Starachowice",
		"AgentEmail": "in.consectetuer@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "55AC12D3-7919-0F4A-AEA7-4A3EE402EC7D",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-04-09 14:12:47",
		"Сost": "31 893",
		"ProducingCountry": "Brive-la-Gaillarde",
		"AgentEmail": "tortor.nunc.commodo@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "73838CCE-BA32-216F-5D19-0BE7F5889B84",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-06-29 03:15:21",
		"Сost": "71 411",
		"ProducingCountry": "Montelupo Fiorentino",
		"AgentEmail": "non.enim@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "935358FF-65AF-E0B8-4996-46006C3EA29A",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-09-23 06:41:08",
		"Сost": "8 267",
		"ProducingCountry": "Parchim	City",
		"AgentEmail": "tortor@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "2F3A94D4-132A-3565-615A-883425D760C4",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-07-04 13:08:53",
		"Сost": "32 688",
		"ProducingCountry": "Corbais",
		"AgentEmail": "ut.mi.duis@aol.com",
		"Comments": ""
	},
	{
		"Guid": "46A6B1ED-250D-1565-CCB4-D477B9A8CE69",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2025-01-22 20:27:34",
		"Сost": "89 176",
		"ProducingCountry": "Borås",
		"AgentEmail": "tristique.aliquet@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "1B838E58-9417-7722-DB91-ABE52F74B958",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-07-28 22:54:38",
		"Сost": "81 734",
		"ProducingCountry": "Olsztyn",
		"AgentEmail": "adipiscing@yahoo.com",
		"Comments": ""
	},
	{
		"Guid": "256B844D-521A-A998-0E95-382DB0D43BA6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-10-06 05:17:47",
		"Сost": "8 867",
		"ProducingCountry": "Sankt Ingbert",
		"AgentEmail": "vivamus.non@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "D38C6EEA-E8D6-3BC2-2F97-256493927DFD",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-12-17 15:15:02",
		"Сost": "45 095",
		"ProducingCountry": "Loppem",
		"AgentEmail": "ligula.nullam@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "8FEB3829-4D9E-034B-FEBE-3B85B54CD78C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mazda",
		"Title": "",
		"ProductionDate": "2023-07-16 21:24:53",
		"Сost": "5 226",
		"ProducingCountry": "Sangju",
		"AgentEmail": "velit.quisque@google.com",
		"Comments": ""
	},
	{
		"Guid": "494C1B08-C6D8-B7B1-B74D-ECA17514757C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2025-05-05 03:43:02",
		"Сost": "41 228",
		"ProducingCountry": "Wondelgem",
		"AgentEmail": "faucibus.id@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "D5667D58-CB21-A935-BAB4-B9693BA262CD",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-06-11 02:26:09",
		"Сost": "59 480",
		"ProducingCountry": "Novosibirsk",
		"AgentEmail": "duis@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "B233D703-6735-8FB6-774A-70B5BC8618EC",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2023-12-06 19:07:06",
		"Сost": "76 647",
		"ProducingCountry": "Hollange",
		"AgentEmail": "aliquet.metus.urna@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "420CE496-8413-7312-120D-768F39D2714C",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-04-21 03:01:42",
		"Сost": "21 318",
		"ProducingCountry": "Monticelli d'Ongina",
		"AgentEmail": "odio.a@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "5AE634AF-A89C-1463-C744-D2EC8B343F13",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-09-01 04:23:16",
		"Сost": "46 893",
		"ProducingCountry": "Hofors",
		"AgentEmail": "ipsum.leo.elementum@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "C8C7B976-15E5-6C3E-48B8-BCCE2D6A370D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-05-01 19:57:05",
		"Сost": "74 081",
		"ProducingCountry": "Irkutsk",
		"AgentEmail": "molestie.sed@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "B05EF3E7-A1B9-63AB-59EB-9580AC3C1B3C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2024-07-06 01:21:17",
		"Сost": "5 157",
		"ProducingCountry": "Broken Arrow",
		"AgentEmail": "posuere@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "E89072D4-DC2A-2E20-3BD5-A4F2ECDEE187",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-10-08 09:18:20",
		"Сost": "29 081",
		"ProducingCountry": "Melilla",
		"AgentEmail": "lectus.pede@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "39112974-5C0D-6321-795D-DA62A67BCBBA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2023-11-04 10:52:54",
		"Сost": "36 259",
		"ProducingCountry": "Jecheon",
		"AgentEmail": "nunc@outlook.edu",
		"Comments": ""
	},
	{
		"Guid": "D7258C47-DB50-B688-1781-39D8E6BF4E98",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2025-03-03 13:19:52",
		"Сost": "64 012",
		"ProducingCountry": "Mjölby",
		"AgentEmail": "gravida.praesent@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "3640CBB8-9815-04C7-7AAA-0D8845E66151",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2023-08-31 02:26:45",
		"Сost": "97 485",
		"ProducingCountry": "La Thuile",
		"AgentEmail": "dui.quis@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "A03527B9-2659-D3A2-DB48-52802723887C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-11-16 15:11:58",
		"Сost": "67 529",
		"ProducingCountry": "Sankt Johann im Pongau",
		"AgentEmail": "dolor@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "02F4DEC4-6879-4CC5-A4F1-D411727E45EA",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-12-18 16:58:37",
		"Сost": "4 825",
		"ProducingCountry": "Suwałki",
		"AgentEmail": "nisi.a@hotmail.com",
		"Comments": ""
	},
	{
		"Guid": "AE8D824A-AB3A-D33D-ECC0-A9D4B664D6D3",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-12-28 14:17:35",
		"Сost": "88 831",
		"ProducingCountry": "Gijón",
		"AgentEmail": "neque.pellentesque.massa@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "3BC2E5CD-2184-27A6-9DBF-3AE241BE33FE",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-09-24 10:37:09",
		"Сost": "26 506",
		"ProducingCountry": "Busan",
		"AgentEmail": "scelerisque.dui@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "9E5ABC6B-B959-D5FA-0D11-AF546245D11A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-01-16 02:48:22",
		"Сost": "96 940",
		"ProducingCountry": "Braunau am Inn",
		"AgentEmail": "nisi.sem.semper@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "24695565-0A35-C3CE-B9C8-1ECAD21B692E",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-09-19 08:54:53",
		"Сost": "67 423",
		"ProducingCountry": "Roccalumera",
		"AgentEmail": "consequat.nec@icloud.net",
		"Comments": ""
	},
	{
		"Guid": "5D458A26-F142-E74D-B17E-04273F8EFE34",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-12-06 13:00:08",
		"Сost": "80 674",
		"ProducingCountry": "Tucson",
		"AgentEmail": "eu@hotmail.edu",
		"Comments": ""
	},
	{
		"Guid": "17E4742B-04D9-C696-5EFD-8D6F553F0189",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-10-12 07:25:56",
		"Сost": "72 560",
		"ProducingCountry": "Bellevue",
		"AgentEmail": "nisi.magna.sed@aol.org",
		"Comments": ""
	},
	{
		"Guid": "E8D3E166-15FE-B9D3-8535-5B1D38DDD9E8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2023-07-12 21:00:18",
		"Сost": "74 005",
		"ProducingCountry": "Newark",
		"AgentEmail": "et@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "7873818B-C69D-AC69-4392-92E9E7A8ADCA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-06-29 11:31:45",
		"Сost": "45 463",
		"ProducingCountry": "Boston",
		"AgentEmail": "egestas.hendrerit.neque@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "5E682B59-CA83-9953-5C75-316C1B9257EA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2025-02-17 14:00:26",
		"Сost": "92 748",
		"ProducingCountry": "Ełk",
		"AgentEmail": "adipiscing.elit.aliquam@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "D81E2627-1D3B-78D1-68A2-A496318709CF",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2023-10-01 09:21:17",
		"Сost": "62 611",
		"ProducingCountry": "Bouwel",
		"AgentEmail": "sem.pellentesque@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "0C8D4212-858A-5253-D376-A812CE917ABA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-05-31 08:25:51",
		"Сost": "88 414",
		"ProducingCountry": "Gaithersburg",
		"AgentEmail": "lacus.mauris@protonmail.ca",
		"Comments": ""
	},
	{
		"Guid": "99502746-7E63-484D-A687-464B87C45DCA",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-10-30 21:15:39",
		"Сost": "22 144",
		"ProducingCountry": "Gunsan",
		"AgentEmail": "ut.nec@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "C4F4AD78-E420-8B57-E7C9-25C19B947D41",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2024-09-06 05:18:29",
		"Сost": "9 085",
		"ProducingCountry": "Finspång",
		"AgentEmail": "neque.vitae@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "19C56FDC-7A17-128D-E28B-56DA87611A2F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-01-13 01:41:27",
		"Сost": "31 797",
		"ProducingCountry": "Seogwipo",
		"AgentEmail": "lacus.quisque@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "BD28BCB9-11E7-DDD8-7029-8544A8BC926D",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-05-30 09:58:48",
		"Сost": "43 220",
		"ProducingCountry": "Gangneung",
		"AgentEmail": "nulla.magna@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "EB9B0365-5C51-C43B-C454-891BC81284C2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2024-12-31 07:26:19",
		"Сost": "7 487",
		"ProducingCountry": "Sigillo",
		"AgentEmail": "vitae@yahoo.ca",
		"Comments": ""
	},
	{
		"Guid": "21F7147E-5B8C-68E4-E814-CF11E47C7D6D",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-09-28 06:09:40",
		"Сost": "57 326",
		"ProducingCountry": "Vienna",
		"AgentEmail": "a.feugiat.tellus@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "ECB987D6-D853-2D81-C1B2-893A3463EF1F",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-09-06 03:16:42",
		"Сost": "75 629",
		"ProducingCountry": "San Cesario di Lecce",
		"AgentEmail": "odio@aol.com",
		"Comments": ""
	},
	{
		"Guid": "F24CF8AC-1E3D-3FD2-E0DC-E70EBB8707B0",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-03-08 12:26:59",
		"Сost": "45 007",
		"ProducingCountry": "Obertshausen",
		"AgentEmail": "interdum.nunc@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "3BB8E2C4-B641-F874-86B2-83418BB2D9E2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2024-02-18 01:27:58",
		"Сost": "65 930",
		"ProducingCountry": "Neufeld an der Leitha",
		"AgentEmail": "sagittis@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "26469DE6-68DC-56DE-F317-68779D654FB9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-11-15 11:37:48",
		"Сost": "92 416",
		"ProducingCountry": "Gunsan",
		"AgentEmail": "mi@aol.net",
		"Comments": ""
	},
	{
		"Guid": "137DBE61-32A9-896D-54C7-8842A168968B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2025-01-09 22:43:31",
		"Сost": "95 555",
		"ProducingCountry": "A Coruña",
		"AgentEmail": "cursus.et.eros@yahoo.com",
		"Comments": ""
	},
	{
		"Guid": "411E773A-7698-DF6A-8937-A4C17B2F37B2",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-05-08 09:25:40",
		"Сost": "19 142",
		"ProducingCountry": "Hofors",
		"AgentEmail": "metus.vivamus@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "F987C183-2ECB-B457-6153-BBF48160FA3C",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2023-12-16 12:51:53",
		"Сost": "85 339",
		"ProducingCountry": "Ceuta",
		"AgentEmail": "vestibulum.accumsan.neque@yahoo.org",
		"Comments": ""
	},
	{
		"Guid": "6F6CA99E-8C96-B51D-DE6B-4FD84B88FE74",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2024-08-23 03:44:03",
		"Сost": "20 420",
		"ProducingCountry": "Dreux",
		"AgentEmail": "ornare.in.faucibus@protonmail.edu",
		"Comments": ""
	},
	{
		"Guid": "626243FC-769F-F5DD-4145-77ABB4AF1DD8",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2023-09-27 01:24:13",
		"Сost": "73 229",
		"ProducingCountry": "Laon",
		"AgentEmail": "mauris.quis@aol.net",
		"Comments": ""
	},
	{
		"Guid": "51DEE9A0-E555-9D8A-A1C6-C5602B325EE6",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-10-04 17:21:16",
		"Сost": "55 711",
		"ProducingCountry": "Iksan",
		"AgentEmail": "nisi@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "A45B13A7-421D-0BF1-4F8D-CE71BA6D7ED0",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-08-24 20:55:39",
		"Сost": "84 316",
		"ProducingCountry": "Yaroslavl",
		"AgentEmail": "laoreet.libero@aol.edu",
		"Comments": ""
	},
	{
		"Guid": "EF55B114-2AAC-3B81-E7A7-ACF943ABDD11",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2025-03-29 02:13:35",
		"Сost": "86 665",
		"ProducingCountry": "Illkirch-Graffenstaden",
		"AgentEmail": "libero@hotmail.org",
		"Comments": ""
	},
	{
		"Guid": "D185F9B2-EB57-1D3B-CDE6-2211355BDBC0",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2024-10-28 22:53:20",
		"Сost": "58 171",
		"ProducingCountry": "Columbia",
		"AgentEmail": "pede.suspendisse@google.com",
		"Comments": ""
	},
	{
		"Guid": "C2BAB46A-24AD-5EDD-2B94-11225EF4C082",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2023-10-17 01:06:25",
		"Сost": "40 931",
		"ProducingCountry": "Bekkerzeel",
		"AgentEmail": "erat.semper@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "8BC07B7D-B8C3-8917-836E-4644B1C7BF3B",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "General Motors",
		"Title": "",
		"ProductionDate": "2024-01-13 15:10:35",
		"Сost": "28 225",
		"ProducingCountry": "Radom",
		"AgentEmail": "metus.facilisis@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "B183A657-2E41-2CCA-A72E-8804864C6A94",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Mitsubishi Motors",
		"Title": "",
		"ProductionDate": "2024-03-18 21:16:31",
		"Сost": "76 817",
		"ProducingCountry": "Stendal",
		"AgentEmail": "justo.proin.non@aol.ca",
		"Comments": ""
	},
	{
		"Guid": "80BD257E-13C1-E6F5-6577-BB49A774AEC1",
		"TypeRow": "product",
		"Name": "",
		"Brand": "BMW",
		"Title": "",
		"ProductionDate": "2024-05-14 12:11:53",
		"Сost": "9 659",
		"ProducingCountry": "Tallahassee",
		"AgentEmail": "risus@google.edu",
		"Comments": ""
	},
	{
		"Guid": "BCB2EB21-E885-A44D-111C-8474C8D86D59",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2025-01-31 11:56:29",
		"Сost": "6 823",
		"ProducingCountry": "Châteauroux",
		"AgentEmail": "ipsum.primis@icloud.ca",
		"Comments": ""
	},
	{
		"Guid": "C3CC211E-5785-6A30-A337-CDEF98F379EB",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Infiniti",
		"Title": "",
		"ProductionDate": "2024-04-14 17:14:57",
		"Сost": "1 598",
		"ProducingCountry": "Cheyenne",
		"AgentEmail": "aenean@google.net",
		"Comments": ""
	},
	{
		"Guid": "36025D34-6B16-797F-63A7-5BD9DAC3CA04",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-12-27 20:41:07",
		"Сost": "53 686",
		"ProducingCountry": "Villenave-d'Ornon",
		"AgentEmail": "lectus.cum@hotmail.net",
		"Comments": ""
	},
	{
		"Guid": "4B702829-26DA-A578-A612-C27939331594",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Subaru",
		"Title": "",
		"ProductionDate": "2024-08-30 23:18:22",
		"Сost": "36 645",
		"ProducingCountry": "Ludvika",
		"AgentEmail": "ultrices.posuere.cubilia@aol.net",
		"Comments": ""
	},
	{
		"Guid": "084643AA-30DC-FD24-C8F1-570842184A2C",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2025-02-17 15:05:50",
		"Сost": "10 905",
		"ProducingCountry": "Graz",
		"AgentEmail": "arcu@google.com",
		"Comments": ""
	},
	{
		"Guid": "E93228A4-0D81-B1ED-48B3-7496525392FB",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2025-04-15 18:57:42",
		"Сost": "46 719",
		"ProducingCountry": "Vancouver",
		"AgentEmail": "ipsum.primis@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "4CCD9CDB-62B8-5A79-8E52-C73C454A17A7",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2025-04-22 15:19:55",
		"Сost": "76 701",
		"ProducingCountry": "Melilla",
		"AgentEmail": "felis.purus.ac@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "F294AEAC-5EDB-7F1A-7403-EFE81B32F772",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Audi",
		"Title": "",
		"ProductionDate": "2024-10-15 14:02:36",
		"Сost": "19 685",
		"ProducingCountry": "Neubrandenburg",
		"AgentEmail": "duis.sit@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "6CC1DF19-CFA5-4CB3-3375-CB3D3CCD0FD9",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2023-08-05 16:01:00",
		"Сost": "59 959",
		"ProducingCountry": "Motala",
		"AgentEmail": "facilisis@hotmail.couk",
		"Comments": ""
	},
	{
		"Guid": "DEF32F1D-0BC2-78FC-2353-4511B7B046CE",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2023-11-18 19:22:21",
		"Сost": "77 920",
		"ProducingCountry": "Jeju",
		"AgentEmail": "facilisis@protonmail.couk",
		"Comments": ""
	},
	{
		"Guid": "DCB64D35-A5F4-51F2-B2C7-D29D2B88B8ED",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-10-24 13:57:33",
		"Сost": "53 583",
		"ProducingCountry": "Sandy",
		"AgentEmail": "metus@icloud.com",
		"Comments": ""
	},
	{
		"Guid": "C4350AC9-2E7E-AD11-5E99-E621B88CE89B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ferrari",
		"Title": "",
		"ProductionDate": "2025-03-28 20:46:47",
		"Сost": "69 773",
		"ProducingCountry": "Tampa",
		"AgentEmail": "in.lorem@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "CBE1544D-E4D8-0E92-EB5D-26A9AADE45A6",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-05-16 03:51:33",
		"Сost": "63 085",
		"ProducingCountry": "Suwałki",
		"AgentEmail": "et.magnis.dis@google.net",
		"Comments": ""
	},
	{
		"Guid": "ED797CBA-C74D-E21B-CFC5-929AAE981374",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Lexus",
		"Title": "",
		"ProductionDate": "2023-08-22 05:49:43",
		"Сost": "50 743",
		"ProducingCountry": "Bremen",
		"AgentEmail": "quam.a.felis@google.org",
		"Comments": ""
	},
	{
		"Guid": "542609AD-F964-3116-5566-F741884537EA",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Toyota",
		"Title": "",
		"ProductionDate": "2024-08-21 06:26:40",
		"Сost": "95 321",
		"ProducingCountry": "Vetlanda",
		"AgentEmail": "mauris@yahoo.com",
		"Comments": ""
	},
	{
		"Guid": "3511D8C9-981D-7045-A261-880F94F463B5",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2025-01-20 14:32:57",
		"Сost": "32 543",
		"ProducingCountry": "Adrano",
		"AgentEmail": "arcu@icloud.org",
		"Comments": ""
	},
	{
		"Guid": "1C22EB2C-2FC9-4C71-5B37-963CD8F91D48",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Ford",
		"Title": "",
		"ProductionDate": "2023-10-01 10:17:19",
		"Сost": "17 721",
		"ProducingCountry": "Carcassonne",
		"AgentEmail": "libero@protonmail.com",
		"Comments": ""
	},
	{
		"Guid": "DB49245C-C405-CEEC-7EB2-ABB92D1C1EE1",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volkswagen",
		"Title": "",
		"ProductionDate": "2024-01-07 15:45:58",
		"Сost": "68 393",
		"ProducingCountry": "Kharabali",
		"AgentEmail": "vestibulum.massa@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "B7155E2D-58E7-F984-FA7B-D4A8AABAF663",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2024-06-24 11:39:59",
		"Сost": "27 904",
		"ProducingCountry": "Enns",
		"AgentEmail": "facilisis.facilisis.magna@hotmail.ca",
		"Comments": ""
	},
	{
		"Guid": "E35FB157-3192-610E-FF44-0F927F44A72A",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Hyundai Motors",
		"Title": "",
		"ProductionDate": "2024-05-16 09:53:10",
		"Сost": "25 191",
		"ProducingCountry": "Hudiksvall",
		"AgentEmail": "proin.mi.aliquam@outlook.net",
		"Comments": ""
	},
	{
		"Guid": "3A795861-ED47-2174-4375-15A042E92220",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Volvo",
		"Title": "",
		"ProductionDate": "2024-07-06 21:53:09",
		"Сost": "16 840",
		"ProducingCountry": "Le Puy-en-Velay",
		"AgentEmail": "euismod.et@icloud.edu",
		"Comments": ""
	},
	{
		"Guid": "EF1F4A4A-196C-DDF5-4148-9E979A2D2397",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2023-07-29 18:18:43",
		"Сost": "1 766",
		"ProducingCountry": "Legnica",
		"AgentEmail": "donec@yahoo.net",
		"Comments": ""
	},
	{
		"Guid": "B85F417D-D5C4-782D-8DB4-7D379053F8BB",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-08-24 06:01:43",
		"Сost": "22 722",
		"ProducingCountry": "Cinisi",
		"AgentEmail": "mi.pede.nonummy@outlook.org",
		"Comments": ""
	},
	{
		"Guid": "56A5C8B6-7CFB-19E4-152C-AE1999BC8583",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2024-09-03 15:38:24",
		"Сost": "39 156",
		"ProducingCountry": "Sint-Kruis-Winkel",
		"AgentEmail": "nisi.a@google.net",
		"Comments": ""
	},
	{
		"Guid": "2EBB3D8D-FA19-E3AB-4C2E-5C62EAC5815B",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Tata Motors",
		"Title": "",
		"ProductionDate": "2023-07-01 20:14:38",
		"Сost": "66 287",
		"ProducingCountry": "Pontevedra",
		"AgentEmail": "pellentesque.tellus.sem@protonmail.ca",
		"Comments": ""
	},
	{
		"Guid": "9D88576F-F82C-72B6-6C81-BBFC881A63CF",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Mercedes-Benz",
		"Title": "",
		"ProductionDate": "2023-06-14 10:59:10",
		"Сost": "83 932",
		"ProducingCountry": "Åkersberga",
		"AgentEmail": "ligula.consectetuer@protonmail.org",
		"Comments": ""
	},
	{
		"Guid": "3547AE61-2DCC-9EE4-C46C-27D2C8E24D57",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Nissan",
		"Title": "",
		"ProductionDate": "2024-03-23 23:24:14",
		"Сost": "33 116",
		"ProducingCountry": "Rostov",
		"AgentEmail": "ut.mi@yahoo.couk",
		"Comments": ""
	},
	{
		"Guid": "EB258E0A-255C-C4B2-CC35-6395148F1C2D",
		"TypeRow": "product",
		"Name": "",
		"Brand": "Honda",
		"Title": "",
		"ProductionDate": "2023-10-22 06:44:08",
		"Сost": "43 566",
		"ProducingCountry": "Traiskirchen",
		"AgentEmail": "sollicitudin@outlook.com",
		"Comments": ""
	},
	{
		"Guid": "6EB96E29-251F-98C7-87AE-BE14C5723C8E",
		"TypeRow": "brand",
		"Name": "",
		"Brand": "Porsche",
		"Title": "",
		"ProductionDate": "2023-12-08 09:44:43",
		"Сost": "37 740",
		"ProducingCountry": "Novgorod",
		"AgentEmail": "morbi.accumsan.laoreet@outlook.com",
		"Comments": ""
	}
    ])
    
    function changeTableSize() {
        allSize.value = !allSize.value
       
        if (allSize.value === true) {
            instance.updateSettings({ height:  window.innerHeight - 41, width:  window.innerWidth - 0 });
        } else {
            instance.updateSettings({ height:  window.innerHeight - 120, width:  window.innerWidth - 0 });
        }
        
        emit('changeTableSize', allSize.value)
    }

    onMounted(() => {
	getData()
    })

    function initCustomData() {
      dataValue.forEach((row: IModelData, index: number) => {
       
		//замена на русские типы запчасть/
		if (row.TypeRow === EnumTypeBrandRow.brand) {
			row.TypeRow = EnumTypeBrand.brand
		} else if (row.TypeRow === EnumTypeBrandRow.product) {
			row.TypeRow = EnumTypeBrand.product
		}


        if (row.Name === '' && row.TypeRow !== EnumTypeBrand.brand) {
          row.Name = namesCustomDate.value[index]
        }

        //если строка Брэнд не '' и если тип brand
        if (row.Brand !== '' && row.TypeRow !== EnumTypeBrand.brand) {
          row.Brand = ''
        }

        if (row.TypeRow === EnumTypeBrand.brand) {
          row.ProductionDate = null
          row.Сost = ''
          row.AgentEmail = ''
          row.ProducingCountry = ''
        } else {
			//console.log('dddd', toDate((String(row.ProductionDate)), "yyyy-mm-dd"))
			row.ProductionDate = String(row.ProductionDate).slice(0, 10)
			//row.ProductionDate =  new Date('2014-04-03').toDateString()
		}

        row.Сost = +(row.Сost.toString().replaceAll(' ', ''))
      });
    }
  
    async function getData() {
      
	initCustomData()
	
	await store.dispatch('initAutofilter', dataValue)
		
	const container: HTMLElement | null = document.getElementById("hs-table");
	instance = new Handsontable(container, hotSettings) as Handsontable;

	
	loadData(dataValue)
    }

    function getStory(value: string) {
      console.log('clickStory', value)
    }

	function sort(autofilterList:  Map<number | string, IAutofilter>) {
	//нужно сделать поиск 
	console.log('sort', autofilterList.get(6))
		let sort = [...dataValue]
	
		for (let elFilter of autofilterList.values() ) {
			
			if (elFilter.applied === true) {

				const rule: string = elFilter.appliedRule
				const fileldType: EnumTypeField = elFilter.fieldType
				
				sort = sort.filter((el: any) => {
					switch (fileldType) {
						case  EnumTypeField.String:
							
							//замена "Пустые строки" на ""
							{
								const inxEmptyString: number = elFilter.values.indexOf(EnumEmptyString.EmptyString)
								if (inxEmptyString !== -1) {
									elFilter.values[inxEmptyString] = EnumEmptyString.EmptyStringValue
								}

								if (elFilter.values.some((searchvalue: string) => searchvalue === el[elFilter.columnName])) {
									return el
								}
							}
							break
						case  EnumTypeField.Number:
						{
							const minValue = elFilter.values[0]
							const maxValue = elFilter.values[1]
                            
							switch (rule) {
								case  EnumRuleAutofilter.equally:
									if (Number(el[elFilter.columnName]) === Number(minValue)) {
										return el
									}
								break
								case  EnumRuleAutofilter.morethan:
									if (Number(el[elFilter.columnName]) > Number(minValue)) {
										return el
									}
								break
								case  EnumRuleAutofilter.lessthan:
									if (Number(el[elFilter.columnName]) < Number(minValue)) {
										return el
									}
								break
								case  EnumRuleAutofilter.between:
									if (Number(el[elFilter.columnName]) >= Number(minValue) && Number(el[elFilter.columnName]) <= Number(maxValue)) {
										return el
									}
								break
							}
						}
						break
						case  EnumTypeField.Date:
						//тело
						break
					}
				})
			}
		}
		
		//обновляем автофильтры и шапку и загружаем в таблицу данные
		loadData(sort)
		store.dispatch('updateAutofilter', sort)
		
		///актуализация данных (values) последнего выбранного автофильтра
		actualizationValuesAutofilterLocal()
		
		updateHeaderSettingsWithoutChange()
    }
	function updateHeaderSettingsWithoutChange() {
		///переотрисовка шапки без изменений
		instance.updateSettings({ nestedHeaders: [nestedHighHeader]})
	}

    function actualizationValuesAutofilterLocal() {
		///актуализация данных (values) последнего выбранного автофильтра
		valuesAutofilter.value = (store.getters.autofilterByColNum(selectedColumn.value) as IAutofilter).values
		//console.log('valuesAutofilter.value', valuesAutofilter.value)
	}
	function actualizationAppliedAutofilterLocal() {
		///актуализация  (appllied) последнего выбранного автофильтра
		applliedAutofilter.value = false
	}
	

    function updateAfterClearAutofilter(newObject: IAutofilter) {
	
		let columnName = newObject.columnName
		let columnNum = newObject.columnNum

		let sort = [...dataValue]
		let autofilterList: Map<number, IAutofilter> = store.getters.autofilterList

		for (let elFilter of autofilterList.values()) {
            if (columnName !== elFilter.columnName) {
				if (elFilter.applied === true) {
                    
					const rule: string = elFilter.appliedRule
					const fileldType: EnumTypeField = elFilter.fieldType

					sort = sort.filter((el: any) => {
						switch (fileldType) {
							case  EnumTypeField.String:
								
								//замена "Пустые строки" на ""
								{
									const inxEmptyString: number = elFilter.filterValues.indexOf(EnumEmptyString.EmptyString)
									if (inxEmptyString !== -1) {
										elFilter.filterValues[inxEmptyString] = EnumEmptyString.EmptyStringValue
									}

									if (elFilter.filterValues.some((searchvalue: string) => searchvalue === el[elFilter.columnName])) {
										return el
									}
								}
								break
							case  EnumTypeField.Number:
							{
								const minValue = elFilter.values[0]
								const maxValue = elFilter.values[1]
								
								
								//console.log('maxValue', maxValue)
								switch (rule) {
									case  EnumRuleAutofilter.equally:
										if (Number(el[elFilter.columnName]) === Number(minValue)) {
											return el
										}
									break
									case  EnumRuleAutofilter.morethan:
									//console.log('morethan', rule)
										if (Number(el[elFilter.columnName]) > Number(minValue)) {
											return el
										}
									break
									case  EnumRuleAutofilter.lessthan:
										if (Number(el[elFilter.columnName]) < Number(minValue)) {
											return el
										}
									break
									case  EnumRuleAutofilter.between:
										if (Number(el[elFilter.columnName]) >= Number(minValue) && Number(el[elFilter.columnName]) <= Number(maxValue)) {
											return el
										}
									break
								}
							}
							break
							case  EnumTypeField.Date:
							//тело
							break
						}
					})
				}
		}
		}

		loadData(sort)
		store.dispatch('updateAutofilter', sort)

		actualizationValuesAutofilterLocal()

		let newObjectAutofilter = {
			...newObject,
			filterValues: [],
			values: valuesAutofilter.value
		}

		store.dispatch('updateObjectAutofilter', newObjectAutofilter)
		
        //при сбросе фильтра values не должен быть пучтым [] 
		updateHeaderSettingsWithoutChange()
	}

	function addGlobalFilter() {
		emit('showPopupCreateFilterName')
	}
	
	function clearAllFilter() {

		//убрать признак активности быстрого фильтра (сработало только если оно первее выполняется в коде)
		if (thereIsAnActiveFastFilter.value === true) {
			store.dispatch('deactivatedFastFilter')
		}

		loadData(dataValue)
		
		if (thereIsAnActiveFastFilter.value === false) {
			store.dispatch('deactivatedAutofilters')
		}

		store.dispatch('updateAutofilter', dataValue)

		actualizationValuesAutofilterLocal()
		actualizationAppliedAutofilterLocal()

		//обнов шапку
		updateHeaderSettingsWithoutChange()
		
	}

    const getHtWidth = computed(() => {
      return window.innerWidth - 0;
    }) 
    const getHtHeight = computed(() => {
      return window.innerHeight - 120;
    }) 
  
  const hotSettings = reactive({
   data: dataValue,
   rowHeaders: true,
   colHeaders: true,
   nestedHeaders: [nestedHighHeader],
   fixedColumnsStart: 2,
   height: getHtHeight,
   width: getHtWidth,
   columnSorting: true,
   activeHeaderClassName: 'activeHeaderClass',
  currentRowClassName: 'currentRowClass',
  currentHeaderClassName: 'currentHeaderClass',
  currentColClassName: 'currentColClass',
  persistentState: true,
  beforeOnCellMouseDown,
  afterGetColHeader,
  manualColumnResize: true,
  autoWrapRow: true,
  autoWrapCol: true,
  columns,
	hiddenColumns: {
		columns: hiddenColumns,
		indicators: true
	},
    licenseKey: 'non-commercial-and-evaluation'
  })
    
  
  function afterGetColHeader(column: number, td: HTMLTableCellElement, row: number, custom?: boolean) {
	return renderAfterGetColHeader(column, td, row)
  }

  function loadData(data: IModelData[]) {
	countRow.value = data.length
	instance.loadData(data)
  }

  function beforeOnCellMouseDown(event: any, coords: any, td: HTMLTableCellElement, controller: any) {
    let typeProject: string = instance.getDataAtCell(coords.row, 1)

	if (typeProject === EnumTypeBrandRow.brand) {

		let buttonMouse: number = event.button

		if (buttonMouse === 0) {
			instance.deselectCell()
			event.stopImmediatePropagation();
		}
	}
  }
  
  </script>
  
  <style lang="css">
  
  #tooltip-header {
    background-color: rgb(255, 255, 255);
    padding: 5px;
    z-index: 1001 !important;
    position: fixed;
    display: none;
    
    height: auto;
    width: auto;
    white-space: normal !important;
    -webkit-box-shadow: 0px 0px 6px 2px rgba(34, 60, 80, 0.18);
    -moz-box-shadow: 0px 0px 6px 2px rgba(34, 60, 80, 0.18);
    box-shadow: 0px 0px 6px 2px rgba(34, 60, 80, 0.18);
  }
  .material {
    font-style: normal !important;
    color: var(--main-text-color);
  }

  .material:hover {
    font-style: normal !important;
    color: #6eaecc ;
	cursor: pointer !important;
  }

  .table-wrapper {
	width: 100%;
	height: 100%;
	position: relative;
  }

  .table-wrapper__board {
	padding: 2px 10px 2px 10px;
	display: flex;
	align-items: center;
	flex-direction: row;
	justify-content: space-between;
  }
	.table-wrapper__board-right {
		display: flex;
		flex-direction: row;
		gap: 18px;
		font-style: normal !important;
	height: 34px;
	}
	.table-wrapper__text {
		color: var(--main-text-color);
		font-family: 'Roboto500';
		white-space: nowrap;
		user-select: none;
	}
	.currentHeaderClass {
		background-color: hsl(100, 62%, 85%) !important;
		background-color: #eceff1  !important;
	}

	.activeHeaderClass {
		background-color: hsl(100, 62%, 85%) !important;
		background-color: #eceff1 !important;
	}

.handsontable td,
.handsontable tr {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: center;
	vertical-align: central;
	height: 30px;
}

.handsontable th {
    color: var(--hs-th-color);
	font-weight: bold;
	font-size: 12px;
	background-color: white;
	font-family: 'Ubuntu500' !important;
	vertical-align: middle;
}

#tooltip-text {
    background-color: white;
    color: var(--hs-th-color);
    /* border-radius: 4px; */
    font-size: 16px;
	font-family: 'Roboto400' !important;
	letter-spacing: 0.3px !important;
    padding: 16px;

	line-height: normal;
    /* border: 1px solid #c2c2b747; */
    z-index: 100 !important;
    position: fixed;
    display: none;
    width: auto;
    height: auto;
    /* max-width: 800px;
    min-width: 100px; */
    white-space: normal !important;
    -webkit-box-shadow: 0px 0px 6px 2px rgba(34, 60, 80, 0.18);
    -moz-box-shadow: 0px 0px 6px 2px rgba(34, 60, 80, 0.18);
    box-shadow: 0px 0px 6px 2px rgba(34, 60, 80, 0.18);
  }

  </style>
