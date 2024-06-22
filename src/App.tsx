import { PhantomApp } from '@imacdonald/phantom';
import { Route, Routes } from 'react-router-dom';
import { Footer } from './components/page/Footer';
import { Header } from './components/page/Header';
import Home from './views/Home';
import NotFound from './views/NotFound';

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
