// import alasql from 'alasql';  // TODO - blows up

var fileref=document.createElement('script')
fileref.setAttribute("type","text/javascript")
fileref.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/alasql/0.5.5/alasql.min.js")
document.getElementsByTagName("head")[0].appendChild(fileref)

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