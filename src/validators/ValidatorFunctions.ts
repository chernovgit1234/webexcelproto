import {brands} from '../enums/Lists'

export function validatorDate(query: string, callback: any) {

  setTimeout(() => {
    const date = new Date(query);

    if (date instanceof Date && !isNaN(date.getTime())) {
      callback(true)
    } else {
      callback(false)
    }
  })
}

export function validatorDateWithoutCallbak(value: string) {
  const date = new Date(value);

  if (date instanceof Date && !isNaN(date.getTime())) {
    return true
  }

  return false
}

export function validatorByCostField(value: string) {
  ///^(0|[1-9]\d*)(\.[0-9]{1,2})?$/.test(value) - будет не более 2х числа после запятой, нельзя отриц. числа
  ///^-?(0|[1-9]\d*)(\.[0-9]{1,4})?$/.test(value) - разрешаем 4 числа после запятой и отриц. числа
  if (/^(0|[1-9]\d*)(\.[0-9]{1,2})?$/.test(value)) {
  //if (/^(0|[1-9]\d*)$/.test(value) ) {
    console.log('Va true')
    return true
  } 
  console.log('Va false')
  return false
}

export function validatorByBrandField(value: string) {

  if (brands.some((el: string) => el === value)) {
    return true
  }

  return false
}