import logo from './logo.svg';
import './App.css';
import QueueDisplay from './pages/queue/QueueDisplay';
import TvDisplay from './pages/queue/TvDisplay';
import Login from './pages/auth/Login';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import AppRouter from './routes/AppRouter';

function App() {
  return (
    // <QueueDisplay />
    // <TvDisplay />
    <AppRouter />
  );
}

export default App;
