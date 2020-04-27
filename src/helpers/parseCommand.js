module.exports = function (command) {
  const parsed = command.split(' ');
  return {
    command: parsed[0],
    args: parsed.slice(1),
  };
};
