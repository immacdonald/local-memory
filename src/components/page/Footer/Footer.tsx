import type { FC } from 'react';
import { Column, Flex, Row, StyledFooter, StyledLink, tokens, Typography } from 'phantom-library';

const Footer: FC = () => {
    return (
        <StyledFooter data-theme="dark">
            <Flex flex={{ base: 'row', xs: 'column' }} gap={{ base: '64px', xs: '8px' }} align="start" verticalAlign="start" block style={{ marginBottom: tokens.space.sm }}>
                <Column align="start" style={{ width: 'min(100%, 720px)' }}>
                    <Typography.Text>
                        <b>About</b>
                    </Typography.Text>
                    <Typography.Text>
                        <i>The Local Memory Project is a service designed to help users discover local media in US communities and across the world.</i>
                    </Typography.Text>
                </Column>
                <Column align="start">
                    <Typography.Text>
                        <b>Navigation</b>
                    </Typography.Text>
                    <Row align="space-between" gap={tokens.space.lg}>
                        <StyledLink to="/" base={null}>
                            Home
                        </StyledLink>
                        <StyledLink to="/world" base={null}>
                            World
                        </StyledLink>
                        <StyledLink to="/about" base={null}>
                            About
                        </StyledLink>
                    </Row>
                </Column>
            </Flex>
            <Typography.Text>
                &copy; {new Date().getFullYear()}{' '}
                <StyledLink to="https://newsresearch.lab.wm.edu" base={null} external>
                    Willam & Mary NEWS Lab
                </StyledLink>
            </Typography.Text>
        </StyledFooter>
    );
};

export { Footer };
