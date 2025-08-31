import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./page/LandingPage";
import Generator from "./page/Generator";

function App() {
  return (
    <div className="bg-black min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<Generator />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
