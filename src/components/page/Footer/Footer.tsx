import { FC } from 'react';
import { Link } from 'react-router-dom';
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
                        <i>The Local Memory Project is a service designed to help users discover local media in various US communities.</i>
                    </Typography.Text>
                </Column>
                <Column align="start">
                    <Typography.Text>
                        <b>Navigation</b>
                    </Typography.Text>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
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
