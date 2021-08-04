const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

class HTTPResponseError extends Error {
  constructor(response, ...args) {
    super(...args);
    this.response = response;
  }
}

const sourceDataFromService = (
  { alradyGenerateContent, onComplete, options, logger },
  callback
) => {
  if (!alradyGenerateContent) {
    const keys = Object.keys(options);

    const apis = keys.map((key) => {
      const handleThen = (response) => {
        if (response.ok) {
          return response.json().then((data) => {
            return {
              name: key,
              data,
            };
          });
        } else {
          throw new HTTPResponseError(response);
        }
      };

      if (typeof options[key] === "object") {
        return fetch(options[key].url, {
          url: undefined,
          ...options[key],
        }).then(handleThen);
      } else {
        return fetch(options[key]).then(handleThen);
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
      .catch(async (error) => {
        let errorMessage;
        if (error instanceof HTTPResponseError) {
          errorMessage = await error.response.text();
        } else {
          errorMessage = error;
        }

        logger.error(`StaticSourceData Webpack Plugin Error: ${errorMessage}`);
        process.exit(1);
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
