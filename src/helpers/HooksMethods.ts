
import { nextTick } from 'vue'
import {nestedHighHeader} from '../helpers/ColumnsHelper'
import { storage } from '../store/index'


export function renderAfterGetColHeader(column: number, td: HTMLTableCellElement, row: number): any {

  let applied = false
  
  if (column > 0) {
	applied = storage.getters.appliedAutofilterByColNum(column)
  }
  
	//треугольник в углу
  if (column === -1) {
		td.style.cssText = 'position: relative; display: grid; place-items: center; cursor: pointer;'
		td.innerHTML = `<span class="material-icons-round material">signal_cellular_4_bar</span>`

		return td;
	}

	//отрисовка 1
	if (row === 0 && column > 1) {
		td.innerHTML = `${column - 1}. ${nestedHighHeader[column]}`
	}

	//не нужен фильтр для колонки "ТИП"
	if (row === 0 && column === 0) {
		return td
	}

	td.style.cssText = 'position: relative; border-bottom-color: transparent;height: 40px !important; min-width: 100px !important;'
  
    const div = document.createElement("div")
	const span = document.createElement("span")
	const img = document.createElement("img")
  
    applied === true ? img.src = require('@/assets/icons/filter-active.svg') : img.src = require('@/assets/icons/filter.svg');

    const tooltip = document.getElementById('tooltip-header') as HTMLDivElement
	const hsTable: any = document.getElementById('hs-table')

	div.style.cssText = 'position: absolute; width: 30px;height: 30px;display: grid;place-items: center;top: 5px;'
	span.style.cssText = 'position: absolute; inset: 0; top: 10px; padding: 0 0 0 30px !important;'
	img.style.cssText = 'width: 30px;height: 30px;cursor: pointer'
  
	img.onclick = function (event: Event) {
  
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
		
		if (closeableAutofilter === true) {
			
			tooltip.style.display = 'none'
		}
	}

	div.appendChild(img)
	td.appendChild(span)
	td.appendChild(div)

  return td
}