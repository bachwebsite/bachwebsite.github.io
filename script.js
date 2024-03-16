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
  function abtblk() {
    // Open a new window with about:blank URL
    var newWindow = window.open('about:blank', '_blank');

    // Write the contents of the previous page into the new window
    newWindow.document.write('<!DOCTYPE html>');
    newWindow.document.write('<html lang="en">');
    newWindow.document.write('<head>');
    newWindow.document.write('<meta charset="UTF-8">');
    newWindow.document.write('<title>Previous Page</title>');
    newWindow.document.write('</head>');
    newWindow.document.write('<body>');

    // Get the content of the previous page
    var previousPageContent = document.documentElement.outerHTML;

    // Write the content into the new window
    newWindow.document.write(previousPageContent);

    newWindow.document.write('</body>');
    newWindow.document.write('</html>');

    // Close the document
    newWindow.document.close();
}