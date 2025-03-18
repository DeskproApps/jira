# JIRA App Setup

## Installation

To install JIRA, choose between OAuth2 or API Key. Find instructions for each below.

To configure who can see and use the JIRA app, head to the "Permissions" tab and select those users and/or groups you'd like to have access.

When you're happy, click "Install".

### OAuth2

Navigate to the Atlassian Developer Console (https://developer.atlassian.com/console/myapps), and click on "Create".

[![](/docs/assets/setup/jira-setup-09.png)](/docs/assets/setup/jira-setup-09.png)

In the dropdown, select "OAuth 2.0 Integration".

[![](/docs/assets/setup/jira-setup-10.png)](/docs/assets/setup/jira-setup-10.png)

Enter the app name you wish, then click "Create".

[![](/docs/assets/setup/jira-setup-11.png)](/docs/assets/setup/jira-setup-11.png)

Go to the "Authorization" tab and click "Add" to enable OAuth2 integration.

[![](/docs/assets/setup/jira-setup-12.png)](/docs/assets/setup/jira-setup-12.png)

Copy the "callback URL" from the settings tab of this app drawer, then paste it into the field and save the changes.

[![](/docs/assets/setup/jira-setup-13.png)](/docs/assets/setup/jira-setup-13.png)

Next, go to the "Permissions" tab and click the "Add" action for the Jira API. It should then change to "Configure", which you should click.

[![](/docs/assets/setup/jira-setup-14.png)](/docs/assets/setup/jira-setup-14.png)

For "Jira Platform REST API" under "Classic Scopes", click on "Edit Scopes" and enable these scopes:
- read:jira-user
- read:jira-work
- write:jira-work

[![](/docs/assets/setup/jira-setup-15.png)](/docs/assets/setup/jira-setup-15.png)

Finally, go to the "Settings" tab and copy your client ID and secret into a safe place. Paste these in the settings of the app drawer.

From this screen, enter the following details:

- **Domain Prefix** - this is your company name found in your JIRA URL, e.g. this will be `mycompany` if your JIRA URL is `https://mycompany.atlassian.net`
- **Email/Username** - Your JIRA user's email address or username
- **Client ID** - this is the ID you copied from the "Settings" tab in your Atlassian Developer Console
- **Client Secret** - this is the secret you copied from the "Settings" tab in your Atlassian Developer Console

[![](/docs/assets/setup/jira-setup-16.png)](/docs/assets/setup/jira-setup-16.png)

### API Key

Head over your JIRA cloud account, the URL will look something
like `https://<my_company>.atlassian.net/`.

Once you've logged in, navigate to the "Account Settings" section.

[![](/docs/assets/setup/jira-setup-01.png)](/docs/assets/setup/jira-setup-01.png)

Next, go to the "Security" page. Here you'll find the "API Token" section.

[![](/docs/assets/setup/jira-setup-02.png)](/docs/assets/setup/jira-setup-02.png)

Click on the link labelled "Create and manage API tokens"

[![](/docs/assets/setup/jira-setup-03.png)](/docs/assets/setup/jira-setup-03.png)

In the "API Tokens" section, click the "Create API token" button.

[![](/docs/assets/setup/jira-setup-04.png)](/docs/assets/setup/jira-setup-04.png)

Enter a label for the new API key (this can be anything you like). In the following example we've
labelled it "Deskpro JIRA App"

[![](/docs/assets/setup/jira-setup-05.png)](/docs/assets/setup/jira-setup-05.png)

After creating the API token, reveal it by clicking the "eye" icon. Copy the API key for a later step. It's **important that you keep your secret API token safe**.

[![](/docs/assets/setup/jira-setup-06.png)](/docs/assets/setup/jira-setup-06.png)

Ok, now head back to Deskpro and navigate to the "Settings" tab of the JIRA app.

[![](/docs/assets/setup/jira-setup-07.png)](/docs/assets/setup/jira-setup-07.png)

From this screen, enter the following details:

- **Domain Prefix** - this is your company name found in your JIRA URL, e.g. this will be `mycompany` if your JIRA URL is `https://mycompany.atlassian.net`
- **API Key** - this is the key you created in the previous steps
- **Email/Username** - Your JIRA user's email address or username

## Permissions

When you first view the JIRA app alongside a ticket, it's best to check that you have configured the correct permissions
in JIRA itself. To help you do this, we provide a utility that shows which permissions are necessary for the app to operate correctly.
Open the app alongside a ticket in Deskpro, and go to the home screen by clicking the "house" icon at the top of the app.

Next, click the context menu (it has three vertical dots) at the top right of the home screen, then click "View Permissions".

You should then see the following screen:

[![](/docs/assets/setup/jira-setup-08.png)](/docs/assets/setup/jira-setup-08.png)

This shows a list of JIRA permissions that you need to give to the user that owns the API key you generated during the app setup process.

The green ticks show that permissions are granted, and the red crosses indicate permissions that are required but aren't yet granted in JIRA.

If you see any red ticks, you must login to JIRA and follow their [permissions guide](https://support.atlassian.com/jira-work-management/docs/how-do-jira-permissions-work/) to grant the missing permissions.