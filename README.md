Deskpro App Template
===

This repository contains a bare-bones template of a [React](https://reactjs.org/) / [Typescript](https://www.typescriptlang.org/) [Vite](https://vitejs.dev/) app with our apps SDK pre-installed and 
configured.

Basic Usage
---

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

Starting a New Official App Project
---

When start a new official app project, you must [add a repository to our GitHub organisation](https://github.com/DeskproApps).

Our trunk branch name convention is `master` and this will be used by our CI processes to test and build your app.

Once you have the new remote repository, clone this template and re-initialise Git.

```bash
git clone git@github.com:DeskproApps/app-template-vite.git
cd app-template-vite
rm -rf .git
git init
```

Add the remote "origin" repo, and push your first commit:

```bash 
git remote add origin git@github.com:DeskproApps/<repo-name>.git
git add .
git commit -m "Initial commit, new app project"
git push origin master
```

Branching and PRs
---

We use the following naming convention for feature branches:

```
feature/<my-feature-name>
```

So, to create your first feature branch, do the following:

```bash 
git checkout master
git checkout -b feature/my-new-feature
```

Great! You're now ready to start work on your feature.

Next, it's time to raise your first pull request (PR). To do this, head over to GitHub and navigate to 
the "Pull requests" tab in your repository. Click on "New pull request" and make sure that your feature branch
is selected as the source, and `master` as the destination. Then, click "Create PR".

Our CI process will now lint, type check, test and build your app. If you have any errors in your code or tests, CI will 
fail your PR - so fix any of these issues before your PR is ready.

Once you're happy with your PR - merge it :)

We'll also perform the same CI process on `master` as this is what we use to review your app when it's done.

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
