import { ContextData, ContextSettings } from '@/types/deskpro';
import { LoadingSpinner, useDeskproElements, useDeskproLatestAppContext } from '@deskpro/app-sdk';
import { Stack } from '@deskpro/deskpro-ui';
import { useNavigate } from 'react-router-dom';
import Callout from '@/components/Callout';
import useAuthentication, { AuthFailure } from '@/hooks/useAuthentication';

const FAILURE_MESSAGE: Record<AuthFailure, string> = {
    credentials: "Jira rejected the credentials provided during the app setup process. Ask your admin to check the email address and API token, and that the token has not expired.",
    permissions: "Jira accepted the credentials but refused the request. Ask your admin to check that the account has access to Jira and to the relevant projects, and that a token created with scopes carries the ones this app needs.",
    site: "The Jira site named in the app's settings could not be found. Ask your admin to check the domain prefix.",
};

export function Initial() {
    useDeskproElements(({ registerElement, clearElements }) => {
        clearElements()
        registerElement("refresh", { type: "refresh_button" })
    }, [])

    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
    const navigate = useNavigate();
    const isUsingOAuth = context?.settings.use_advanced_connect === false || context?.settings.use_api_key === false;
    const { isLoading, isAuthenticated, failure } = useAuthentication({ isUsingOAuth, settings: context?.settings })

    if (isLoading) {
        return (<LoadingSpinner />)
    }

    if (!isAuthenticated) {
        if (isUsingOAuth) {
            navigate(`/log_in`);
            return (<LoadingSpinner />)
        }

        return (
            <Stack padding={12} style={{ width: "100%" }}>
                <Callout
                    style={{ width: "100%" }}
                    accent="red"
                >
                    {FAILURE_MESSAGE[failure ?? "credentials"]}
                </Callout>
            </Stack>
        )
    }

    navigate('/home')
    return <LoadingSpinner />
};
