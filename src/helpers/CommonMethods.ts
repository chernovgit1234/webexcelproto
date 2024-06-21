export function toDate(date: string, format: string) {
  const normalized: string = date.replace(/[^a-zA-Z0-9]/g, '-');
  const normalizedFormat: string= format.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  const formatItems: string[] = normalizedFormat.split('-');
  const dateItems: any[] = normalized.split('-');
  const monthIndex: any  = formatItems.indexOf("mm");
  const dayIndex: any    = formatItems.indexOf("dd");
  const yearIndex: any   = formatItems.indexOf("yyyy");
  const today = new Date()
  const year  = yearIndex>-1  ? dateItems[yearIndex] : today.getFullYear()
  const month = monthIndex>-1 ? dateItems[monthIndex]-1 : today.getMonth()-1
  const day   = dayIndex>-1   ? dateItems[dayIndex]     : today.getDate()
  return new Date(year, month, day)
}