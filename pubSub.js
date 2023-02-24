export const pubSub = {
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
