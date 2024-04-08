const a = document.createElement("img");
a.src = "/back.png";

a.addEventListener("click", () => {
  window.location.href = "/";
});

a.style.position = "fixed";
a.style.top = "10px";
a.style.width = "60px";
a.style.height = "60px";
a.style.borderRadius = "20%";
a.style.left = "10px";
a.style.cursor = "pointer";

document.body.appendChild(a);
