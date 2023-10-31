export default class QueryBuilder {
  private table: string
  private type: 'Select' | 'Insert' | null = null

  //Select
  private selectColumns: string[] | 'All' | null = null
  private where: string[] = []
  private orderBy: string[] = []
  private limit: number | null = null

  //Insert
  private insertColumns: string[] = []
  private isBulk = false

  constructor(table: string) {
    this.table = table
  }

  public select(columns: string[] | 'All') {
    if (this.type) {
      throw Error('Type of query is already set!')
    }

    this.type = 'Select'
    this.selectColumns = columns

    return this
  }

  public insertInto(columns: string[]) {
    if (this.type) {
      throw Error('Type of query is already set!')
    }
    if (columns.length <= 0) {
      throw Error('length of columns should be bigger than 0!')
    }

    this.type = 'Insert'
    this.insertColumns = columns

    return this
  }

  public setWhere(
    field: string,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=',
    value: string
  ) {
    this.where.push(`${field} ${operator} ${value}`)

    return this
  }

  public setOrderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC') {
    this.orderBy.push(`${field} ${direction}`)

    return this
  }

  public setLimit(number: number) {
    this.limit = number

    return this
  }

  public setToBulk() {
    if (this.isBulk) {
      throw Error('isBulk is already set to true!')
    }

    this.isBulk = true

    return this
  }

  public getQuery() {
    if (this.selectColumns === null) {
      throw Error('selectColumns is not set!')
    }

    let query
    switch (this.type) {
      case 'Select':
        let columnsStr
        if (this.selectColumns === 'All') {
          columnsStr = '*'
        } else {
          columnsStr = ` ${this.selectColumns.join(', ')} `
        }

        let whereStr
        if (this.where.length > 0) {
          whereStr = `WHERE ${this.where.join(' AND ')}`
        } else {
          whereStr = ''
        }

        let orderByStr
        if (this.orderBy.length > 0) {
          orderByStr = `ORDER BY ${this.orderBy.join(', ')}`
        } else {
          orderByStr = ''
        }

        let limitStr
        if (this.limit) {
          limitStr = `LIMIT ${this.limit}`
        } else {
          limitStr = ''
        }

        query = `SELECT ${columnsStr} FROM ${this.table}${whereStr}${orderByStr}${limitStr}`
        break
      case 'Insert':
        let bulkStr
        if (this.isBulk) {
          const temp = `( ?}`
          for (let i = 1; i < this.insertColumns.length; i++) {
            temp.concat(', ?')
          }
          temp.concat(')')
        } else {
          bulkStr = '?'
        }

        query = `INSERT INTO ${this.table} (${this.insertColumns.join(
          ', '
        )}) VALUES ${bulkStr}`
        break
      default:
        throw Error('Type of query is invalid!')
    }

    return query
  }
}
