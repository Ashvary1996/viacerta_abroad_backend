import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./componenets/Chat";
import Support from "./componenets/Support";
function App() {
 
  return (
    <div className="App">
      Home page
      <br />
      <Router>
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
