window.onload = function() {
    var buttonContainer = document.getElementById('buttonContainer');
    var buttons = Array.from(buttonContainer.getElementsByTagName('button'));

    buttons.sort(function(a, b) {
        return a.innerHTML.localeCompare(b.innerHTML);
    });

    buttons.forEach(function(button) {
        buttonContainer.appendChild(button);
    });
};