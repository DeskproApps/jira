import { IDeskproClient, proxyFetch } from '@deskpro/app-sdk';
import { OAUTH2_ACCESS_TOKEN_PATH } from '../constants';

type Resources = {
    id: string;
}[];

interface CheckIsAuth {
    client: IDeskproClient;
};

export async function checkIsAuth({ client }: CheckIsAuth) {
    const fetch = await proxyFetch(client);

    try {
        const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
            headers: {
                'Authorization': `Bearer [user[${OAUTH2_ACCESS_TOKEN_PATH}]]`
            }
        });

        if (!response.ok) {
            throw new Error('error checking authentication status');
        };

        const data = await response.json() as Resources;

        return data;
    } catch (error) {
        throw new Error('error checking authentication status');
    };
};