function newTab() {
  const tab = document.createElement("div");
  tab.classList.add("__tab");

  const tabContent = document.createElement("div");
  tabContent.classList.add("__tab_content");

  const iframe = document.createElement("iframe");
  iframe.classList.add("__iframe");
  iframe.src = "/static/";

  const inputMain = document.createElement("div");
  inputMain.classList.add("__input_main");

  tab.appendChild(tabContent);

  const tabs = document.querySelector(".__tabs");

  if (tabs) {
    tabs.insertBefore(tab, tabs.firstChild);
  }

  document.body.insertBefore(tab, document.body.firstChild);

  const tabTitle = document.createElement("span");
  tabTitle.classList.add("__tab_title");
  tabTitle.innerText = "Tab";
  tab.appendChild(tabTitle);
  tabTitle.addEventListener("click", function () {
    const activeTabs = document.querySelectorAll(".__tab.__active");
    for (let i = 0; i < activeTabs.length; i++) {
      activeTabs[i].classList.remove("__active");
    }
    tab.classList.add("__active");
    inputMain.innerText = iframe.src;
  });
  tabContent.appendChild(tabTitle);

  const plus = document.createElement("div");
  plus.classList.add("__plus");
  plus.addEventListener("click", function () {
    newTab();
  });
  tabContent.appendChild(plus);

  const x = document.createElement("div");
  x.classList.add("__x");
  x.addEventListener("click", function () {
    tab.remove();
    iframe.remove();
  });
  tabContent.appendChild(x);

  document.body.appendChild(inputMain);

  document.body.appendChild(iframe);
}

window.onload = function () {
  newTab();
};
