document.onclick = hideMenu; 
document.oncontextmenu = rightClick; 
  
function hideMenu() { 
    document.getElementById("contextMenu").style.display = "none" 
} 
  
function rightClick(e) { 
    e.preventDefault();

    if (document.getElementById("contextMenu").style.display == "block") 
        hideMenu(); 
    else { 
        var menu = document.getElementById("contextMenu")     
        menu.style.display = 'block'; 
        menu.style.left = e.pageX + "px"; 
        menu.style.top = e.pageY + "px"; 
    }  
} 
function cloak() {
    document.title = "Home";
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = 'https://ssl.gstatic.com/classroom/ic_product_classroom_32.png';
    document.getElementById("contextMenu").style.display = "none";
}

function makenameofgame(name) {
    const n = document.createElement('p');
    n.innerHTML = name;
    document.body.appendChild(n);
}
const buttons = document.getElementsByTagName('button');
    const buttonCount = buttons.length;

    console.log('Number of buttons:', buttonCount);
function searchButtons() {
    var input, filter, container, buttons, button, i, txtValue;
    input = document.getElementById('searchInput');
    container = document.getElementById('container');
  
    // Check if the necessary elements are present
    if (!input || !container) {
      console.error("Input or container not found.");
      return;
    }
  
    filter = input.value.toUpperCase();
    buttons = container.getElementsByClassName('bubbly-button');
  
    for (i = 0; i < buttons.length; i++) {
      button = buttons[i];
  
      // Check if the button has an anchor tag inside
      var anchor = button.querySelector('a');
  
      if (anchor) {
        txtValue = anchor.textContent || anchor.innerText;
      } else {
        txtValue = button.textContent || button.innerText;
      }
  
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        button.style.display = '';
      } else {
        button.style.display = 'none';
      }
    }
  }
