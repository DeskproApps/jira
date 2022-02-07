export const backlinkComment = (ticketId: string, url: string) => ({
    version: 1,
    type: "doc",
    content: [
        {
            type: "paragraph",
            content: [
                {
                    type: "text",
                    text: `Deskpro JIRA app linked Deskpro ticket #${ticketId} at `
                },
                {
                    type: "text",
                    text: url,
                    marks: [
                        {
                            type: "link",
                            attrs: {
                                href: url
                            }
                        }
                    ]
                },
                {
                    type: "text",
                    text: " with this issue"
                }
            ]
        }
    ]
});