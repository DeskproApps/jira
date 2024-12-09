export default {
  "summary": {
    "required": true,
    "schema": {
      "type": "string",
      "system": "summary"
    },
    "name": "Summary",
    "key": "summary",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "summary"
  },
  "customfield_10020": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "json",
      "custom": "com.pyxis.greenhopper.jira:gh-sprint",
      "customId": 10020
    },
    "name": "Sprint",
    "key": "customfield_10020",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10020",
    "type": "com.pyxis.greenhopper.jira:gh-sprint"
  },
  "customfield_10021": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "option",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes",
      "customId": 10021
    },
    "name": "Flagged",
    "key": "customfield_10021",
    "hasDefaultValue": false,
    "operations": [
      "add",
      "set",
      "remove"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10019",
        "value": "Impediment",
        "id": "10019"
      }
    ],
    "fieldId": "customfield_10021",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes"
  },
  "customfield_10037": {
    "required": true,
    "schema": {
      "type": "version",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:version",
      "customId": 10037
    },
    "name": "DP Version Picker (single version)",
    "key": "customfield_10037",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10000",
        "id": "10000",
        "description": "",
        "name": "DP Version 1",
        "archived": false,
        "released": false,
        "releaseDate": "2024-11-09"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10001",
        "id": "10001",
        "description": "",
        "name": "DP Version 2",
        "archived": false,
        "released": false,
        "releaseDate": "2024-11-16"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10002",
        "id": "10002",
        "description": "",
        "name": "DP Version 3",
        "archived": false,
        "released": false,
        "releaseDate": "2024-11-23"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10003",
        "id": "10003",
        "description": "",
        "name": "DP Version 4",
        "archived": false,
        "released": false,
        "releaseDate": "2024-12-31"
      }
    ],
    "fieldId": "customfield_10037",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:version"
  },
  "customfield_10038": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "version",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:multiversion",
      "customId": 10038
    },
    "name": "DP Version Picker (multiple versions)",
    "key": "customfield_10038",
    "hasDefaultValue": false,
    "operations": [
      "set",
      "add",
      "remove"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10000",
        "id": "10000",
        "description": "",
        "name": "DP Version 1",
        "archived": false,
        "released": false,
        "releaseDate": "2024-11-09"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10001",
        "id": "10001",
        "description": "",
        "name": "DP Version 2",
        "archived": false,
        "released": false,
        "releaseDate": "2024-11-16"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10002",
        "id": "10002",
        "description": "",
        "name": "DP Version 3",
        "archived": false,
        "released": false,
        "releaseDate": "2024-11-23"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/version/10003",
        "id": "10003",
        "description": "",
        "name": "DP Version 4",
        "archived": false,
        "released": false,
        "releaseDate": "2024-12-31"
      }
    ],
    "fieldId": "customfield_10038",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:multiversion"
  },
  "customfield_10044": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "option",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes",
      "customId": 10044
    },
    "name": "DP Checkboxes",
    "key": "customfield_10044",
    "hasDefaultValue": false,
    "operations": [
      "add",
      "set",
      "remove"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10020",
        "value": "one check",
        "id": "10020"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10021",
        "value": "two check",
        "id": "10021"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10022",
        "value": "three check",
        "id": "10022"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10023",
        "value": "four check",
        "id": "10023"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10024",
        "value": "five check",
        "id": "10024"
      }
    ],
    "fieldId": "customfield_10044",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes"
  },
  "customfield_10045": {
    "required": false,
    "schema": {
      "type": "date",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:datepicker",
      "customId": 10045
    },
    "name": "DP Date Picker",
    "key": "customfield_10045",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10045",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:datepicker"
  },
  "customfield_10046": {
    "required": false,
    "schema": {
      "type": "datetime",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:datetime",
      "customId": 10046
    },
    "name": "DP Date Time Picker",
    "key": "customfield_10046",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10046",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:datetime"
  },
  "customfield_10052": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "group",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:multigrouppicker",
      "customId": 10052
    },
    "name": "DP Group Picker (multiple groups)",
    "key": "customfield_10052",
    "hasDefaultValue": false,
    "operations": [
      "add",
      "set",
      "remove"
    ],
    "fieldId": "customfield_10052",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:multigrouppicker"
  },
  "customfield_10053": {
    "required": false,
    "schema": {
      "type": "group",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:grouppicker",
      "customId": 10053
    },
    "name": "DP Group Picker (single group)",
    "key": "customfield_10053",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10053",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:grouppicker"
  },
  "customfield_10054": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "string",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:labels",
      "customId": 10054
    },
    "name": "DP Labels",
    "key": "customfield_10054",
    "autoCompleteUrl": "https://deskpro-ltd.atlassian.net/rest/api/1.0/labels/suggest?customFieldId=10054&query=",
    "hasDefaultValue": false,
    "operations": [
      "add",
      "set",
      "remove"
    ],
    "fieldId": "customfield_10054",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:labels"
  },
  "customfield_10059": {
    "required": false,
    "schema": {
      "type": "number",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:float",
      "customId": 10059
    },
    "name": "DP Number Field",
    "key": "customfield_10059",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10059",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:float"
  },
  "customfield_10062": {
    "required": false,
    "schema": {
      "type": "string",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:textarea",
      "customId": 10062
    },
    "name": "DP Paragraph (supports rich text)",
    "key": "customfield_10062",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10062",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:textarea"
  },
  "customfield_10064": {
    "required": false,
    "schema": {
      "type": "project",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:project",
      "customId": 10064
    },
    "name": "DP Project Picker (single project)",
    "key": "customfield_10064",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/project/10001",
        "id": "10001",
        "key": "DPK",
        "name": "DP Kanban ",
        "projectTypeKey": "software",
        "simplified": true,
        "avatarUrls": {
          "48x48": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10411",
          "24x24": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10411?size=small",
          "16x16": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10411?size=xsmall",
          "32x32": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10411?size=medium"
        }
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/project/10000",
        "id": "10000",
        "key": "SCRUM",
        "name": "First project",
        "projectTypeKey": "software",
        "simplified": true,
        "avatarUrls": {
          "48x48": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10414",
          "24x24": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10414?size=small",
          "16x16": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10414?size=xsmall",
          "32x32": "https://deskpro-ltd.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10414?size=medium"
        }
      }
    ],
    "fieldId": "customfield_10064",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:project"
  },
  "customfield_10065": {
    "required": false,
    "schema": {
      "type": "option",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons",
      "customId": 10065
    },
    "name": "DP Radio Buttons",
    "key": "customfield_10065",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10025",
        "value": "radio one",
        "id": "10025"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10026",
        "value": "radio two",
        "id": "10026"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10027",
        "value": "radio three",
        "id": "10027"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10028",
        "value": "radio four",
        "id": "10028"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10029",
        "value": "radio five",
        "id": "10029"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10030",
        "value": "radio six",
        "id": "10030"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10031",
        "value": "radio seven",
        "id": "10031"
      }
    ],
    "fieldId": "customfield_10065",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons"
  },
  "customfield_10068": {
    "required": false,
    "schema": {
      "type": "option-with-child",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect",
      "customId": 10068
    },
    "name": "DP Select List (cascading)",
    "key": "customfield_10068",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10044",
        "value": "cascading 1",
        "id": "10044"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10045",
        "value": "cascading 2",
        "id": "10045"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10046",
        "value": "cascading 3",
        "id": "10046"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10047",
        "value": "cascading 4",
        "id": "10047"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10048",
        "value": "cascading 5",
        "id": "10048"
      }
    ],
    "fieldId": "customfield_10068",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect"
  },
  "customfield_10069": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "option",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:multiselect",
      "customId": 10069
    },
    "name": "DP Select List (multiple choices)",
    "key": "customfield_10069",
    "hasDefaultValue": false,
    "operations": [
      "add",
      "set",
      "remove"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10032",
        "value": "option 1",
        "id": "10032"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10033",
        "value": "option 2",
        "id": "10033"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10034",
        "value": "option 3",
        "id": "10034"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10035",
        "value": "option 4",
        "id": "10035"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10036",
        "value": "option 5",
        "id": "10036"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10037",
        "value": "option 6",
        "id": "10037"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10038",
        "value": "option 7",
        "id": "10038"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10039",
        "value": "option 8",
        "id": "10039"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10040",
        "value": "option 9",
        "id": "10040"
      }
    ],
    "fieldId": "customfield_10069",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:multiselect"
  },
  "customfield_10070": {
    "required": false,
    "schema": {
      "type": "option",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:select",
      "customId": 10070
    },
    "name": "DP Select List (single choice)",
    "key": "customfield_10070",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "allowedValues": [
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10041",
        "value": "single option 1",
        "id": "10041"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10042",
        "value": "single option 2",
        "id": "10042"
      },
      {
        "self": "https://deskpro-ltd.atlassian.net/rest/api/3/customFieldOption/10043",
        "value": "single option 3",
        "id": "10043"
      }
    ],
    "fieldId": "customfield_10070",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:select"
  },
  "customfield_10071": {
    "required": false,
    "schema": {
      "type": "string",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:textfield",
      "customId": 10071
    },
    "name": "DP Short text (plain text only)",
    "key": "customfield_10071",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10071",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:textfield"
  },
  "customfield_10073": {
    "required": false,
    "schema": {
      "type": "string",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield",
      "customId": 10073
    },
    "name": "DP Text Field (read only)",
    "key": "customfield_10073",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10073",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield"
  },
  "customfield_10076": {
    "required": false,
    "schema": {
      "type": "string",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:url",
      "customId": 10076
    },
    "name": "DP URL Field",
    "key": "customfield_10076",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10076",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:url"
  },
  "customfield_10077": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "user",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker",
      "customId": 10077
    },
    "name": "DP User Picker (multiple users)",
    "key": "customfield_10077",
    "autoCompleteUrl": "https://deskpro-ltd.atlassian.net/rest/api/1.0/users/picker?fieldName=customfield_10077&showAvatar=true&query=",
    "hasDefaultValue": false,
    "operations": [
      "add",
      "set",
      "remove"
    ],
    "fieldId": "customfield_10077",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker"
  },
  "customfield_10078": {
    "required": false,
    "schema": {
      "type": "user",
      "custom": "com.atlassian.jira.plugin.system.customfieldtypes:userpicker",
      "customId": 10078
    },
    "name": "DP User Picker (single user)",
    "key": "customfield_10078",
    "autoCompleteUrl": "https://deskpro-ltd.atlassian.net/rest/api/1.0/users/picker?fieldName=customfield_10078&fieldConfigId=10179&projectId=10000&showAvatar=true&query=",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "customfield_10078",
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:userpicker"
  },
  "description": {
    "required": false,
    "schema": {
      "type": "string",
      "system": "description"
    },
    "name": "Description",
    "key": "description",
    "hasDefaultValue": false,
    "operations": [
      "set"
    ],
    "fieldId": "description"
  },
  "labels": {
    "required": false,
    "schema": {
      "type": "array",
      "items": "string",
      "system": "labels"
    },
    "name": "Labels",
    "key": "labels",
    "autoCompleteUrl": "https://deskpro-ltd.atlassian.net/rest/api/1.0/labels/suggest?query=",
    "hasDefaultValue": false,
    "operations": [
      "add",
      "set",
      "remove"
    ],
    "fieldId": "labels"
  }
}
