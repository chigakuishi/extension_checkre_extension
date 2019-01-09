let list = {};

const checkExtension = (eid, cb) =>{
  const request = new XMLHttpRequest();
  request.open("GET", "https://fdsa.jp/sigma/extension/try.php?json=1&eid="+eid);
  request.addEventListener("load", (event) => {
    console.log(event.target.status); // => 200
    console.log(event.target.responseText); // => "{...}"
    if(event.target.status != 200){
      cb("error");
    }else{
      let op = JSON.parse(event.target.responseText);
      cb(null, op);
    }
  });
  request.send();
}
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  let match = tab.url.match(/^https:\/\/chrome.google.com\/webstore\/detail\/([^\/]*)\/([0-9a-z]{32})/);
  if (match) {
    if(match[2] in list){
      return;
    }
    checkExtension(match[2], (err, obj)=>{
      if(err){
        console.error(err);
      }else{
        list[match[2]] = obj;
        if(obj.danger.length){
          chrome.pageAction.setIcon({
            tabId: tabId,
            path: "icons/icon128_red.png"
          })
        }else if(obj.warn.length){
          chrome.pageAction.setIcon({
            tabId: tabId,
            path: "icons/icon128_yellow.png"
          })
        }else{
          chrome.pageAction.setIcon({
            tabId: tabId,
            path: "icons/icon128_green.png"
          })
        }
        /*
        if(obj.danger.length || obj.warn.length){
          alert( match[1]+"検査結果\n"+
            match[2]+
            "\n[警告]\n"+obj.danger.filter((x, i, self) => self.indexOf(x) === i).join("\n")+
            "\n\n[疑わしい挙動]\n"+obj.warn.filter((x, i, self) => self.indexOf(x) === i).join("\n")
          );
        }else{
          alert( match[1]+"検査結果\n" + '安全です');
        }
        */
      }
    });
    chrome.pageAction.show(tabId);
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: "icons/icon128_black.png"
    })
  }else{
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: "icons/icon128.png"
    })
    chrome.pageAction.hide(tabId);
  }
});
chrome.pageAction.onClicked.addListener( tab =>{
  let match = tab.url.match(/^https:\/\/chrome.google.com\/webstore\/detail\/([^\/]*)\/([0-9a-z]{32})/);
  if (match) {
    if(match[2] in list){
      let obj = list[match[2]]
      if(obj.danger.length || obj.warn.length){
        alert( match[1]+"検査結果\n"+
          match[2]+
          "\n[警告]\n"+obj.danger.filter((x, i, self) => self.indexOf(x) === i).join("\n")+
          "\n\n[疑わしい挙動]\n"+obj.warn.filter((x, i, self) => self.indexOf(x) === i).join("\n")
        );
      }else{
        alert( match[1]+"検査結果\n" + '安全です');
      }
    }else{
      alert("解析中");
    }
  }
});
