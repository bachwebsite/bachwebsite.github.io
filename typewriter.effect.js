const text = "breakium";
const typingDelay = 200; 
const initialDelay = 200;
const blinker = document.getElementById("blinking");
const h1 = document.querySelector(".typewriter");

function type() {
    setTimeout(() => {
        for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            h1.textContent += text[i];
            if (i === text.length - 1) {
              blinker.style.display = "none"; 
            }
        }, i * typingDelay);
        }
    }, initialDelay);
}

type();