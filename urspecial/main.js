const times = [];
  var updateTime = null
  var minimum = []
  var lastMin = { last: 0, num: 0 }
  let fps;

  function refreshLoop(){
      window.requestAnimationFrame(() => {
          const now = performance.now();
          while (times.length > 0 && times[0] <= now - 1000){
              times.shift();
          }
          times.push(now);
          fps = times.length
          minimum.push(fps)
          if(updateTime === null || updateTime < Date.now()){
              if(lastMin.num === 10){
                  lastMin.last = minimum.sort((a, b) => a - b)[0]
                  lastMin.num = 0
                  minimum = []
              }
              //console.log(`${fps - 1}/${lastMin.last - 1} FPS`)
              window.parent.postMessage({ id: "sendFPSData", data: "count", count: `${fps - 1}/${lastMin.last - 1} FPS` }, "*")
              updateTime = Date.now() + 100
              lastMin.num++
          }
          refreshLoop()
      })
  }

  refreshLoop()

  document.onload = function(){ 
  		document.getElementById("gameIframe").focus() 
  		setinterval(() => {
  			document.getElementById("gameIframe").focus() 
  		}, 500)
  };
  document.body.onclick = function(){ document.getElementById("gameIframe").focus() };
