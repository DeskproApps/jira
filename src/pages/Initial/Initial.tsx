import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@deskpro/app-sdk';
import { Button } from '@deskpro/deskpro-ui';

export function Initial() {
     const [errorState, setErrorState] = useState<string | null>(null)

    useEffect(() => {
        if (errorState === "left") {
            throw new Error("Hello from Jira")
        }

        if (errorState === "right") {
            throw "HI from Jira"
        }
    }, [errorState])

    return (
        <>
            <Button
                text="Left Error"
                onClick={() => { setErrorState("left") }}
            />
            <Button
                text="Right Error"
                onClick={() => { setErrorState("right") }}
            />
            <LoadingSpinner />
        </>
    );
};