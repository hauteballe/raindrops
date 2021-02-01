const getRange = (startNum, endNum, step = 1) => {
  let result = [];
  for (let i = startNum; i <= endNum; i += step) {
    result.push(i);
  }
  return result;
};

const randomChoice = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const Game = () => {
  const gameScreen = document.querySelector(".game-screen");
  const state = {
    createDropInterval: 2000,
    isRunning: false,
  };

  const startGame = () => {
    state.isRunning = true;
    createDrop();
    checkCollision();
  };

  const createDrop = () => {
    const gameScreenWidth = gameScreen.offsetWidth;
    const dropLeftPositions = getRange(100, gameScreenWidth - 160, (step = 60));
    const drop = document.createElement("div");
    drop.classList.add("drop");
    drop.style.left = `${randomChoice(dropLeftPositions)}px`;

    gameScreen.appendChild(drop);

    setTimeout(() => {
      if (state.isRunning === false) {
        return;
      }
      createDrop();
    }, state.createDropInterval);
  };

  const checkCollision = () => {
    const gameScreenHeight = gameScreen.offsetHeight;
    const drops = gameScreen.querySelectorAll(".drop");

    for (let drop of drops) {
      const dropPosition = drop.offsetTop + drop.offsetHeight;
      if (dropPosition >= gameScreenHeight) {
        drop.remove();
      }
    }

    setTimeout(() => {
      if (state.isRunning === false) {
        return;
      }
      checkCollision();
    }, 100);
  };

  startGame();
};

Game();
