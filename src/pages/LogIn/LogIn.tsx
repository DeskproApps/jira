import { AnchorButton, H3, Stack } from '@deskpro/deskpro-ui';
import { CLOUD_ID_PATH, GLOBAL_CLIENT_ID, SCOPE } from '../../constants';
import { ContextData, ContextSettings } from '@/types/deskpro';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { ErrorBlock } from '../../components/Error/ErrorBlock';
import { getAccessibleSites } from '@/api/auth';
import { getAccessToken } from '../../api/getAccessToken';
import { IOAuth2, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { useCallback, useRef, useState } from 'react';
import setAccessToken from '../../api/setAccessToken';

export function LogIn() {
    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
    const navigate = useNavigate();
    const callbackURLRef = useRef('');
    const [oAuth2Context, setOAuth2Context] = useState<IOAuth2 | null>(null);
    const [authorisationURL, setAuthorisationURL] = useState('');
    const [isPolling, setIsPolling] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useDeskproElements(({ deRegisterElement }) => {
        deRegisterElement('addIssue');
        deRegisterElement('homeButton');
        deRegisterElement('menu');
    });

    const settings = context?.settings
    const mode = settings?.use_advanced_connect ? 'local' : 'global';
    const isUsingOAuth = settings?.use_advanced_connect === false || settings?.use_api_key === false;
    const clientId = settings?.client_id;

    useInitialisedDeskproAppClient(async client => {
        if (!settings) {
            return;
        };

        if (isUsingOAuth === false) {
            setError("Contact your admin to enable OAuth to access this page")
            return;
        };


        if (mode === 'local' && (typeof clientId !== 'string' || clientId.trim() === "")) {
            // Local mode requires a clientId.
            setError("No client id was provided while setting up the app, a client id is required when using advanced connect.")
            return;
        };

        const oauth2Response = mode === 'global' ? await client.startOauth2Global(GLOBAL_CLIENT_ID) : await client.startOauth2Local(
            ({ callbackUrl, state }) => {
                callbackURLRef.current = callbackUrl;

                return `https://auth.atlassian.com/authorize?${createSearchParams([
                    ['client_id', clientId ?? ''],
                    ['state', state],
                    ['audience', 'api.atlassian.com'],
                    ['scope', SCOPE],
                    ['prompt', 'consent'],
                    ['response_type', 'code'],
                    ['redirect_uri', callbackUrl]
                ])}`;
            },
            /code=(?<code>[^&]+)/,
            async code => {
                const data = await getAccessToken({
                    client,
                    code,
                    redirectURI: callbackURLRef.current
                });

                return { data };
            }
        );

        setAuthorisationURL(oauth2Response.authorizationUrl);
        setOAuth2Context(oauth2Response);
    }, [isUsingOAuth, mode, clientId]);

    useInitialisedDeskproAppClient(client => {
        if (!oAuth2Context) {
            return;
        };

        const startPolling = async () => {
            try {
                const pollResult = await oAuth2Context.poll();

                await setAccessToken({ client, token: pollResult.data.access_token });

                // Get the user's accessible sites and use the first available account to make 
                // requests to the Jira API.
                const accessibleSites = await getAccessibleSites(client)

                if (accessibleSites.length < 1) {
                    throw new Error("No Jira site for the authenticated user")
                }

                await client.setUserState(CLOUD_ID_PATH, accessibleSites[0].id);

                navigate('/');
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An unknown error occurred while authenticating.');
            } finally {
                setIsPolling(false);
                setIsLoading(false);
            };
        };

        if (isPolling) {
            startPolling();
        };
    }, [oAuth2Context, navigate, isPolling]);

    const onLogIn = useCallback(() => {
        setIsLoading(true);
        setIsPolling(true);
        window.open(authorisationURL, '_blank');
    }, [setIsLoading, authorisationURL]);

    return (
        <Stack vertical gap={6} padding={12}>
            <H3>Log into Jira</H3>
            <AnchorButton
                text='Log In'
                target='_blank'
                href={authorisationURL ?? '#'}
                loading={!authorisationURL || isLoading}
                disabled={!authorisationURL || isLoading}
                onClick={onLogIn}
            />
            {error && <ErrorBlock text={error} />}
        </Stack>
    );
};