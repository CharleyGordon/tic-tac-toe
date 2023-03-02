const ticTacToe = (function () {
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
        } catch (err) {
          console.error(eventName);
          console.error(callbackFunction);
          console.log(err.message);
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
      player1: document.querySelector(".player-1"),
      player2: document.querySelector(".player-2"),
      gameBoardSettings: document.querySelector("#gameboard-settings"),
    },
    manipulation: {
      fillBoard() {
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
          button.dataset.relative;
          button.dataset.column = column++;
          button.dataset.row = row;
          board.appendChild(button);
          buttons.push(button);
        }
      },
      clearBoard() {
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
        domHandler.objects.gameBoardSettings.removeEventListener(
          "input",
          domHandler.manipulation.setGap
        );
      },
      setGap(event) {
        if (event.target.type !== "number") return;
        domHandler.objects.board.style.setProperty("--gap", event.target.value);
      },
      setColor: (color) => {
        domHandler.objects.board.dataset.color = color;
        domHandler.objects.board.style.setProperty("--player-color", color);
        domHandler.objects.playerIndicator.style.color = color;
      },

      ticTacToe(array) {
        let transition = 0.4;
        const spell = "Tic-Tac-Toe".split("-");
        for (let i in spell) {
          array[i].style.transition = `${transition}s`;
          transition += transition;
          array[i].setAttribute("data-spell", spell[i]);
        }
        return pubSub.publish("gameOver", transition * 400);
      },

      init() {
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
        domHandler.objects.userSettings.addEventListener(
          "submit",
          domHandler.events.setUsers
        );
        domHandler.objects.gameBoardSettings.addEventListener(
          "input",
          domHandler.manipulation.setGap
        );
        domHandler.objects.userSettings.querySelector("button").click();
      },
    },
    events: {
      bookBoard(event) {
        if (event.target.disabled || event.target.tagName !== "BUTTON") return;
        event.target.disabled = "true";
        event.target.textContent = event.target.dataset.sign =
          domHandler.objects.playroom.dataset.sign1;
        event.target.textContent = event.target.dataset.player =
          domHandler.objects.playroom.dataset.player1;
        event.target.style.backgroundColor =
          domHandler.objects.playroom.dataset.color1;
        event.target.style.color = "white";
        pubSub.publish("endOfTurn", domHandler.objects.buttons);
      },
      colorSet(event) {
        if (event.target.type !== "color") return;
        const colorValue = event.target.value;
        event.target
          .closest("fieldset")
          .style.setProperty("--player-color", colorValue);
      },
      gameStarted(event) {
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
          !event.target.matches('[title="settings"], [title="exit"]') ||
          event.target.matches(".reset")
        )
          return;
        domHandler.objects.settings.classList.toggle("redirected");
        domHandler.objects.settings
          .querySelector('[href$="#user-settings"]')
          .click();
      },
      renderUsers() {
        domHandler.objects.player1.textContent =
          domHandler.objects.playroom.dataset.player1;
        domHandler.objects.player1.style.color =
          domHandler.objects.playroom.dataset.color1;
        domHandler.objects.player2.textContent =
          domHandler.objects.playroom.dataset.player2;
        domHandler.objects.player2.style.color =
          domHandler.objects.playroom.dataset.color2;
      },
      setUsers(event) {
        event.preventDefault();
        pubSub.publish("reset");
        pubSub.publish("reRender");
        const data = new FormData(domHandler.objects.userSettings);
        const player1 = [
          (nick = data.get("nickname-1")),
          (color = data.get("color-1")),
          (sign = data.get("sign-1")),
        ];
        domHandler.objects.playroom.dataset.player1 = nick;
        domHandler.objects.playroom.dataset.color1 = color;
        domHandler.objects.playroom.dataset.sign1 = sign;
        pubSub.publish("setPlayer", player1);
        const player2 = [
          (nick = data.get("nickname-2")),
          (color = data.get("color-2")),
          (sign = data.get("sign-2")),
        ];
        pubSub.publish("setPlayer", player2);
        domHandler.objects.playroom.dataset.player2 = nick;
        domHandler.objects.playroom.dataset.color2 = color;
        domHandler.objects.playroom.dataset.sign2 = sign;
        pubSub.publish("renderUsers");
        pubSub.publish("syncOutput");
        pubSub.publish("aiMove", domHandler.objects.playroom.dataset.player1);
      },
      syncOutput() {
        domHandler.objects.board.style.setProperty(
          "--player-color",
          domHandler.objects.playroom.dataset.color1
        );
        domHandler.objects.playerIndicator.textContent =
          domHandler.objects.playroom.dataset.player1;
        domHandler.objects.playerIndicator.style.color =
          domHandler.objects.playroom.dataset.color1;
      },
      changePlayer() {
        [
          domHandler.objects.playroom.dataset.player1,
          domHandler.objects.playroom.dataset.player2,
        ] = [
          domHandler.objects.playroom.dataset.player2,
          domHandler.objects.playroom.dataset.player1,
        ];
        [
          domHandler.objects.playroom.dataset.color1,
          domHandler.objects.playroom.dataset.color2,
        ] = [
          domHandler.objects.playroom.dataset.color2,
          domHandler.objects.playroom.dataset.color1,
        ];
        [
          domHandler.objects.playroom.dataset.sign1,
          domHandler.objects.playroom.dataset.sign2,
        ] = [
          domHandler.objects.playroom.dataset.sign2,
          domHandler.objects.playroom.dataset.sign1,
        ];
        pubSub.publish("syncOutput");
        pubSub.publish("aiMove", domHandler.objects.playroom.dataset.player1);
      },
      showWinner(timeout) {
        setTimeout(function () {
          alert(`${domHandler.objects.playroom.dataset.player2} won!`);
          pubSub.publish("reset");
        }, timeout);
      },
    },
  };
  const playerBase = {
    players: new Map(),
    signs: new Set(),
    checks: {
      checkNick(nick) {
        if (!playerBase.players.get(nick)) return false;
        return true;
      },
      displayError(nick) {
        return console.error(`${nick}: no such player`);
      },
    },
    sets: {
      setPlayer(details) {
        const [nick, ...other] = details;
        playerBase.players.set(nick, player(details));
      },
    },
    reset() {
      playerBase.players = new Map();
      playerBase.signs = new Set();
    },
  };

  const player = function (nick = "Cross", sign = "X", color = "red") {
    const getNick = function () {
      return nick;
    };
    const changeNick = function (newNick) {
      if (playerBase.players.has(newNick) && nick !== newNick) return false;
      playerBase.players.delete(nick);
      nick = newNick;
      playerBase.players.set(nick, this);
      pubSub.publish("newSetting");
    };
    const changeColor = function (newColor) {
      color = newColor;
    };
    const getColor = function () {
      return color;
    };
    const changeSign = function (newSign) {
      if (playerBase.signs.has(newSign) && getSign() !== newSign) {
        alert(` ${newSign}: this sign is already taken`);
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
  const logics = {
    ai: {
      makeMove(nick) {
        if (nick !== "COMPUTER") return;
        let fields = domHandler.objects.buttons;
        fields = fields.filter((item) => !!!item.disabled);
        const amount = fields.filter((item) => !item.disabled).length - 1;
        const randomField = Math.floor(Math.random() * amount) + 1;
        const button = fields[randomField];
        return button.click();
      },
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
        columnArray.push(
          array.filter((item) => item.dataset.column === column)
        );
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
          pubSub.publish("ticTacToe", subArray);
          return subArray;
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
      if (active.length === 0) {
        alert("it's a draw!");
        return pubSub.publish("reset");
      }
      return pubSub.publish("changePlayer");
    },
    checkWin(array) {
      const [columnArray, rowArray] = logics.getGrid(array);
      const [diagonal1, diagonal2] = logics.getDiagonals(array);
      const rowMatch = logics.checkGrid(columnArray);
      const columnMatch = logics.checkGrid(rowArray);
      const diagonalMatch = logics.checkGrid([diagonal1, diagonal2]);
      for (const option of [rowMatch, columnMatch, diagonalMatch]) {
        if (!option) continue;
      }
      return logics.checkDraw(array);
    },
  };
  pubSub.subscribe("reset", domHandler.manipulation.clearBoard);
  pubSub.subscribe("reset", playerBase.reset);
  pubSub.subscribe("reRender", domHandler.manipulation.init);
  pubSub.subscribe("renderUsers", domHandler.events.renderUsers);

  // setting players
  pubSub.subscribe("setPlayer", playerBase.sets.setPlayer);

  // reversing players
  pubSub.subscribe("changePlayer", domHandler.events.changePlayer);

  // sync while showing players
  pubSub.subscribe("syncOutput", domHandler.events.syncOutput);

  // applying AI move
  pubSub.subscribe("aiMove", logics.ai.makeMove);

  // Win check
  pubSub.subscribe("endOfTurn", logics.checkWin);

  pubSub.subscribe("gameOver", domHandler.events.showWinner);
  // gemeOver is published inside ticTacToe function

  // spell TicTacToe;

  pubSub.subscribe("ticTacToe", domHandler.manipulation.ticTacToe);

  domHandler.manipulation.init();
})();
