const insertVariablesInTemplate = (messageData, params) => {
  let clone;
  if (typeof messageData === 'object') clone = { ...messageData };
  else if (typeof messageData === 'string') clone = { text: messageData };

  for (const key in params) {
    const regex = new RegExp(`%{(${key.toString()})}`, 'gm');
    clone.text = clone.text.replace(regex, params[key]);
  }

  if (typeof messageData === 'string') return clone.text;
  return clone;
};

module.exports = insertVariablesInTemplate;
