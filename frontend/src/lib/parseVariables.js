export const parseVariables = (text) => {
  const regex = /{{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*}}/g;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return [...new Set(matches)];
};

export const highlightVariables = (text) => {
  return text.replace(
    /{{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*}}/g,
    '<span class="text-blue-600 font-medium">{{$1}}</span>'
  );
};

export const getVariableCount = (text) => {
  return parseVariables(text).length;
};
