// app/mindmaps/page.jsx
import { Suspense } from "react";
import MindmapsPage from "../../components/MindMap/MindmapsPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Mindmap...</div>}>
      <MindmapsPage />
    </Suspense>
  );
}
