import { ContextData, ContextSettings } from '@/types/deskpro';
import { LoadingSpinner, useDeskproElements, useDeskproLatestAppContext } from '@deskpro/app-sdk';
import { Stack } from '@deskpro/deskpro-ui';
import { useNavigate } from 'react-router-dom';
import Callout from '@/components/Callout';
import useAuthentication from '@/hooks/useAuthentication';

export function Initial() {
    useDeskproElements(({ registerElement, clearElements, deRegisterElement }) => {
        clearElements()
        deRegisterElement("home")
        deRegisterElement("menu")
        deRegisterElement("edit")
        registerElement("refresh", { type: "refresh_button" })
    }, [])

    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
    const navigate = useNavigate();
    const isUsingOAuth = context?.settings.use_advanced_connect === false || context?.settings.use_api_key === false;
    const { isLoading, isAuthenticated } = useAuthentication({ isUsingOAuth })

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
                    The Jira API credentials provided during the app setup process are invalid or expired. Please contact your admin to verify your credentials and try again.
                </Callout>
            </Stack>
        )
    }

    navigate('/home')
    return <LoadingSpinner />
};