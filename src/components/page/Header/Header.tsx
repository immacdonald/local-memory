import type { DynamicHeaderProps } from 'phantom-library';
import { useCallback, useMemo, useRef, useState, type FC } from 'react';
import { LocalMemoryFullIcon, LocalMemoryIcon } from '@icons';
import { Button, DynamicHeader, MenuIcon, orUndefined, Row, StyledLink, tokens, useOutsideClick, useResponsiveContext } from 'phantom-library';
import style from './Header.module.scss';

interface HeaderProps extends DynamicHeaderProps {}

const sidebarDebounce = 500;

const Header: FC<HeaderProps> = ({ ...props }) => {
    const { isMobile } = useResponsiveContext();

    const ref = useRef<HTMLDivElement>(null);
    const lastToggleTime = useRef<number>(0);
    const [sidebarActive, setSidebarActive] = useState<boolean>(false);

    const setSidebar = useCallback((state: boolean) => {
        const now = Date.now();
        if (now - lastToggleTime.current > sidebarDebounce) {
            setSidebarActive(state);
            lastToggleTime.current = now;
        }
    }, []);

    useOutsideClick(ref, () => {
        if (sidebarActive) {
            setSidebar(false);
        }
    });

    const pages = [
        { label: 'Home', link: '/' },
        { label: 'World', link: '/world' },
        { label: 'About', link: '/about' }
    ];

    const navContent = useMemo(
        () =>
            pages.map((page, index: number) => {
                return (
                    <StyledLink to={page.link} base={null} hover="subtle" key={index} onClick={() => setSidebar(false)}>
                        {page.label}
                    </StyledLink>
                );
            }),
        []
    );

    return (
        <DynamicHeader {...props}>
            <div className={style.content}>
                <Row align="start">
                    <StyledLink to="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <LocalMemoryIcon size="large" />
                        {!isMobile && <LocalMemoryFullIcon style={{ width: '256px', marginLeft: tokens.space.sm }} />}
                    </StyledLink>
                    <StyledLink to="https://newsresearch.lab.wm.edu" base={null} hover="subtle" external style={{ width: '160px', marginLeft: tokens.space.sm }}>
                        <small>A NEWS Lab Project</small>
                    </StyledLink>
                </Row>
                <div className={style.navigation}>
                    {isMobile ? (
                        <>
                            <Button Icon={MenuIcon} className={style.menuButton} onClick={() => setSidebar(!sidebarActive)} />
                            <div className={style.sidebar} data-active={orUndefined(sidebarActive, '')} ref={ref}>
                                {navContent}
                            </div>
                        </>
                    ) : (
                        <nav className={style.links}>{navContent}</nav>
                    )}
                </div>
            </div>
        </DynamicHeader>
    );
};

export { Header };
