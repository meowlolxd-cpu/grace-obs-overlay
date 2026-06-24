import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import ControlPage from './routes/ControlPage';
import OverlayPage from './routes/OverlayPage';
import HomePage from './routes/HomePage';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brand-950 text-slate-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId/control" element={<ControlPage />} />
            <Route path="/room/:roomId/overlay" element={<OverlayPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
