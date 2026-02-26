// import configuraciones from "../config/config.js";

// export const URI = `mongodb+srv://${configuraciones.DB_CREDENTIALS_USER}:${configuraciones.DB_CREDENTIALS_PASSWORD}@cluster0.l0ndbxu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

import configuraciones from "../config/config.js";

const DB_NAME = configuraciones.DB_NAME_TEST || "test";

export const URI = `mongodb+srv://${configuraciones.DB_CREDENTIALS_USER}:${configuraciones.DB_CREDENTIALS_PASSWORD}` +
  `@cluster0.l0ndbxu.mongodb.net/${DB_NAME}` +
  `?retryWrites=true&w=majority&appName=Cluster0`;
