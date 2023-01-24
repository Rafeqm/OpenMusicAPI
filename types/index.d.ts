type DataSource<T> = {
  source: "database" | "cache";

  [key: string]: T | any;
};
