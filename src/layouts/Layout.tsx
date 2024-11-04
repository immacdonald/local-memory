import { FC, ReactNode } from 'react';
import { orUndefined, Page } from 'phantom-library';
import { Footer, Header } from '@components/page';

interface LayoutProps {
    title?: string;
    darkBackground?: boolean;
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ title, darkBackground = false, children }) => {
    return (
        <>
            <Header hasBackground inline dynamicSettings={{ enabled: true, scrollDistance: 1000, inline: false, hasBackground: true, pageSpace: 'pad' }} />
            <Page title={title ?? 'Local Memory Project'} style={{ backgroundColor: orUndefined(darkBackground, 'var(--color-background)') }}>
                {children}
            </Page>
            <Footer />
        </>
    );
};

export { Layout };
