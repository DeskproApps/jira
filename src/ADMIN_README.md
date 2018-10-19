## Installation

1. Pre-requisites

    You will need to generate an openssl certificate to authenticate against your Jira server from the app. You skip this step if your system has openssl installed, otherwise keep on reading for instructions on how to install it
    
    1. Debian\Ubuntu Linux:
    
        ```
            sudo apt-get install openssl
        ```
    
    2. CentOS \ Redhat
    
        ```
            sudo yum -y install openssl
        ```         
    
    3. macOS
    
        ```
         brew install openssl
        ```
    
    4. Windows 
    
        There are many alternatives which provide the binaries required for Windows (see the  [official wiki](https://wiki.openssl.org/index.php/Binaries) ), but we recommend going to [https://slproweb.com/products/Win32OpenSSL.html](https://slproweb.com/products/Win32OpenSSL.html) and downloading the installer named `Win64 OpenSSL v1.0.2o` or the latest version if available. Run the installer and follow the instructions.
        
2. Generate public and private keys for secure communications with your JIRA server
    
    These two keys are required for authentication with your JIRA server. The private key will be stored by your Deskpro instance, while the public key remains on the Jira server.
    
    Open a terminal or a command prompt if on windows and type the following commands:
      
    1. Generate the private key
        
        ```
        openssl genrsa -out private.pem 2048
        ```
        
    2. Extract the public key
        
        ```
        openssl rsa -in private.pem -outform PEM -pubout -out public.pem
        ```    
3. Configure the app connection in JIRA

    1. Navigate to `Applications` page
     
        Log in to your JIRA instance, click the settings menu (small cog wheel next to your profile bage on the top right corner of the page) and choose `Applications`. You should arrive at a page that looks like this:
        
        ![Applications page](https://raw.githubusercontent.com/DeskproApps/jira/master/docs/install-guide/001-application-links.small.png)
        
    2. Configure an Application Link
    
        From the `Integrations` section choose `Application links` and fill the url of your Deskpro instance in the `Create new link` input box:
        
        ![Configure application links](https://raw.githubusercontent.com/DeskproApps/jira/master/docs/install-guide/002-configure-application-link.small.png))
        
        If you receive a warning the url being invalid although you enter it correctly, it's safe to click `Continue` and ignore it
        
        ![Ignore invalid url warning](https://raw.githubusercontent.com/DeskproApps/jira/master/docs/install-guide/003-skip-invalid-url.small.png))
    
    3. Link Applications
        
        Fill in the fields as shown in the image below and make sure you enable `Create incoming link` then click `Continue`
        
        ![Link applications](https://raw.githubusercontent.com/DeskproApps/jira/master/docs/install-guide/004-incoming-link.small.png))
        
    4. Fill in the incoming link details
        
        You'll have to **remember** the `Consumer Key` because you'll need it when installing the app in Deskpro. 
        Copy the contents of the `public.pem` file we generated at the beginning in the `Public Key` field.

4. Install the JIRA App in Deskpro

    1. Install the application
     
        Login to your Deskpro instance, then navigate to `Admin`, then click `Apps` from the `Apps` menu. Scroll down and choose `JIRA v2` then click `Install App`
        
        ![Install application](https://raw.githubusercontent.com/DeskproApps/jira/master/docs/install-guide/006-install-app.small.png))
        
    2. Configure the application
    
        - Fill the `Rsa private key` field with the contents of the `private.pem` file we generated in step 2
        - Fill the `Rsa public key` field with the contents of the `public.pem` file we generated in step 2        
        - Fill the `JIRA instance url` field with the url to the JIRA server we used in step 3, for example: `https://your-company.atlassian.net` if you are using the cloud version        
        - Fill the `JIRA Consumer Key` field with the value of the `Consumer Key` field you remember from step 3
        
        ![Install application](https://raw.githubusercontent.com/DeskproApps/jira/master/docs/install-guide/007-configure-app.small.png)
        
        Click `Update settings` and give your consent in the pop-up that appears to authorize the connection between the app and JIRA. 
        Congratulations! You can now link JIRA issues from inside Deskpro.          
    
 
