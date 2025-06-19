import './App.css';
import 'primereact/resources/themes/lara-light-blue/theme.css'; // or any other theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    // <QueueDisplay />
    // <TvDisplay />
    <AppRouter />
  );
}

export default App;
