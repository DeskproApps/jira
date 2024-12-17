import styled from "styled-components";

const TableTd = styled.td``;

const TableTr = styled.tr``;

const TableBody = styled.tbody`
  ${TableTr}:hover {
    background-color: ${({ theme }) => theme.colors.grey10};
  }
`;

const TableHead = styled.thead``;

const TableBase = styled.table`
  width: 100%;
  height: 100%;

  // reset styles
  border-spacing: 0;
  border-collapse: collapse;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
`;

type TableType = typeof TableBase & {
  Head: typeof TableHead;
  Body: typeof TableBody;
  Row: typeof TableTr;
  Cell: typeof TableTd;
};

const Table: TableType = Object.assign(TableBase, {
  Head: TableHead,
  Body: TableBody,
  Row: TableTr,
  Cell: TableTd,
});

export { Table };
