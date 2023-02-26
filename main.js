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
    playroom: document.getElementById("playroom"),
    playroomNavigation: document.querySelector("#playroom nav"),
    board: document.querySelector(".board"),
    buttons: [],
    settings: document.getElementById("settings"),
    userSettings: document.getElementById("user-settings"),
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
      domHandler.objects.board.removeChild(
        domHandler.objects.playroomNavigation
      );
      domHandler.objects.board.innerHTML = "";
      domHandler.objects.board.appendChild(
        domHandler.objects.playroomNavigation
      );
      domHandler.objects.buttons = [];
      domHandler.objects.board.removeEventListener(
        "click",
        domHandler.events.bookBoard
      );
      domHandler.objects.playroom.removeEventListener(
        "click",
        domHandler.events.gameStarted
      );
      domHandler.objects.userSettings.removeEventListener(
        "change",
        domHandler.events.colorSet
      );
      document.body.removeEventListener("click", domHandler.events.redirect);
      pubSub.publish("reRender");
      domHandler.objects.userSettings.removeEventListener(
        "submit",
        domHandler.events.customizeUsers
      );
    },
    renderNick: (nickname) => {
      domHandler.objects.playerIndicator.textContent = `${nickname}`;
    },
    signPlayer: (sign) => {
      domHandler.objects.board.dataset.playerSign = sign;
    },
    setColor: (color) => {
      domHandler.objects.board.dataset.color = color;
      domHandler.objects.board.style.setProperty("--player-color", color);
      domHandler.objects.playerIndicator.style.color = color;
    },

    init: () => {
      domHandler.manipulation.fillBoard();
      domHandler.objects.board.addEventListener(
        "click",
        domHandler.events.bookBoard
      );
      domHandler.objects.playroom.addEventListener(
        "click",
        domHandler.events.gameStarted
      );
      domHandler.objects.userSettings.addEventListener(
        "change",
        domHandler.events.colorSet
      );
      document.body.addEventListener("click", domHandler.events.redirect);
      pubSub.publish("boardLoaded");
      domHandler.objects.userSettings.addEventListener(
        "submit",
        domHandler.events.customizeUsers
      );
    },
  },
  events: {
    bookBoard: (event) => {
      if (event.target.disabled || event.target.tagName !== "BUTTON") return;
      event.target.disabled = "true";
      event.target.textContent = domHandler.objects.board.dataset.playerSign;
      event.target.style.color = domHandler.objects.board.dataset.color;
      pubSub.publish("endOfTurn", domHandler.objects.buttons);
      //   now get player data and fill in here
    },
    colorSet: (event) => {
      if (event.target.type !== "color") return;
      const colorValue = event.target.value;
      console.trace(event.target.closest("fieldset"));
      event.target
        .closest("fieldset")
        .style.setProperty("--player-color", colorValue);
    },
    gameStarted: (event) => {
      event.preventDefault();
      if (!event.target.closest("nav")) return;
      let target = event.target;
      if (target.tagName === "LI") {
        target = target.querySelector("a");
      }
      if (target.classList.contains("reset")) pubSub.publish("reset");
    },
    redirect: (event) => {
      if (
        !event.target.matches('[href$="#settings"], [href$="#playroom"]') ||
        event.target.matches(".reset")
      )
        return;
      domHandler.objects.settings.classList.toggle("redirected");
      domHandler.objects.settings
        .querySelector('[href$="#user-settings"]')
        .click();
    },
    customizeUsers: (event) => {
      event.preventDefault();
      const data = new FormData(domHandler.objects.userSettings);
      const player1 = [
        data.get("nickname-1"),
        data.get("color-1"),
        data.get("sign-1"),
      ];
      console.dir(player1);
      pubSub.publish("setPlayer", player1);
      const player2 = [
        data.get("nickname-2"),
        data.get("color-2"),
        data.get("sign-2"),
      ];
      pubSub.publish("setPlayer", player2);
    },
  },
};
const playerBase = {
  players: new Map(),
  identifiers: [],
  signs: new Set(),
  current: "",
  checks: {
    checkNick(nick) {
      if (!playerBase.players.get(nick)) return false;
      return true;
    },
    displayError(nick) {
      return console.error(`${nick}: no such player`);
    },
  },
  customization: {
    // rename(nick, newNick) {
    //   if (!playerBase.players.has(nick)) return;
    //   playerBase.players.get(nick).changeNick(newNick);
    // },
    rename(nick, newNick, unknown = false) {
      if (!playerBase.players.has(nick) && !unknown) return;
      console.log("not yet");
      if (unknown) {
        nick = playerBase.identifiers[0][0];
      }
      console.dir(nick);
      playerBase.players.get(nick).changeNick(newNick);
      return newNick;
    },
    reSign(nick, newSign) {
      if (!playerBase.checks.checkNick(nick))
        return playerBase.checks.displayError(nick);
      playerBase.players.get(nick).changeSign(newSign);
    },
    changeColor(nick, newColor) {
      if (!playerBase.checks.checkNick(nick))
        return playerBase.checks.displayError(nick);
      playerBase.players.get(nick).changeColor(newColor);
      playerBase.setIdentifiers();
    },
  },
  setIdentifiers() {
    const identifiers = [];
    for (const i of playerBase.players.values()) {
      identifiers.push([i.getNick(), i.getSign(), i.getColor()]);
    }
    playerBase.identifiers = identifiers.reverse();

    pubSub.publish("playersLoaded", identifiers);
  },
  setPlayer(array) {
    console.dir(array);
    const [nick, color, sign] = array;
    const newNick = playerBase.customization.rename("", nick, true);
    playerBase.customization.changeColor(nick, color);
    playerBase.customization.reSign(newNick, sign);
  },
};

const player = function (nick = "Cross", sign = "X", color = "red") {
  const getNick = function () {
    return nick;
  };
  const changeNick = function (newNick) {
    if (playerBase.players.has(newNick)) return false;
    playerBase.players.delete(nick);
    nick = newNick;
    playerBase.players.set(nick, this);
    pubSub.publish("newSetting");
  };
  const changeColor = function (newColor) {
    color = newColor;
    console.log(`the color is now: ${color}`);
    console.log(`${nick}`);
  };
  const getColor = function () {
    return color;
  };
  const changeSign = function (newSign) {
    if (playerBase.signs.has(newSign) && getSign() !== newSign) {
      return console.error(` ${newSign}: this sign is already taken`);
    }
    playerBase.signs.delete(sign);
    sign = newSign;
    playerBase.signs.add(sign);
    pubSub.publish("newSetting");
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
    getColor,
    changeColor,
  };
};
playerBase.players.set("Cross", player());
playerBase.players.set("Circle", player("Circle", "O", (color = "green")));

playerBase.setCurrent = function (nickname) {
  playerBase.current = nickname;
};
playerBase.getCurrent = function () {
  console.log("fired getCurrent");
  console.dir(playerBase.current);
  pubSub.publish("showWinner", playerBase.current);
};

const logics = {
  getPlayer(array) {
    const currentPlayer = array.reverse()[0];
    const lastPlayer = array[1];
    const lastNickname = lastPlayer[0];
    const nickname = currentPlayer[0];
    const sign = currentPlayer[1];
    const color = currentPlayer[2];
    pubSub.publish("playerChanged", nickname);
    pubSub.publish("trackPlayer", lastNickname);
    pubSub.publish("newSign", sign);
    pubSub.publish("newColor", color);
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
    if (active.length < 3) {
      alert("it's a draw!");
      pubSub.publish("reset");
    }
  },
  checkWin(array) {
    const [columnArray, rowArray] = logics.getGrid(array);
    const [diagonal1, diagonal2] = logics.getDiagonals(array);
    const rowMatch = logics.checkGrid(columnArray);
    const columnMatch = logics.checkGrid(rowArray);
    const diagonalMatch = logics.checkGrid([diagonal1, diagonal2]);
    for (const option of [rowMatch, columnMatch, diagonalMatch]) {
      if (!option) continue;

      return pubSub.publish("gameOver");
    }
    return logics.checkDraw(array);
  },
  winStatus(nickname) {
    alert(`${nickname} won!`);
    pubSub.publish("reset");
  },
};
pubSub.subscribe("boardLoaded", playerBase.setIdentifiers);
pubSub.subscribe("playersLoaded", logics.getPlayer);
pubSub.subscribe("newColor", domHandler.manipulation.setColor);
pubSub.subscribe("newSetting", playerBase.setIdentifiers);
pubSub.subscribe("trackPlayer", playerBase.setCurrent);
pubSub.subscribe("setPlayer", playerBase.setPlayer);
pubSub.subscribe("endOfTurn", logics.fetchPlayers);
pubSub.subscribe("endOfTurn", logics.checkWin);
pubSub.subscribe("playerChanged", domHandler.manipulation.renderNick);
pubSub.subscribe("newSign", domHandler.manipulation.signPlayer);
pubSub.subscribe("newTurn", logics.getPlayer);
pubSub.subscribe("gameOver", playerBase.getCurrent);
pubSub.subscribe("showWinner", logics.winStatus);
pubSub.subscribe("reset", domHandler.manipulation.clearBoard);
pubSub.subscribe("reRender", domHandler.manipulation.init);
domHandler.manipulation.init();
