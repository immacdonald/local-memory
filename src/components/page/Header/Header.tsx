import { FC } from 'react';
import { Button, Column, DynamicHeaderProps, Row, SimpleDynamicHeader } from 'phantom-library';
import { Link } from 'react-router-dom';
import { LocalMemoryFullIcon, LocalMemoryIcon } from '@icons';
import style from './Header.module.scss';

interface HeaderProps extends DynamicHeaderProps { }

const Header: FC<HeaderProps> = ({ ...props }) => {
    return (
        <SimpleDynamicHeader {...props}>
            <div className={style.content}>
                <Row>
                    <Link to="/">
                        <LocalMemoryIcon size="large" />
                    </Link>
                        <Column align='start' gap='0'>
                            <LocalMemoryFullIcon cssProperties={{ width: "256px" }} />
                            <div className={style.newslab}>
                                <span>A </span>
                                <b>
                                    <Link to="https://newsresearch.lab.wm.edu" target="_blank">
                                        NEWS Lab
                                    </Link>
                                </b>
                                <span> Project</span>
                            </div>
                        </Column>
                </Row>
                <div className={style.navigation}>
                    <nav className={style.links}>
                        <Button link="/" visual="text">
                            Home
                        </Button>
                        <Button link="/about" visual="text">
                            About
                        </Button>
                    </nav>
                </div>
            </div>
        </SimpleDynamicHeader>
    );
};

export { Header };
