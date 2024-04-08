const a = document.createElement("button");
a.innerText = "↩";

a.addEventListener("click", () => {
  window.location.href = "/";
});

a.style.position = "fixed";
a.style.top = "10px";
a.style.right = "10px";

document.body.appendChild(a);
