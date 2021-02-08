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
  const backgroundSound = document.getElementById("background-sound");
  const correctAnswerSound = document.getElementById("correct-answer");
  const incorrectAnswerSound = document.getElementById("incorrect-answer");
  const soundButton = document.getElementById("sound");
  const gameScreen = document.querySelector(".game-screen");
  const display = document.querySelector(".display-input");
  const keyboard = document.querySelector(".keyboard");
  let scoreOnDisplay = document.querySelector(".score-number");

  soundButton.addEventListener("click", (event) => {
    if (backgroundSound.paused) {
      backgroundSound.play();
    } else {
      backgroundSound.pause();
    }
  });

  function changeDisplay(number) {
    if (display.value.length < 3) {
      if (display.value == 0) {
        display.value = number;
      } else {
        display.value += number;
      }
    }
  }

  const clearDisplay = (operation) => {
    if (display.value !== 0) {
      display.value = "";
    }
  };

  const deleteLastNumber = () => {
    if (display.value !== "") {
      display.value = display.value.slice(0, display.value.length - 1);
    }
  };

  function enterAnswer() {
    if (display.value !== "") {
      let enteredAnswer = display.value;
      clearDisplay();
      checkAnswer(enteredAnswer);
    }
  }

  const getInputValue = () => {
    keyboard.onclick = function (event) {
      let number = event.target.getAttribute("data-number");
      let operation = event.target.getAttribute("data-operation");

      if (number) {
        changeDisplay(number);
      } else if (operation == "clear") {
        clearDisplay(operation);
      } else if (operation == "delete") {
        deleteLastNumber(operation);
      } else if (operation == "enter") {
        enterAnswer(operation);
      }
    };
  };

  getInputValue();

  const checkAnswer = (enteredAnswer) => {
    const drops = gameScreen.querySelectorAll(".drop");
    for (let drop of drops) {
      if (drop.dataset.result === enteredAnswer) {
        playSplashAnimation(drop);
        changeScoreUp();
        correctAnswerSound.play();
        return;
      }
    }
    changeScoreDown();
    incorrectAnswerSound.play();
  };

  const changeScoreUp = () => {
    state.score++;
    scoreOnDisplay.innerText = state.score;
  };

  const changeScoreDown = () => {
    state.score--;
    scoreOnDisplay.innerText = state.score;
  };

  const playSplashAnimation = (drop) => {
    drop.classList.add("splash");
    drop.innerHTML = '<img src="./assets/img/splash.png"/>';
    setTimeout(() => {
      drop.remove();
    }, 300);
  };

  const state = {
    createDropInterval: 5000,
    isRunning: false,
    score: 0,
  };

  const startGame = () => {
    state.isRunning = true;
    createDrop();
    checkCollision();
  };

  const getOperators = (operation) => {
    const numbers = getRange(1, 10);
    let num1 = randomChoice(numbers);
    let num2 = randomChoice(numbers);
    if (operation === "-" && num1 < num2) {
      const buffer = num1;
      num1 = num2;
      num2 = buffer;
    }
    return { num1, num2 };
  };

  const createDrop = () => {
    const gameScreenWidth = gameScreen.offsetWidth;
    const dropLeftPositions = getRange(100, gameScreenWidth - 160, (step = 60));
    const drop = document.createElement("div");

    const operation = document.createElement("div");
    let oper = randomChoice(["+", "-", "*", "÷"]);
    operation.innerText = oper;

    let operators = getOperators(oper);
    const operator1 = document.createElement("div");
    operator1.innerText = operators.num1;
    const operator2 = document.createElement("div");
    operator2.innerText = operators.num2;

    let result = getResult(operators.num1, operators.num2, oper);

    drop.classList.add("drop");
    drop.style.left = `${randomChoice(dropLeftPositions)}px`;
    drop.dataset.result = result;

    gameScreen.appendChild(drop);
    drop.appendChild(operator1);
    drop.appendChild(operation);
    drop.appendChild(operator2);

    setTimeout(() => {
      if (state.isRunning === false) {
        return;
      }
      createDrop();
    }, state.createDropInterval);
  };

  const getResult = (number1, number2, operation) => {
    let operationResult;
    if (operation == "+") {
      operationResult = number1 + number2;
    } else if (operation === "-") {
      operationResult = number1 - number2;
    } else if (operation === "*") {
      operationResult = number1 * number2;
    } else if (operation === "÷") {
      operationResult = number1 / number2;
    }
    return operationResult;
  };

  const checkCollision = () => {
    const gameScreenHeight = gameScreen.offsetHeight;
    const drops = gameScreen.querySelectorAll(".drop");

    for (let drop of drops) {
      const dropPosition = drop.offsetTop + drop.offsetHeight;
      if (dropPosition >= gameScreenHeight) {
        drop.remove();
        changeScoreDown();
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
