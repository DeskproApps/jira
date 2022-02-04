import { FC } from "react";
import "./ErrorBlock.css";
import { useDeskproAppTheme } from "@deskpro/app-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";

export interface ErrorBlockProps {
  text: string;
}

export const ErrorBlock: FC<ErrorBlockProps> = ({ text }: ErrorBlockProps) => {
  const { theme } = useDeskproAppTheme();

  return (
    <div className="error-block" style={{ backgroundColor: theme.colors.red100 }}>
      <FontAwesomeIcon icon={faExclamation} style={{ marginRight: "6px" }} />
      {text}
    </div>
  );
};
