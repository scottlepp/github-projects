// import alasql from 'alasql';  // TODO - blows up

// workaround
import { load } from 'js-loader'

export function execute(sql, data) {
  const w:any = window
  const alasql = w.alasql;
  let results = [];
  try {
    let tables = [data];
    if (sql.includes('JOIN')) {
      tables = [data, data]
    } else {
      const queries = sql.split('?');
      if (queries.length > 1) {
        tables = [data, data]
      }
    }
    results =  alasql(sql, tables);
  } catch (e) {
    console.error(e);
  }
  console.log(results)
  return results;
}

export function loaded() {
  return load('https://cdnjs.cloudflare.com/ajax/libs/alasql/0.5.5/alasql.min.js');
}