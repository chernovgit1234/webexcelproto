
import { nextTick } from 'vue'
import {nestedHighHeader} from '../helpers/ColumnsHelper'
import { storage } from '../store/index'
import { getFieldNameByColumnNum } from '../enums/EnumColumnValues'
import { fieldsInfoMap } from '../helpers/ColumnsHelper'
import {EnumTypeField} from '../enums/EnumsByFilter'
import {ISearchByColumnMetadata} from '../types/OtherTypes'
import { EnumEmptyString } from '../enums/EnumsCommon'

export function renderAfterGetColHeader(column: number, td: HTMLTableCellElement, row: number): any {

	let applied = false
	
	if (column > 0) {
		applied = storage.getters.appliedAutofilterByColNum(column)
	}
  
	//треугольник в углу
	if (column === -1 && row === 2) {
		td.style.cssText = 'position: relative; display: grid; place-items: center; cursor: pointer;'
		td.innerHTML = `<span class="material-icons-round material">signal_cellular_4_bar</span>`

		return td;
	}

	//не нужен фильтр и отступ для колонки "ТИП"  
	if (row === 2 && column === 1 ) {
		td.style.cssText = 'position: relative; border-bottom-color: transparent;height: 40px !important;'
		return td
	} else {
		td.style.cssText = 'position: relative; border-bottom-color: transparent;height: 40px !important;padding-left: 25px;'
	}
	if (row === 1 ) {
		td.style.cssText = 'position: relative; border-bottom-color: transparent;height: 40px !important;'
	}


	if (row === 0 && column >= 2 && column <= 5) {
		td.style.cssText = 'background:  #CCCCFF'
	} 
	if (row === 0 && column >= 5 && column <= 8) {
		td.style.cssText = 'background:  #F0DC82'
	} 
	if (row === 0 && column >= 8) {
		td.style.cssText = 'background:  #AFDAFC'
	} 
	
	const img = document.createElement("img")
  
    applied === true ? img.src = require('@/assets/icons/filter-active.svg') : img.src = require('@/assets/icons/filter.svg');

    const tooltip = document.getElementById('tooltip-header') as HTMLDivElement
	const hsTable: any = document.getElementById('hs-table')


	const valueSearchedColumn: string = storage.getters.valueSearchedColumn //перем - value поисковика
	//если есть значение, то надо отключить указатель мыши
	if (valueSearchedColumn) {
		img.style.cssText = 'position: absolute; width: 30px;height: 30px;cursor: default; left: 0px; top: 5px'
	} else {
		img.style.cssText = 'position: absolute; width: 30px;height: 30px;cursor: pointer; left: 0px; top: 5px'
	}

	img.onclick = function (event: Event) {
		//если поиск актив,то не открывать автофильтр 
        if (valueSearchedColumn) return

		storage.dispatch('selectColumn', column)
		event.stopPropagation()
		tooltip.style.display = 'block'
		tooltip.style.left = `${img.getBoundingClientRect().right + 7}px`
		tooltip.style.top = `${img.getBoundingClientRect().top}px`
	}

	hsTable.onclick = function () {
		tooltip.style.display = 'none'
	}

	document.onclick = function () {
		const closeableAutofilter = storage.getters.closeableAutofilter
		if (closeableAutofilter === true) tooltip.style.display = 'none'
	}
    
	//вставка знака фильтра
	if (row === 2 && column > 1) {
		td.appendChild(img)
	}

	const fieldType: EnumTypeField = fieldsInfoMap.get(column)?.fieldType as EnumTypeField
	const fieldNameSearchedColumn: string = storage.getters.fieldNameSearchedColumn
	
	const fieldNameByColumnNum = getFieldNameByColumnNum(column)
	//отрисовка 1 строки (средней)
	switch (fieldType) {
		case EnumTypeField.String:
        {
			const spanSearch = document.createElement("span")
			spanSearch.classList.add('material-icons-round')
			spanSearch.classList.add('material')

			const input = document.createElement("input") 
			input.type = 'text'

			input.style.cssText = 'padding: 0 5px 0 5px; overflow: hidden; text-overflow:ellipsis;  border: 1px solid #e6e6e6; font-size: 14px; position: absolute; width: calc(100% - 40px);height: 30px; left: 3px; top: 5px;color: #474a51; font-family: Roboto400 !important; font-weight: 400 !important;'

			if (fieldNameSearchedColumn && fieldNameSearchedColumn === fieldNameByColumnNum) {
			//если есть активный поиск по колонке 
				spanSearch.innerText = 'close'
				spanSearch.style.cssText = 'position: absolute; width: 30px;height: 30px; right: 4px; top: 5px; color: #474a51; border: 1px solid #e6e6e6;background-color: #ffb961;'
	
				input.value = valueSearchedColumn
				input.title = valueSearchedColumn

				spanSearch.onclick = function(event: Event) {
					//сброс поиска					
					storage.dispatch('resetSearch')
				}
			} else {
				spanSearch.innerText = 'search'
				spanSearch.style.cssText = 'position: absolute; width: 30px;height: 30px; right: 4px; top: 5px; color: #474a51; border: 1px solid #e6e6e6;background-color: #e6e6e6;'
				
				spanSearch.onclick = function(event: Event) {
					if (!input.value) return

					const metadata: ISearchByColumnMetadata = {value: input.value, fieldName: fieldNameByColumnNum}
					storage.dispatch('setSearchMetadata', metadata)
				}
				//вставка  input
				
			}

			if (row === 1 && column > 1) {
				td.appendChild(input)
				td.appendChild(spanSearch)
			}	
			}
			break 
		case EnumTypeField.Number:
			{
				
				if (row === 1) td.innerText = ''

                const summObject = storage.getters.summObject

				const spanSymbol = document.createElement("span")
				const spanResultSumm = document.createElement("span")

				spanSymbol.innerText = '∑'
				spanSymbol.style.cssText = 'position: absolute; top: 10px;left: 4px;font-size: 26px; color: #bcd7d2'
	
				spanResultSumm.style.cssText = 'position: absolute; top: 15px;left: 40%;right: 60%;font-size: 16px; color: orange; letter-spacing: 1px;'

				spanResultSumm.innerText = new Intl.NumberFormat("ru", { style: 'currency', currency: 'RUB' }).format(summObject.CostField)

				if (row === 1 && column > 1) {
					td.appendChild(spanSymbol)
					td.appendChild(spanResultSumm)
				}	
			}
			//return td
			break
		case EnumTypeField.Date:
			
			//return td
			break
	}

    return td
}