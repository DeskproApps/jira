Deskpro App Template
===

This repository contains a bare-bones template of a [React](https://reactjs.org/) / [Typescript](https://www.typescriptlang.org/) [Vite](https://vitejs.dev/) app with our apps SDK pre-installed and 
configured.

Basic Usage
---

Clone this repository and then re-initialise Git.

```bash
git clone git@github.com:DeskproApps/app-template-vite.git
cd app-template-vite
rm -rf .git
git init
```

We recommend using [Yarn](https://yarnpkg.com/) to manage this project. First, start by installing the project 
dependencies from inside the project directory `app-template-vite`.

```bash
yarn install
```

Then, run the development server.

```bash
yarn start
```

You should now be able to view the bare-bones app in your browser.

Testing
---

We've included `jest` to run your tests. It will look anywhere in `/src` for test suite files ending in `.test.tsx`.

You can run all tests using:

```bash
yarn test
```

We've also included a sample test suite in `src/App.test.tsx`

For more information about building your app, please refer to our [app development guide](https://support.deskpro.com/en/guides/developers/how-to-build-a-basic-notes-app).
