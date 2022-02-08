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

We maintain a minimum level of code coverage, to check that your code meets this threshold, run the following:

```bash
yarn test:coverage
```

For more information about building your app, please refer to our [app development guide](https://support.deskpro.com/en/guides/developers/how-to-build-a-basic-notes-app).

Packaging
---

To package your app we've included a packaging script that will allow you to build the app package zip archive. Steps 
for building and packaging your app are as follows:

```bash
yarn build
yarn package
```

Or, as a shortcut, you can use:

```bash
yarn build:package
```

Once your app has been built and packaged, you should find your package artifact in `./build`. You can now upload this 
to Deskpro and try it out :)

Continuous Integration
---

We ship this template with GitHub action configurations for both PR and Branch builds. Our CI process will lint, type 
check, test and provide a coverage report. The trunk Git branch is `master`, and CI will look for this when checking 
out and comparing changes.
