JIRA App Setup
===

To install the JIRA app you must first create an API key. Head over your JIRA cloud account, the URL will look something
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

* **Domain Prefix** - this is your company name found in your JIRA URL, e.g. this will be `mycompany` if your JIRA URL is `https://mycompany.atlassian.net`
* **API Key** - this is the key you created in the previous steps
* **Email/Username** - Your JIRA user's email address or username

To configure who can see and use the JIRA app, head to the "Permissions" tab and select those users and/or groups you'd like to have access.

When you're happy, click "Install".