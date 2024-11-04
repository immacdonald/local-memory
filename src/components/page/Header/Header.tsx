import { FC } from 'react';
import { LocalMemoryFullIcon, LocalMemoryIcon } from '@icons';
import { Button, Column, DynamicHeader, DynamicHeaderProps, Row, StyledLink } from 'phantom-library';
import style from './Header.module.scss';

interface HeaderProps extends DynamicHeaderProps {}

const Header: FC<HeaderProps> = ({ ...props }) => {
    return (
        <DynamicHeader {...props}>
            <div className={style.content}>
                <Row>
                    <StyledLink to="/">
                        <LocalMemoryIcon size="large" />
                    </StyledLink>
                    <Column align="start">
                        <LocalMemoryFullIcon style={{ width: '256px' }} />
                        <div className={style.newslab}>
                            <span>A </span>
                            <b>
                                <StyledLink to="https://newsresearch.lab.wm.edu" external>
                                    NEWS Lab
                                </StyledLink>
                            </b>
                            <span> Project</span>
                        </div>
                    </Column>
                </Row>
                <div className={style.navigation}>
                    <nav className={style.links}>
                        <Button link="/" variant="text">
                            Home
                        </Button>
                        <Button link="/world" variant="text">
                            World
                        </Button>
                        <Button link="/about" variant="text">
                            About
                        </Button>
                    </nav>
                </div>
            </div>
        </DynamicHeader>
    );
};

export { Header };
