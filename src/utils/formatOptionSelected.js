const formatOptionSelected = (value) =>
  typeof value === "string"
    ? value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    : "";

export default formatOptionSelected;
