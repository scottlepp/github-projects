const status = {};

export function load(url: string) {
  const fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", url)
  document.getElementsByTagName("head")[0].appendChild(fileref);
  add(url, fileref);
  return status[url];
}

function add(url: string, fileref) {
  if (status[url] === undefined) {
    const promise = new Promise(resolve => {
      fileref.onload = () => {
        resolve();
      }
    })
    status[url] = promise;
  }
}