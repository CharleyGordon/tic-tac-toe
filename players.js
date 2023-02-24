export const playerBase = {
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
playerBase.setIdentifiers = function () {
  const identifiers = [];
  for (const i of playerBase.players.values()) {
    identifiers.push([i.getNick(), i.getSign()]);
  }
  playerBase.identifiers = identifiers;
  pubSub.publish("playersLoaded", identifiers);
};
// playerBase.setIdentifiers();
