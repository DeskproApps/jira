import { useState } from 'react';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CopyToClipboardInput, LoadingSpinner, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { P1 } from '@deskpro/deskpro-ui';
import { SCOPE } from '../../constants';

const Description = styled(P1)`
    margin-top: 8px;
    color: ${({ theme }) => theme.colors.grey80};
`;

export function AdminCallback() {
    const [callbackURL, setCallbackURL] = useState<string | null>(null);

    useInitialisedDeskproAppClient(client => {
        client.startOauth2Local(
            ({ callbackUrl, state }) => {
                setCallbackURL(callbackUrl);

                return `https://auth.atlassian.com/authorize?${createSearchParams([
                    ['client_id', 'clientID'],
                    ['state', state],
                    ['audience', 'api.atlassian.com'],
                    ['scope', SCOPE],
                    ['prompt', 'consent'],
                    ['response_type', 'code'],
                    ['redirect_uri', callbackUrl]
                ])}`;
            },
            /^$/,
            async () => ({data: {access_token: ''}}),
            {
                pollInterval: 10000,
                timeout: 600
            }
        );
    }, []);

    if (!callbackURL) {
        return <LoadingSpinner />
    };

    return (
        <>
            <CopyToClipboardInput value={callbackURL || ''} />
            <Description>The callback URL will be required during Jira setup</Description>
        </>
    );
};