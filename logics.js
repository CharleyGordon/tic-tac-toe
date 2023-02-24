export const logics = {
  changeTurn(array) {
    const currentPlayer = array.reverse()[0];
    const nickname = currentPlayer[0];
    const sign = currentPlayer[1];
    pubSub.publish("playerChanged", nickname);
    return [nickname, sign];
  },
};
// pubSub.subscribe("playersLoaded", logics.changeTurn);
