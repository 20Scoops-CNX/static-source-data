import content from "./data.json";

const query = (key) => {
  if (content[key] === undefined) {
    throw `[StaticSourceData] ${key} key not found, please check configuration in plugin config`;
  }

  return content[key];
};

export default query;
