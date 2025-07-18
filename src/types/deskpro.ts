/**
 * User data specific to tickets
 */
type TicketUser = {
  id: string;
  email: string;
  emails: string[];
  firstName: string;
  lastName: string;
  displayName: string;
  language: string;
  locale: string;
  phoneNumbers: {
    id: string;
    ext: string;
    label: string;
    number: string;
    guessedType: string;
  }[];
  primaryOrgMember: {
    position: string;
    isManager: string;
    organization: {
      id: string;
      name: string;
    };
  } | undefined;
  orgMembers: {
    position: string;
    isManager: string;
    organization: {
      id: string;
      name: string;
    };
  }[];
  contacts: TicketUserContact[];
}

/**
 * Contact User data specific to tickets
 */
type TicketUserContact = {
  id: string;
  comment: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
} | {
  id: string;
  comment: string;
  number: string;
  type: string;
  code: string;
} | {
  id: string;
  comment: string;
  url: string;
} | {
  id: string;
  comment: string;
  type: string;
  username: string;
  profileUrl: string;
} | {
  id: string;
  comment: string;
  type: string;
  username: string;
} | undefined;

export interface TicketData {
  id: string;
  permalinkUrl: string;
  subject: string;
  status: string;
  creationSystem: string;
  emailAccountAddress: string;
  receivedEmailAccountAddress: string;
  primaryUser: TicketUser & {
    customFields: Record<string, unknown>;
  };
  followers: TicketUser[];
  organization: {
    id: string;
    name: string;
    customFields: Record<string, unknown>;
  };
  attachments: {
    id: string;
    filename: string;
    filesize: string;
    contentType: string;
    downloadUrl: string;
  }[];
  customFields: Record<string, unknown>;
  billingCharges: {
    id: string;
    amount: string;
    chargeTime: string;
    dateCreated: string;
    fields: Record<string, unknown>;
  }[];
  team?: {
    id: string;
    name: string;
  } | undefined;
  ref: string;
  labels: {
    id: string;
    name: string;
  }[];
  department?:
  | {
    id: string | undefined;
    name: string;
  }
  | undefined;
  urgency: string;
  agent: TicketUser;
  ccs: TicketUser[];
  createdAt: string | undefined;
  resolvedAt: string | undefined;
  archivedAt: string | undefined;
  lastAgentReplyAt: string | undefined;
  lastUserReplyAt: string | undefined;
  statusChangedAt: string | undefined;
}

export interface ContextData {
  ticket: TicketData
}

export type ContextSettings = {
  use_advanced_connect?: boolean;
  use_api_key?: boolean;
  domain?: string;
  username?: string;
  api_key?: string;
  verify_settings?: string;
  client_id?: string;
  default_comment_on_ticket_reply?: boolean;
  default_comment_on_ticket_note?: boolean;
  ticket_subject_as_issue_summary?: boolean;
  mapping?: string; // stringified Layout type
};