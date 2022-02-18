import type { FC } from "react";
import type { IssueMeta } from "../../types";
import { FieldType } from "../../types";
import { useAdfToPlainText } from "../../hooks";
import { Pill, Stack, useDeskproAppTheme } from "@deskpro/app-sdk";
import {ExternalLink} from "../ExternalLink/ExternalLink";
import {useStore} from "../../context/StoreProvider/hooks";

interface MappedViewProps {
    meta: IssueMeta;
    value: any;
}

const NoValue = () => {
    const { theme } = useDeskproAppTheme();
    return (<span style={{ color: theme.colors.grey40 }}>None</span>);
};

export default {
    [FieldType.REQUEST_LANG]: ({ value }: MappedViewProps) => (value?.displayName
        ? <>{value?.displayName}</>
        : <NoValue />
    ),
    [FieldType.TEXT_PLAIN]: ({ value }: MappedViewProps) => (value
        ? <>{value}</>
        : <NoValue />
    ),
    [FieldType.TEXT_PARAGRAPH]: ({ value }: MappedViewProps) => {
        const sdfToPlainText = useAdfToPlainText();
        return (value
                ? <>{sdfToPlainText(value)}</>
                : <NoValue />
        );
    },
    [FieldType.DATE]: ({ value }: MappedViewProps) => (value
        ? <>{new Date(value).toLocaleDateString()}</>
        : <NoValue />
    ),
    [FieldType.DATETIME]: ({ value }: MappedViewProps) => (value
            ? <>{new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString()}</>
            : <NoValue />
    ),
    [FieldType.CHECKBOXES]: ({ value }: MappedViewProps) => {
        const { theme } = useDeskproAppTheme();

        const options = (value ?? []);

        if (!options.length) {
            return (<NoValue />);
        }

        return (
            <Stack gap={3}>
                {options.map((option: { value: string }, idx: number) => (
                    <Pill label={option.value} textColor={theme.colors.grey100} backgroundColor={theme.colors.grey10} key={idx} />
                ))}
            </Stack>
        );
    },
    [FieldType.LABELS]: ({ value }: MappedViewProps) => {
        const { theme } = useDeskproAppTheme();

        const labels = (value ?? []);

        if (!labels.length) {
            return (<NoValue />);
        }

        return (
            <Stack gap={3}>
                {labels.map((option: string, idx: number) => (
                    <Pill label={option} textColor={theme.colors.grey100} backgroundColor={theme.colors.grey10} key={idx} />
                ))}
            </Stack>
        );
    },
    [FieldType.NUMBER]: ({ value }: MappedViewProps) => (value
        ? <>{(value).toLocaleString()}</>
        : <NoValue />
    ),
    [FieldType.RADIO_BUTTONS]: ({ value }: MappedViewProps) => (value?.value
            ? <>{value?.value}</>
            : <NoValue />
    ),
    [FieldType.SELECT_MULTI]: ({ value }: MappedViewProps) => {
        const { theme } = useDeskproAppTheme();

        const options = (value ?? []);

        if (!options.length) {
            return (<NoValue />);
        }

        return (
            <Stack gap={3}>
                {options.map((option: { value: string }, idx: number) => (
                    <Pill label={option.value} textColor={theme.colors.grey100} backgroundColor={theme.colors.grey10} key={idx} />
                ))}
            </Stack>
        );
    },
    [FieldType.SELECT_SINGLE]: ({ value }: MappedViewProps) => (value?.value
            ? <>{value?.value}</>
            : <NoValue />
    ),
    [FieldType.URL]: ({ value }: MappedViewProps) => {
        const { theme } = useDeskproAppTheme();

        if (!value) {
            return (<NoValue />);
        }

        return (
            <>
                <a href={value} target="_blank" style={{ color: theme.colors.cyan100, textDecoration: "none" }}>{value}</a>
                <ExternalLink href={value} />
            </>
        );
    },
    [FieldType.USER_PICKER]: ({ value }: MappedViewProps) => {
        const [ state ] = useStore();
        const domain = state.context?.settings.domain as string;

        if (!value) {
            return (<NoValue />);
        }

        return (
            <div style={{ position: "relative" }}>
                <img src={value.avatarUrls["24x24"]} width={18} height={18} alt="" className="user-avatar" />
                <span className="user-name">{value.displayName}</span>
                <ExternalLink href={`https://${domain}.atlassian.net/jira/people/${value.accountId}`} />
            </div>
        );
    },
} as Record<string, FC<MappedViewProps>>;
