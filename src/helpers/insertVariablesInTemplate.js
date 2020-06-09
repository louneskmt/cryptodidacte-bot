const insertVariablesInTemplate = (messageData, params, text = false) => {
  const clone = { ...messageData };

  for (const key in params) {
    const regex = new RegExp(`%{(${key.toString()})}`, 'gm');
    clone.text = clone.text.replace(regex, params[key]);
  }

  if (text) return clone.text;
  return clone;
};

module.exports = insertVariablesInTemplate;
