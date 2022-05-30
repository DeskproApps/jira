My App
===

TODO: Include a summary of app functionality and a screenshot

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

Starting a New App Project
---

When start a new official app project, you must [add a repository to our GitHub organisation](https://github.com/DeskproApps). If you don't have access 
to create this, please contact us.

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

