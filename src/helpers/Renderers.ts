
import Handsontable from 'handsontable';
import {EnumTypeBrand, EnumTypeBrandRow} from '../enums/EnumColumnValues'
import highlightWords from 'highlight-words';
import { storage } from '@/store';

export function renderGuid(td: HTMLTableCellElement): HTMLTableCellElement {
  td.style.cssText = 'position: relative; display: grid; place-items: center; cursor: pointer'

  td.innerHTML =  `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#474a51">

  <g id="SVGRepo_bgCarrier" stroke-width="0"/>
  
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
  
  <g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M4 5V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V9C20 7.34315 18.6569 6 17 6H5C4.44772 6 4 5.55228 4 5ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4142 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12ZM7.25 15.5C7.25 15.0858 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 15.0858 14.25 15.5C14.25 15.9142 13.9142 16.25 13.5 16.25H8C7.58579 16.25 7.25 15.9142 7.25 15.5Z" fill="#eceff1"/> <path d="M4.40879 4.0871C4.75727 4.24338 5 4.59334 5 5H17C17.3453 5 17.6804 5.04375 18 5.12602V4.30604C18 3.08894 16.922 2.15402 15.7172 2.32614L4.91959 3.86865C4.72712 3.89615 4.55271 3.97374 4.40879 4.0871Z" fill="#eceff1"/> </g>
  
  </svg>`
  /* td.onclick =function(){ 
    console.log('111111111addEventListener', value)
   } */
  return td;
}


export function renderBrandCell(td: HTMLTableCellElement, value: EnumTypeBrand): HTMLTableCellElement {
    td.style.fontWeight = 'bold'
    td.style.verticalAlign = 'middle'
    td.style.boxShadow = '-7px 0px 5px -3px rgba(0, 0, 0, 0.2) inset'
    
  switch (value) {
    case EnumTypeBrand.brand: 
    td.style.backgroundColor = '#A8E4A0'
    td.style.backgroundColor = '#c5d0e6'
    td.innerText = EnumTypeBrand.brand
      break
    case EnumTypeBrand.product: td.style.backgroundColor = 'white'
    td.innerText = EnumTypeBrand.product
      break
  }

  return td;
}

export function renderTypeDate( row: number, td: HTMLTableCellElement, value: string, error?: boolean): HTMLTableCellElement {

  if (error === true) {
    td.style.backgroundColor = '#ff6666'
    td.style.transition = 'all 0.3s ease 0s'
  } else {
    td.style.backgroundColor = 'white'
    td.style.transition = 'all 0.3s ease 0s'
  }
   
  if (value) {
    td.innerText = value.split('-').join('/')
  }

  return td
}
export function renderTypeNumber( row: number, td: HTMLTableCellElement, value: number, error?: boolean): HTMLTableCellElement {

  if (error === true) {
    td.style.backgroundColor = '#ff6666'
    td.style.transition = 'all 0.3s ease 0s'
  } else {
    td.style.backgroundColor = 'white'
    td.style.transition = 'all 0.3s ease 0s'
  }

  td.style.verticalAlign = 'middle'
  td.style.textAlign = 'right'
  td.innerText = new Intl.NumberFormat("ru", { style: 'currency', currency: 'RUB' }).format(value)

  return td
}

export function renderTypeDropdown( row: number, td: HTMLTableCellElement, value: string, error?: boolean): HTMLTableCellElement {

  if (error === true) {
    td.style.backgroundColor = '#ff6666'
    td.style.transition = 'all 0.3s ease 0s'
  } else {
    td.style.backgroundColor = 'white'
    td.style.transition = 'all 0.3s ease 0s'
  }

  td.style.verticalAlign = 'middle'
  
  td.innerText = value

  return td
}


export function renderTdCommon(instance: Handsontable,row: number,col: number, td: HTMLTableCellElement, value: string): HTMLTableCellElement {

  const typeProject: string = instance.getDataAtCell(row, 1)
      
  if (typeProject === EnumTypeBrand.brand) {
    td.style.backgroundColor = '#eceff1'
    td.style.textAlign = 'left'
  }
//////////////////
  td.innerText = ""
  const text: string = value
  
  const query: string = storage.getters.valueSearchedColumn.trim()
  
  const chunks: any = highlightWords({
    text, query, matchExactly: true
  })

  const createItem = (text: string, match: boolean, index: any) => {
    const el: HTMLSpanElement = document.createElement('span')

    if (text === query || (!match && text === query)) {
      el.style.backgroundColor = '#fcec5b'
    }

    el.innerHTML = text
    el.id = index

    return el
  }

  if (chunks.length) {
    chunks.forEach((el: any, match: boolean, index: any) => {
      td.appendChild(createItem(el.text, match, index))
    })
  } else {
    td.innerText = value
  }

  return td
}


export function renderTypeTooltip(instance: Handsontable,row: number,col: number, td: HTMLTableCellElement, value: string): HTMLTableCellElement {
  const tooltip = document.getElementById('tooltip-text') as HTMLDivElement
  const canvas: any = document.getElementById('canvas-ht')
  const ctx = canvas.getContext('2d')

  td.onmouseover = function () {
    const valueWidth: number = ctx.measureText(value).width + 50
    const tdWidth: number = td.offsetWidth

    if (valueWidth < tdWidth) return

    tooltip.style.display = 'block'
    tooltip.innerHTML = td.innerHTML.toString()
    tooltip.style.top = `${td.getBoundingClientRect().top}px`
    tooltip.style.left = `${td.getBoundingClientRect().right + 7}px`
  }

  td.onmouseout = function () {
    tooltip.style.display = 'none'
    tooltip.innerHTML = ''
  }
  
  return renderTdCommon(instance, row,col, td, value)
}
