// import { pubSub } from "./pubSub";
// import { domHandler } from "./domHandler";
// import { playerBase } from "./players";
// import { logics } from "./logics";
const pubSub = {
  events: {},
  subscribe: (eventName, functionName) => {
    pubSub["events"][eventName] = pubSub["events"][eventName] || [];
    pubSub["events"][eventName].push(functionName);
  },
  unsubscribe: (eventName, functionName) => {
    const functions = pubSub["events"][eventName];
    functions.forEach((callbackFunction, index) => {
      if (callbackFunction === functionName) {
        functions.splice(index, 1);
      }
    });
  },
  publish: (eventName, args = null) => {
    const functions = pubSub["events"][eventName];
    console.dir(functions);
    functions.forEach((callbackFunction) => {
      callbackFunction(args);
    });
  },
};
const domHandler = {
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
    signPlayer: (sign) => {
      domHandler.objects.board.dataset.playerSign = sign;
    },
    init: () => {
      domHandler.manipulation.fillBoard();
      domHandler.objects.board.addEventListener(
        "click",
        domHandler.events.bookBoard
      );
      pubSub.publish("boardLoaded", true);
    },
  },
  events: {
    bookBoard: (event) => {
      //   console.dir(event.target);
      if (event.target.disabled) return;
      event.target.disabled = "true";
      event.target.textContent = domHandler.objects.board.dataset.playerSign;
      pubSub.publish("endOfTurn");
      //   now get player data and fill in here
    },
  },
};
const playerBase = {
  players: new Map(),
  identifiers: [],
};

const player = function (nick = "player-one", sign = "X") {
  // let timesWon = 0;
  // let timesLose = 0;
  // let color = "red";
  const getNick = function () {
    return nick;
  };
  const lose = function () {
    timesLose++;
  };
  const changeNick = function (newNick) {
    if (playerBase.players.has(newNick)) return false;
    playerBase.players.delete(nick);
    nick = newNick;
    playerBase.players.set(nick, this);
    playerBase.setIdentifiers();
  };
  const getSign = function () {
    return sign;
  };
  return {
    getNick,
    changeNick,
    getSign,
  };
};
playerBase.players.set("player-one", player());
playerBase.players.set("player-two", player("player-two", "O"));
playerBase.setIdentifiers = function (args) {
  console.dir(args);
  const identifiers = [];
  for (const i of playerBase.players.values()) {
    identifiers.push([i.getNick(), i.getSign()]);
  }
  playerBase.identifiers = identifiers.reverse();
  pubSub.publish("playersLoaded", identifiers);
};
const logics = {
  getPlayer(array) {
    console.dir(array);
    console.dir(typeof array);
    const currentPlayer = array.reverse()[0];
    const nickname = currentPlayer[0];
    const sign = currentPlayer[1];
    pubSub.publish("playerChanged", nickname);
    pubSub.publish("newSign", sign);
    return [nickname, sign];
  },
  fetchPlayers() {
    pubSub.publish("newTurn", playerBase.identifiers);
  },
  getDiagonals(array) {
    const diagonal1 = [];
    const diagonal2 = [];
    let index1 = 0;
    let index2 = 2;
    while (index1 <= 8) {
      diagonal1.push(array[index1]);
      index1 += 4;
    }
    while (index2 <= 6) {
      diagonal2.push(array[index2]);
      index2 += 2;
    }
    // console.dir(diagonal1);
    return [diagonal1, diagonal2];
  },
  getGrid(array) {
    const columnArray = [];
    const rowArray = [];
    const uniqueColumns = [
      ...new Set(array.map((item) => item.dataset.column)),
    ];
    const uniqueRows = [...new Set(array.map((item) => item.dataset.row))];
    for (let column of uniqueColumns) {
      columnArray.push(array.filter((item) => item.dataset.column === column));
    }
    for (let row of uniqueColumns) {
      rowArray.push(array.filter((item) => item.dataset.row === row));
    }
    return [columnArray, rowArray];
  },
  checkSigns(array) {
    if (array.some((item) => !item.disabled)) return false;
    const signs = new Set(array.map((item) => item.textContent)); //get unique text (will serve as user mark)
    return signs.size === 1;
  },
  checkGrid(array) {
    // console.dir(array);
    for (const subArray of array) {
      if (subArray.some((item) => !item.disabled)) continue;
      //for every nested array
      if (this.checkSigns(subArray)) {
        return subArray;
      }
    }
    return false;
  },
  checkWin() {
    const [columnArray, rowArray] = logics.getGrid(domHandler.objects.buttons);
    const [diagonal1, diagonal2] = logics.getDiagonals(
      domHandler.objects.buttons
    );
    console.dir({ diagonal1, diagonal2 });
    const rowMatch = logics.checkGrid(columnArray);
    const columnMatch = logics.checkGrid(rowArray);
    const diagonal1Match = logics.checkSigns(diagonal1);
    const diagonal2Match = logics.checkSigns(diagonal2);
    // console.dir({ rowMatch, columnMatch });
    if (rowMatch || columnMatch || diagonal1Match || diagonal2Match)
      alert("Game over!");
  },
};
pubSub.subscribe("boardLoaded", playerBase.setIdentifiers);
pubSub.subscribe("playersLoaded", logics.getPlayer);
pubSub.subscribe("endOfTurn", logics.fetchPlayers);
pubSub.subscribe("endOfTurn", logics.checkWin);
pubSub.subscribe("newTurn", logics.getPlayer);
pubSub.subscribe("playerChanged", domHandler.manipulation.renderNick);
pubSub.subscribe("newSign", domHandler.manipulation.signPlayer);
domHandler.manipulation.init();
