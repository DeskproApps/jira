import { testUrlRegex } from "../utils/utils";

export const backlinkCommentDoc = (ticketId: string, url: string) => ({
  version: 1,
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `Deskpro JIRA app linked Deskpro ticket #${ticketId} at `,
        },
        {
          type: "text",
          text: url,
          marks: [
            {
              type: "link",
              attrs: {
                href: url,
              },
            },
          ],
        },
        {
          type: "text",
          text: " with this issue",
        },
      ],
    },
  ],
});

export const removeBacklinkCommentDoc = (ticketId: string, url: string) => ({
  version: 1,
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `Deskpro JIRA app unlinked Deskpro ticket #${ticketId} at `,
        },
        {
          type: "text",
          text: url,
          marks: [
            {
              type: "link",
              attrs: {
                href: url,
              },
            },
          ],
        },
        {
          type: "text",
          text: " from this issue",
        },
      ],
    },
  ],
});

export const paragraphDoc = (text: string) => ({
  version: 1,
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: text.split(" ").map((word) => {
        if (word === "\n") return { type: "hardBreak" };

        if (testUrlRegex.test(word)) {
          return {
            type: "inlineCard",
            attrs: { url: `${word} ` },
          };
        }
        return {
          type: "text",
          text: word + " ",
        };
      }),
    },
  ],
});
