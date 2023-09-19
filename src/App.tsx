import { Routes, Route } from "react-router-dom";
import { Main } from "./pages/Main";

const App = () => {
  return (
    <Routes>
      <Route index element={<Main />} />
    </Routes>
  );
}

export default App;
