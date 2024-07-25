/* function updateGroupRowByAlterHeader(hiddenColumns: number[]) {
    //получение номеров активных колонок
    let activeColumns: number[] = [...fieldsInfoMap.keys()].reduce( (acc: number[], item: number) => {
        if (!hiddenColumns.includes(item)) acc.push(item); 
            return acc;
    } , []);
    
    //получение полей по активным колонкам
    let columnsName: string[] = []
    activeColumns.forEach((num: number) => {
        let columnName: string = fieldsInfoMap.get(num)?.fieldName as string
        columnsName.push(columnName)
    })

    let headerGroup1: string[] = []
    let headerGroup2: string[] = []
    let headerGroup3: string[] = []

    columnsName.forEach((columnName: string) => {
        switch (columnName) {
            case EnumFieldName.Name:
                headerGroup1.push(columnName)
                break
            case EnumFieldName.Brand:
                headerGroup1.push(columnName)
                break
            case EnumFieldName.Title:
                headerGroup1.push(columnName)
                break
    }})

    columnsName.forEach((columnName: string) => {
        switch (columnName) {
            case EnumFieldName.ProductionDate:
                headerGroup2.push(columnName)
                break
            case EnumFieldName.Сost:
                headerGroup2.push(columnName)
                break
            case EnumFieldName.ProducingCountry:
                headerGroup2.push(columnName)
                break
    }})

    columnsName.forEach((columnName: string) => {
        switch (columnName) {
            case EnumFieldName.AgentEmail:
                headerGroup3.push(columnName)
                break
            case EnumFieldName.Comments:
                headerGroup3.push(columnName)
                break
    }})

    //заполнение строки групп для шапки
    let nestedHighHeaderGroupLocal: any[] = []
    nestedHighHeaderGroupLocal.push(...[{ label: '0', colspan: 0 }, { label: '1', colspan: 0 }])

    //if (headerGroup1.length)
    nestedHighHeaderGroupLocal.push({ label: 'Группа колонок 1', colspan: headerGroup1.length })
    //if (headerGroup2.length)
    nestedHighHeaderGroupLocal.push({ label: 'Группа колонок 2', colspan: headerGroup2.length })
    //if (headerGroup3.length)
    nestedHighHeaderGroupLocal.push({ label: 'Группа колонок 3', colspan: headerGroup3.length })

    return nestedHighHeaderGroupLocal
} */