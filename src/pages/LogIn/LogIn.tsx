import { useCallback, useRef, useState } from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { IOAuth2, Title, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { AnchorButton } from '@deskpro/deskpro-ui';
import { Container } from '../../components/Layout';
import { ErrorBlock } from '../../components/Error/ErrorBlock';
import { getAccessToken } from '../../api/getAccessToken';
import setAccessToken from '../../api/setAccessToken';
import { GLOBAL_CLIENT_ID, SCOPE } from '../../constants';
import { Settings } from '../../types';

export function LogIn() {
    const { context } = useDeskproLatestAppContext<unknown, Settings>();
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
    });

    useInitialisedDeskproAppClient(async client => {
        if (!context?.settings) {
            return;
        };

        if (context.settings.use_api_key === true) {
            return;
        };

        const clientID = context.settings.client_id;
        const mode = context?.settings.use_advanced_connect ? 'local' : 'global';

        if (mode === 'local' && typeof clientID !== 'string') {
            return;
        };

        const oauth2Response = mode === 'global' ? await client.startOauth2Global(GLOBAL_CLIENT_ID) : await client.startOauth2Local(
            ({ callbackUrl, state }) => {
                callbackURLRef.current = callbackUrl;

                return `https://auth.atlassian.com/authorize?${createSearchParams([
                    ['client_id', clientID ?? ''],
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
    }, [context]);

    useInitialisedDeskproAppClient(client => {
        if (!oAuth2Context) {
            return;
        };

        const startPolling = async () => {
            try {
                const pollResult = await oAuth2Context.poll();
    
                await setAccessToken({ client, token: pollResult.data.access_token });
    
                navigate('/');
            } catch (error) {
                setError(error instanceof Error ? error.message : 'error polling');
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
        <Container>
            <Title title='Log into Jira' />
            <AnchorButton
                text='Log In'
                target='_blank'
                href={authorisationURL ?? '#'}
                loading={!authorisationURL || isLoading}
                disabled={!authorisationURL || isLoading}
                onClick={onLogIn}
            />
            {error && <ErrorBlock text={error} />}
        </Container>
    );
};