import styled from "styled-components";

export const StyledLink = styled.a`
  all: unset;
  color: ${({ theme }) => theme.colors.cyan100};
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
  width:"100%";
`;
