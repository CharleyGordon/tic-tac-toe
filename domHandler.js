export const domHandler = {
  objects: {
    board: document.querySelector(".board"),
    buttons: [],
    playerIndicator: document.querySelector(".player"),
  },
  manipulation: {
    fillBoard: () => {
      let column = 1;
      let row = 1;
      const objects = domHandler.objects;
      const board = objects.board;
      const buttons = objects.buttons;
      while (buttons.length !== 9) {
        if (column > 3) {
          column--;
          column /= 3;
          row++;
        }
        const button = document.createElement("button");
        button.dataset.column = column++;
        button.dataset.row = row;
        board.appendChild(button);
        buttons.push(button);
      }
    },
    clearBoard: () => {
      domHandler.objects.board.innerHTML = "";
      domHandler.objects.buttons = [];
    },
    renderNick: (nickname) => {
      domHandler.objects.playerIndicator.textContent = `${nickname}'s`;
    },
    init: () => {
      domHandler.manipulation.fillBoard();
      domHandler.objects.board.addEventListener(
        "click",
        domHandler.events.bookBoard
      );
      // pubSub.publish("players")
    },
  },
  events: {
    bookBoard: (event) => {
      console.dir(event.target);
      if (event.target.disabled) return;
      event.target.disabled = "true";
      //   now get player data and fill in here
    },
  },
};
// domHandler.manipulation.init();
// pubSub.subscribe("playerChanged", domHandler.manipulation.renderNick);
