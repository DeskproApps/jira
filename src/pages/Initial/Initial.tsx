import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import { checkIsAuth } from '../../api/checkIsAuth';
import { CLOUD_ID_PATH, IS_USING_OAUTH2 } from '../../constants';
import { Settings } from '../../types';

export function Initial() {
    const { context } = useDeskproLatestAppContext<unknown, Settings>();
    const [hasContextLoaded, setHasContextLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!context) {
            return;
        };

        setHasContextLoaded(true);
    }, [context]);

    useInitialisedDeskproAppClient(async client => {
        if (!hasContextLoaded) {
            return;
        };

        const isUsingOAuth2 = context?.settings.use_api_key !== true;
        
        await client.setUserState(IS_USING_OAUTH2, isUsingOAuth2);

        if (!isUsingOAuth2) {
            setIsLoggedIn(true);
        } else {
            checkIsAuth({ client })
                .then(resources => {
                    if (!resources[0].id) {
                        throw new Error('error getting Jira Cloud ID');
                    };

                    client.setUserState(CLOUD_ID_PATH, resources[0].id);

                    setIsLoggedIn(true);
                })
                .catch(() => {
                    navigate('/log_in');
                });
        };
    }, [context, hasContextLoaded]);

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/home');
        };
    }, [isLoggedIn, navigate]);

    return <LoadingSpinner />
};