<h1 align="center">Static Source Data</h1>
<p align="center">
  <em>framework-agnostic fetch data from API service at build time (without emit any new file) built with webpack</em>
</p>

## About Static Source Data

The goal of this module is we want to show data in page from API Servie (e.g. Landing Page, About us), we don't want to fetch data in run time (using `fetch` or `axios`) because that make user waiting for loading data. It's ok for often chagning data to use fetch at run time but for rarely changing data, it might be better in some case if we can fetch data at build time.

### Why don't we hardcode content?

We want to use data from API service because we might use CMS for non-technical person to update data (headless cms is good for this) and client fetch updated data via API service.

## Who's suiable for this module

- You want to show data which rarely updated in page (e.g. Landing Page, About us) and don't want to fetch at run time.
- You don't want to hardcode content in html because it takes time due to require collaboration of developer and non-technical person for updating content.
- You want to implement CMS or use headless CMS service for non-technical person update content. That ways, client need to fetch data via API servie somehow.
- You don't want to keep track content file in your workspace.


## Installation

```
    yarn add static-source-data // or npm install static-source-data
```

## Usage

We created webpack plugin for fetching data at build time and generate file which hidden from your workspace (it's located in this module's folder).

We also create function for retrieve data called `query(key)`. 

```js
const StaticSourceData = require("static-source-data");

module.exports = {
    plugins: [
        ...
        // 
        new StaticSourceData({
            landingPage: "https://demoservice.com/landing-page",
            aboutUs: {
                url: "https://demoservice.com/about-us",
                method: "POST",
                // we pass options to node-fetch module, so avilable options you can see in node-fetch documentation.
            }
        })
    ]
}
```

You can use `query(key)` to get data for showing in your App.

```js
import React from "react";
import query from "static-source-data/query";

function LandingPage() {
  // query function accept `key` parameter which it's propery name of options object which you provided in the plugin
  const data = query("landingPage");

  console.log(data);
  // data log here is API service response (in this case, query function provided parameter with "landingPage" so data will be response of API service at https://demoservice.com/landing-page )

  // For example,
  // {
  //   title: "Our good website"
  //   description: "Good website require good responsibility"
  // }
  //

  return (
    <div className="App">
      <header className="App-header">
        <h1>{data.title}</h1>
        <p>{data.description}</p>
      </header>
    </div>
  );
}

export default LandingPage;
    
```

## create-react-app

You can use [react-app-rewired](https://github.com/timarney/react-app-rewired) for modification of the webpack configuration.

```js
const StaticSourceData = require('static-source-data');

module.exports = (config, env) => {
    config.plugins = config.plugins.concat([
        new StaticSourceData({
            landingPage: "https://demoservice.com/landing-page",
            aboutUs: {
                url: "https://demoservice.com/about-us",
                method: "POST",
            }
        }),
    ]);

    return config;
};
```

