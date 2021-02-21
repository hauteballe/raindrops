const MAX_WRONG_ANSWERS = 3;
const DEFAULT_CREATE_DROP_TIMEOUT = 5000;
const DROPS_WIDTH_INTERVAL = 60;
const GAME_SCREEN_RIGHT_OFFSET = 160;
const GAME_SCREEN_LEFT_OFFSET = 100;
const CHECK_COLLISION_INTERVAL = 100;
const OCEAN_INCREASE_OFFSET = 20;
const KEYBOARD_ALLOWED_KEYS = [
  "Enter",
  "Delete",
  "Backspace",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

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

class TutorialMode {
  constructor(game) {
    this.game = game;
  }

  emulateEnterAnswer(answer) {
    const inputDelayStep = 300;
    let inputDelay = 300;
    for (let c of answer.split("")) {
      setTimeout(() => {
        this.game.changeDisplay(c);
      }, inputDelay);
      inputDelay += inputDelayStep;
    }
    setTimeout(() => {
      this.game.enterAnswer();
    }, inputDelay);
  }

  solveEquation() {
    const drops = this.game.gameScreen.querySelectorAll(".drop");
    if (drops.length > 0) {
      const drop = drops[0];
      this.emulateEnterAnswer(drop.dataset.result);
    }

    setTimeout(() => {
      if (!this.game.isRunning) return;
      this.solveEquation();
    }, 4000);
  }

  start = () => {
    this.solveEquation();
  };
}

class RaindropsGame {
  constructor() {
    this.score = 0;
    this.wrongAnswers = 0;
    this.isRunning = false;
    this.createDropTimeout = DEFAULT_CREATE_DROP_TIMEOUT;
    this.gameScreen = document.querySelector(".game-screen");
    this.ocean = document.querySelector(".ocean");
    this.deepOcean = document.querySelector(".deep-ocean");
    this.display = document.querySelector(".display-input");
    this.keyboard = document.querySelector(".keyboard");
    this.scoreOnDisplay = document.querySelector(".score-number");
    this.correctAnswerSound = document.getElementById("correct-answer");
    this.incorrectAnswerSound = document.getElementById("incorrect-answer");
    this.soundButton = document.getElementById("sound");
    this.backgroundSound = document.getElementById("background-sound");
    this.gameOverScreen = document.querySelector(".game-over-screen");
    this.playAgainButton = document.querySelector(".play-again");
    this.fullScreenButton = document.querySelector(".fullscreen");

    this.keyboard.addEventListener("click", (event) =>
      this.handleKeyboardClick(event)
    );
    this.soundButton.addEventListener("click", (event) =>
      this.toggleBackgroundSound()
    );
    this.playAgainButton.addEventListener("click", (event) =>
      this.handleClickPlayAgain()
    );
    this.fullScreenButton.addEventListener("click", (event) =>
      this.enableFullScreen()
    );
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));
  }

  enableFullScreen() {
    document.documentElement.requestFullscreen();
  }

  toggleBackgroundSound() {
    if (this.backgroundSound.paused) {
      this.backgroundSound.play();
    } else {
      this.backgroundSound.pause();
    }
    this.soundButton.blur();
  }

  getResult(number1, number2, operation) {
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
  }

  getOperators(operation) {
    const numbers = getRange(1, 10);
    let firstOperator = randomChoice(numbers);
    let secondOperator = randomChoice(numbers);
    if (firstOperator < secondOperator && ["-", "÷"].includes(operation)) {
      const buffer = firstOperator;
      firstOperator = secondOperator;
      secondOperator = buffer;
    }
    if (operation === "÷" && firstOperator % secondOperator) {
      firstOperator -= firstOperator % secondOperator;
    }
    return { firstOperator, secondOperator };
  }

  createDrops() {
    const gameScreenWidth = this.gameScreen.offsetWidth;
    const dropLeftPositions = getRange(
      GAME_SCREEN_LEFT_OFFSET,
      gameScreenWidth - GAME_SCREEN_RIGHT_OFFSET,
      DROPS_WIDTH_INTERVAL
    );
    const drop = document.createElement("div");

    const operationEl = document.createElement("div");
    let operation = randomChoice(["+", "-", "*", "÷"]);
    operationEl.innerText = operation;

    let operators = this.getOperators(operation);
    const firstOperatorEl = document.createElement("div");
    firstOperatorEl.innerText = operators.firstOperator;
    const secondOperatorEl = document.createElement("div");
    secondOperatorEl.innerText = operators.secondOperator;

    let result = this.getResult(
      operators.firstOperator,
      operators.secondOperator,
      operation
    );

    drop.classList.add("drop");
    drop.style.left = `${randomChoice(dropLeftPositions)}px`;
    drop.dataset.result = result;
    drop.animate([{ top: "80px" }, { top: "100vh" }], { duration: 10000 });

    drop.appendChild(firstOperatorEl);
    drop.appendChild(operationEl);
    drop.appendChild(secondOperatorEl);
    this.gameScreen.appendChild(drop);

    setTimeout(() => {
      if (this.isRunning === false) return;
      this.createDrops();
    }, this.createDropTimeout);
  }

  playSplashAnimation(drop) {
    drop.classList.add("splash");
    drop.innerHTML = '<img src="./assets/img/splash.png"/>';
    setTimeout(() => {
      drop.remove();
    }, 300);
  }

  increaseOceanLevel(offsetLevel) {
    const newOceanLevel = this.deepOcean.offsetHeight + offsetLevel;
    this.deepOcean.style.height = `${newOceanLevel}px`;
  }

  resetScore() {
    this.score = 0;
    this.wrongAnswers = 0;
    this.scoreOnDisplay.innerText = "0";
  }

  changeScoreUp() {
    this.score++;
    this.scoreOnDisplay.innerText = this.score;
  }

  changeScoreDown() {
    this.score--;
    this.scoreOnDisplay.innerText = this.score;
  }

  checkGameFinished() {
    if (this.wrongAnswers >= MAX_WRONG_ANSWERS) {
      this.gameOver();
    }
  }

  checkAnswer(enteredAnswer) {
    const drops = this.gameScreen.querySelectorAll(".drop");
    for (let drop of drops) {
      if (drop.dataset.result === enteredAnswer) {
        this.playSplashAnimation(drop);
        this.changeScoreUp();
        this.correctAnswerSound.play();
        return;
      }
    }
    this.wrongAnswers += 1;
    this.changeScoreDown();
    this.incorrectAnswerSound.play();
    this.checkGameFinished();
  }

  checkCollision() {
    let oceanHeight = this.ocean.offsetTop;
    const drops = this.gameScreen.querySelectorAll(".drop");

    for (let drop of drops) {
      const dropPosition = drop.offsetTop + drop.offsetHeight;
      if (dropPosition >= oceanHeight) {
        drop.remove();
        this.changeScoreDown();
        this.wrongAnswers += 1;
        this.increaseOceanLevel(OCEAN_INCREASE_OFFSET);
        this.checkGameFinished();
      }
    }

    setTimeout(() => {
      if (this.isRunning === false) return;
      this.checkCollision();
    }, CHECK_COLLISION_INTERVAL);
  }

  changeDisplay(number) {
    if (this.display.value.length < 3) {
      if (this.display.value === 0) {
        this.display.value = number;
      } else {
        this.display.value += number;
      }
    }
  }

  clearDisplay() {
    this.display.value = "";
  }

  deleteLastNumber() {
    if (this.display.value) {
      this.display.value = this.display.value.slice(
        0,
        display.value.length - 1
      );
    }
  }

  enterAnswer() {
    if (this.display.value) {
      let enteredAnswer = this.display.value;
      this.clearDisplay();
      this.checkAnswer(enteredAnswer);
    }
  }

  handleKeyboardClick(event) {
    let number = event.target.getAttribute("data-number");
    let operation = event.target.getAttribute("data-operation");
    if (number) {
      this.changeDisplay(number);
    } else if (operation === "clear") {
      this.clearDisplay();
    } else if (operation === "delete") {
      this.deleteLastNumber();
    } else if (operation === "enter") {
      this.enterAnswer();
    }
  }

  handleKeyUp(event) {
    if (!KEYBOARD_ALLOWED_KEYS.includes(event.key)) {
      return;
    }
    if (event.key === "Enter") {
      this.enterAnswer();
    } else if (event.key === "Delete") {
      this.clearDisplay();
    } else if (event.key === "Backspace") {
      this.deleteLastNumber();
    } else {
      this.changeDisplay(event.key);
    }
  }

  removeAllDrops() {
    const drops = this.gameScreen.querySelectorAll(".drop");
    for (let drop of drops) {
      drop.remove();
    }
  }

  handleClickPlayAgain() {
    this.gameOverScreen.style.visibility = "hidden";
    this.start();
  }

  start() {
    this.isRunning = true;
    this.resetScore();
    this.createDrops();
    this.checkCollision();
  }

  stop() {
    this.isRunning = false;
    this.removeAllDrops();
  }

  gameOver() {
    this.stop();
    const resultScoreEl = document.querySelector("h2.result-score > span");
    resultScoreEl.innerText = this.score;
    this.gameOverScreen.style.visibility = "visible";
  }

  startTutorialMode() {
    const tutorialMode = new TutorialMode(this);
    tutorialMode.start();
  }
}

let game = new RaindropsGame();
game.start();

if (window.location.href.includes("tutorial")) {
  game.startTutorialMode();
}
