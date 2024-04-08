const a = document.createElement("img");
a.src = "/back.png";

a.addEventListener("click", () => {
  window.location.href = "/";
});

a.style.position = "fixed";
a.style.top = "10px";
a.style.width = "30px";
a.style.height = "30px";
a.style.borderRadius = "20%";
a.style.left = "10px";

document.body.appendChild(a);
