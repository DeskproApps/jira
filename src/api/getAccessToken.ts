import { IDeskproClient, proxyFetch } from '@deskpro/app-sdk';

interface GetAccessToken {
    client: IDeskproClient;
    code: string;
    redirectURI: string;
};

export async function getAccessToken({ client, code, redirectURI }: GetAccessToken) {
    const fetch = await proxyFetch(client);

    try {
        const response = await fetch('https://auth.atlassian.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: '__client_id__',
                client_secret: '__client_secret__',
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectURI
            })
        });

        if (!response.ok) {
            throw new Error('error getting access token');
        };

        const data = await response.json();

        return {access_token: data.access_token};
    } catch (error) {
        throw new Error('error getting access token');
    };
};