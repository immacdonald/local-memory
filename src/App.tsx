import { PhantomApp } from 'phantom-library';
import { Route, Routes } from 'react-router-dom';
import { Footer, Header } from '@components/page';
import { Home, NotFound } from '@views';

const App = () => {
    return (
        <PhantomApp anchors modals banners>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </PhantomApp>
    );
};

export { App };
