const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const sourceDataFromService = (
  { alradyGenerateContent, onComplete, options, logger },
  callback
) => {
  if (!alradyGenerateContent) {
    const keys = Object.keys(options);

    const apis = keys.map((key) => {
      const handdleThen = (response) => {
        if (response.ok) {
          return response.json().then((data) => {
            return {
              name: key,
              data,
            };
          });
        } else {
          throw {
            name: key,
            response,
          };
        }
      };

      if (typeof options[key] === "object") {
        return fetch(options[key].url, {
          url: undefined,
          ...options[key],
        }).then(handdleThen);
      } else {
        return fetch(options[key]).then(handdleThen);
      }
    });

    Promise.all(apis)
      .then((data) => {
        const mergeData = data.reduce((acc, item) => {
          return {
            ...acc,
            [item.name]: item.data,
          };
        }, {});

        fs.writeFile(
          path.resolve(__dirname, "./data.json"),
          JSON.stringify(mergeData),
          () => {
            callback();
          }
        );
      })
      .catch((error) => {
        const renderMessage = (message) => {
          logger.error(
            `key: ${error.name}\nurl: ${error.response.url}\nstatus: ${
              error.response.status
            }\nerror: ${
              message ? JSON.stringify(message) : error.response.statusText
            }`
          );
          process.exit(1);
        };

        error.response
          .json()
          .then((error) => {
            renderMessage(error);
          })
          .catch(() => {
            renderMessage();
          });
      });

    onComplete();
  } else {
    callback();
  }
};

class StaticSourceDataPlugin {
  constructor(options) {
    this.alradyGenerateContent = false;
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.watchRun.tapAsync(
      "StaticSourceDataPlugin",
      (compilation, callback) => {
        const logger = compilation.getLogger
          ? compilation.getLogger("StaticSourceDataPlugin")
          : console;

        logger.log("Sourcing data...");

        sourceDataFromService(
          {
            alradyGenerateContent: this.alradyGenerateContent,
            options: this.options,
            onComplete: () => {
              this.alradyGenerateContent = true;
            },
            logger,
          },
          callback
        );
      }
    );
    compiler.hooks.beforeCompile.tapAsync(
      "StaticSourceDataPlugin",
      (compilation, callback) => {
        const logger = compilation.getLogger
          ? compilation.getLogger("StaticSourceDataPlugin")
          : console;

        logger.log("Sourcing data...");

        sourceDataFromService(
          {
            alradyGenerateContent: this.alradyGenerateContent,
            options: this.options,
            onComplete: () => {
              this.alradyGenerateContent = true;
            },
            logger,
          },
          callback
        );
      }
    );
  }
}

module.exports = StaticSourceDataPlugin;
