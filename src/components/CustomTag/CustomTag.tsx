import { useDeskproAppTheme } from "@deskpro/app-sdk";
import { RoundedLabelTag } from "@deskpro/deskpro-ui";
import { makeFirstLetterUppercase } from "../../utils/utils";

type Props = {
  title: string | number | boolean;
};

export const CustomTag = ({ title }: Props) => {
  let color;
  title = makeFirstLetterUppercase(title.toString() as string);
  const { theme } = useDeskproAppTheme();

  switch (title) {
    case "2": {
      color = theme?.colors?.red100;

      title = "High";

      break;
    }

    case "false": {
      color = theme?.colors?.red100;

      title = "No";

      break;
    }

    case "true": {
      color = theme?.colors?.green100;

      title = "Yes";

      break;
    }

    case "1": {
      color = theme?.colors?.yellow100;

      title = "Medium";

      break;
    }

    case "0": {
      color = theme?.colors?.green100;

      title = "Low";

      break;
    }

    default:
      color = theme?.colors?.grey100;
  }

  return (
    <RoundedLabelTag
      label={title as string}
      backgroundColor={color}
      textColor="white"
    />
  );
};
