import type { FC, ReactNode } from 'react';
import { Footer, Header } from '@components/page';

interface LayoutProps {
    title?: string;
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Header hasBackground inline />
            <main style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>{children}</main>
            <Footer />
        </>
    );
};

export { Layout };
