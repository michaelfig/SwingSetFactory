import styled from 'styled-components';

export const FlexRow = styled.div`
    display: flex;
    flex-direction: row;
`;

export const FlexCol = styled.div`
    display: flex;
    flex-direction: column;
`;

export const FlexRowTall = styled(FlexRow)`
    height: 100%;
`;

export const FlexColWide = styled(FlexCol)`
    width: 100%;
`;