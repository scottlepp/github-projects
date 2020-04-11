// import alasql from 'alasql';  // TODO - blows up

import { load } from 'js-loader'

export function execute(sql, data) {
  const w:any = window
  const alasql = w.alasql;
  let results = [];
  try {
    results =  alasql(sql, [data]);
  } catch (e) {
    console.error(e);
  }
  console.log(results)
  return results;
}

export function loaded() {
  return load('https://cdnjs.cloudflare.com/ajax/libs/alasql/0.5.5/alasql.min.js');
}