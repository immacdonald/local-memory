import { FC, ReactNode } from 'react';
import { Page } from 'phantom-library';
import { Footer, Header } from '@components/page';

interface LayoutProps {
    title?: string;
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ title, children }) => {
    return (
        <>
            <Header hasBackground pageSpace="pad" />
            <Page title={title ?? 'Local Memory Project'}>{children}</Page>
            <Footer />
        </>
    );
};

export { Layout };
