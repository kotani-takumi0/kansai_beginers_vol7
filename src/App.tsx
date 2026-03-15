import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/common/Layout";
import { PrefectureSelectPage } from "./pages/PrefectureSelectPage";
import { TopicGenerationPage } from "./pages/TopicGenerationPage";
import { MeishiPreviewPage } from "./pages/MeishiPreviewPage";
import { ReceivePage } from "./pages/ReceivePage";
import { ScanPage } from "./pages/ScanPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PrefectureSelectPage />} />
          <Route path="/topics" element={<TopicGenerationPage />} />
          <Route path="/preview" element={<MeishiPreviewPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/scan" element={<ScanPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
