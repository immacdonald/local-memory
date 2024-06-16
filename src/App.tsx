import { AnchorController, Banner, ModalController } from '@imacdonald/phantom';
import { Route, Routes } from 'react-router-dom';
import style from './App.module.scss';
import { Footer } from './components/page/Footer';
import { Header } from './components/page/Header';
import Home from './views/Home';
import NotFound from './views/NotFound';

function App() {
    return (
        <div className={style.app} id="app">
            <Banner />
            <>
                <ModalController />
                <AnchorController />
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
            </>
        </div>
    );
}

export default App;
