import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Column, Flex, SimpleFooter, Typography } from 'phantom-library';

const Footer: FC = () => {
    return (
        <SimpleFooter theme='dark'>
            <Flex flex={{ base: 'row', xs: 'column' }} gap={{ base: '64px', xs: '8px'}} verticalAlign='start'>
                <Column align='start' gap='0'>
                    <Typography.Text>
                        <b>About</b>
                    </Typography.Text>
                    <Typography.Text>
                        <i>The Local Memory Project is a service designed to help users discover local media in various US communities.</i>
                    </Typography.Text>
                </Column>
                <Column align='start' gap='0'>
                    <Typography.Text>
                        <b>Navigation</b>
                    </Typography.Text>
                    <Link to='/'>Home</Link>
                    <Link to='/about'>About</Link>
                </Column>
            </Flex>
            <Typography.Text styleLinks={false}>
                &copy; {new Date().getFullYear()}{' '}
                <Link to="https://newsresearch.lab.wm.edu" target="_blank">
                    Willam & Mary NEWS Lab
                </Link>
            </Typography.Text>
        </SimpleFooter>
    );
};

export { Footer };
