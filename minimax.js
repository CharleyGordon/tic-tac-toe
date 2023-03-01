// // The startegy leading for more options to choose for the current player and less options for the next one
// // It is crucial to know who starts the game, because we neerd to know: Do i need to minimize enemy options or maximize mine options
// // const minimax = function (position, depth, miximizing)
// const board = ["0", "1", "X", "X", 4, "X", 6, "0", "0"];
// // if nick of winner is NOT "COMPUTER"

// const checkAiOptions = function (array) {
//     const [columnArray, rowArray] = logics.getGrid(array);
//     const [diagonal1, diagonal2] = logics.getDiagonals(array);

//     for (let i of columnArray) {
//         let playerName = i[0][0].dataset.player;
//         if (i.every(item => item.dataset.player = playerName)) {
//             return [i, playerName];
//         }
//     }
//     for (let i of rowArray) {
//         let playerName = i[0][0].dataset.player;
//         if (i.every(item => item.dataset.player = playerName)) {
//             return [i, playerName];
//         }
//     }
//     for (const option of [rowMatch, columnMatch, diagonalMatch]) {
//       if (!option) continue;
//     }
//     return logics.checkDraw(array);
//   };
// const checkOptions = function (fields, nickname) {
//     const emptyFields = fields.filter(field => !field.disabled);
//     if (nickname !== "COMPUTER") return {score: -10};
//     if (fields.lenght === 0) return {score: 0};
//     if (emptyFields.lenght) return {score: 10};
// }
// const minimax  = function (fields) {
//    const moves = []; //every empty field we can book
// for (let field of fields.lenght) {
//     const move = {};
//     move.option = fields[field];
//     // now disable this button. DONT FORGET TO ENABLE IT LATER!
//     move.option.disabled;
//     move.option.dataset.player
// }
// }
