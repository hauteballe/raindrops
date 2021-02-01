const play = document.getElementById("play");
const tutorial = document.getElementById("tutorial");

play.addEventListener("click", () => {
  document.location.href = "./src/play.html";
});

tutorial.addEventListener("click", () => {
  document.location.href = "./src/tutorial.html";
});
