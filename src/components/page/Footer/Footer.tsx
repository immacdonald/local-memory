import { FC } from 'react';
import { Column, Flex, SimpleFooter, StyledLink, Typography } from 'phantom-library';

const Footer: FC = () => {
    return (
        <SimpleFooter theme="dark">
            <Flex flex={{ base: 'row', xs: 'column' }} gap={{ base: '64px', xs: '8px' }} verticalAlign="start">
                <Column align="start">
                    <Typography.Text>
                        <b>About</b>
                    </Typography.Text>
                    <Typography.Text>
                        <i>The Local Memory Project is a service designed to help users discover local media in US communities as well as globally.</i>
                    </Typography.Text>
                </Column>
                <Column align="start">
                    <Typography.Text>
                        <b>Navigation</b>
                    </Typography.Text>
                    <StyledLink to="/" inherit>
                        Home
                    </StyledLink>
                    <StyledLink to="/about" inherit>
                        About
                    </StyledLink>
                    <StyledLink to="/world" inherit>
                        World
                    </StyledLink>
                </Column>
            </Flex>
            <Typography.Text>
                &copy; {new Date().getFullYear()}{' '}
                <StyledLink to="https://newsresearch.lab.wm.edu" inherit external>
                    Willam & Mary NEWS Lab
                </StyledLink>
            </Typography.Text>
        </SimpleFooter>
    );
};

export { Footer };
