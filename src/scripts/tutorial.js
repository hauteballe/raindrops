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
