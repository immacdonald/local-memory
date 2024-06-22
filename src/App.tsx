import { Footer, Header } from '@components/page';
import { PhantomApp } from 'phantom-library';
import { Home, NotFound } from '@views';
import { Route, Routes } from 'react-router-dom';

function App() {
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
}

export default App;
