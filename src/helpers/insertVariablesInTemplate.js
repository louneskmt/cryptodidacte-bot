const insertVariablesInTemplate = (messageData, params) => {
  const clone = { ...messageData };

  for (const key in params) {
    const regex = new RegExp(`%{(${key.toString()})}`, 'gm');
    clone.text = clone.text.replace(regex, params[key]);
  }
  return clone;
};

module.exports = insertVariablesInTemplate;
