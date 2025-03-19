import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./componenets/Chat";
import Support from "./componenets/Support";
import Home from "./componenets/Home";
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
