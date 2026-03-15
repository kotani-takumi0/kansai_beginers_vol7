import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/common/Layout";
import { PrefectureSelectPage } from "./pages/PrefectureSelectPage";
import { TopicGenerationPage } from "./pages/TopicGenerationPage";
import { MeishiPreviewPage } from "./pages/MeishiPreviewPage";
import { SharePage } from "./pages/SharePage";
import { ReceivePage } from "./pages/ReceivePage";
import { ScanPage } from "./pages/ScanPage";
import { ComparisonPage } from "./pages/ComparisonPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PrefectureSelectPage />} />
          <Route path="/topics" element={<TopicGenerationPage />} />
          <Route path="/preview" element={<MeishiPreviewPage />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
