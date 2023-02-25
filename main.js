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
    functions.forEach((callbackFunction) => {
      try {
        callbackFunction(args);
      } catch {
        console.error(eventName);
        console.error(callbackFunction);
      }
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
      domHandler.objects.board.removeEventListener(
        "click",
        domHandler.events.bookBoard
      );
      pubSub.publish("reRender");
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
      pubSub.publish("boardLoaded");
    },
  },
  events: {
    bookBoard: (event) => {
      if (event.target.disabled) return;
      event.target.disabled = "true";
      event.target.textContent = domHandler.objects.board.dataset.playerSign;
      pubSub.publish("endOfTurn");
      //   now get player data and fill in here
    },
    setColor(color) {
      // domHandler.objects.board.dataset
    },
  },
};
const playerBase = {
  players: new Map(),
  identifiers: [],
  signs: new Set(),
  current: "",
  customization: {
    rename(nick, newNick) {
      if (!playerBase.players.has(nick)) return;
      playerBase.players.get(nick).changeNick(newNick);
    },
    reSign(nick, newSign) {
      if (!playerBase.players.get(nick))
        return console.error(`${nick}: no such player`);
      playerBase.get(nick).changeSign(newSign);
    },
    changeColor(nick, newColor) {
      playerBase.get(nick).changeColor(newColor);
    },
  },
  setIdentifiers(args) {
    console.dir(args);
    const identifiers = [];
    for (const i of playerBase.players.values()) {
      identifiers.push([i.getNick(), i.getSign()]);
    }
    playerBase.identifiers = identifiers.reverse();
    pubSub.publish("playersLoaded", identifiers);
  },
};

const player = function (nick = "Cross", sign = "X", color = "red") {
  // let timesWon = 0;
  // let timesLose = 0;
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
    pubSub.publish("nickChanged");
  };
  const changeColor = function (newColor) {
    color = newColor;
    pubSub.publish("newColor", nick, color);
  };
  const getColor = function () {
    return color;
  };
  const changeSign = function (newSign) {
    if (playerBase.signs.has(newSign)) {
      return console.error(` ${newSign}: this sign is already taken`);
    }
    playerBase.signs.delete(sign);
    sign = newSign;
    playerBase.signs.add(sign);
    pubSub.publish("signChanged");
  };
  const getSign = function () {
    return sign;
  };
  playerBase.signs.add(sign);
  return {
    getNick,
    changeNick,
    getSign,
    changeSign,
    changeColor,
  };
};
playerBase.players.set("player-one", player());
playerBase.players.set("player-two", player("Circle", "O", (color = "green")));

playerBase.setCurrent = function (nickname) {
  playerBase.current = nickname;
};
playerBase.getCurent = function () {
  console.log("fired getCurrent");
  console.dir(playerBase.current);
  pubSub.publish("showWinner", playerBase.current);
};

const logics = {
  getPlayer(array) {
    console.dir(array);
    console.dir(typeof array);
    const currentPlayer = array.reverse()[0];
    const lastPlayer = array[1];
    const lastNickname = lastPlayer[0];
    const nickname = currentPlayer[0];
    const sign = currentPlayer[1];
    pubSub.publish("playerChanged", nickname);
    pubSub.publish("trackPlayer", lastNickname);
    pubSub.publish("newSign", sign);
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
    for (const subArray of array) {
      // const [value, sign] = logics.checkSigns(subArray);
      if (logics.checkSigns(subArray)) {
        return logics.checkSigns(subArray);
      }
    }
    return false;
  },

  checkDrawOption(array) {
    let signs = array.map((item) => item.textContent);
    signs = signs.filter((item) => item !== "");
    const uniques = new Set(signs);
    if (uniques.size > 1) return true;
    return false;
  },
  checkDraw(array) {
    const active = array.filter((item) => !item.disabled);
    if (active.length < 3) return alert("it's a draw!");
  },
  checkWin() {
    const [columnArray, rowArray] = logics.getGrid(domHandler.objects.buttons);
    const [diagonal1, diagonal2] = logics.getDiagonals(
      domHandler.objects.buttons
    );
    // console.dir({ diagonal1, diagonal2 });
    const rowMatch = logics.checkGrid(columnArray);
    const columnMatch = logics.checkGrid(rowArray);
    const diagonalMatch = logics.checkGrid([diagonal1, diagonal2]);
    for (const option of [rowMatch, columnMatch, diagonalMatch]) {
      if (!option) continue;
      // const drawOptions = [columnArray, rowArray, diagonal1, diagonal2];
      return pubSub.publish("gameOver");
    }
    return logics.checkDraw(domHandler.objects.buttons);
  },
  winStatus(nickname) {
    alert(`${nickname} won!`);
    pubSub.publish("reset");
  },
};
pubSub.subscribe("boardLoaded", playerBase.setIdentifiers);
pubSub.subscribe("playersLoaded", logics.getPlayer);
pubSub.subscribe("nickChanged", playerBase.setIdentifiers);
pubSub.subscribe("signChanged", playerBase.setIdentifiers);
pubSub.subscribe("trackPlayer", playerBase.setCurrent);
pubSub.subscribe("endOfTurn", logics.fetchPlayers);
pubSub.subscribe("endOfTurn", logics.checkWin);
pubSub.subscribe("playerChanged", domHandler.manipulation.renderNick);
pubSub.subscribe("newSign", domHandler.manipulation.signPlayer);
pubSub.subscribe("newTurn", logics.getPlayer);
pubSub.subscribe("gameOver", playerBase.getCurent);
pubSub.subscribe("showWinner", logics.winStatus);
pubSub.subscribe("reset", domHandler.manipulation.clearBoard);
pubSub.subscribe("reRender", domHandler.manipulation.init);
domHandler.manipulation.init();
