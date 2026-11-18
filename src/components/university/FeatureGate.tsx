import { Outlet } from "react-router-dom";
import type { UniversityFeatureKey } from "../../types/university";
import { universityFeatureLabels } from "../../types/university";
import { useUniversity } from "./universityContextValue";

export default function FeatureGate({ feature }: { feature: UniversityFeatureKey }) {
  const { university, isFeatureEnabled } = useUniversity();
  if (isFeatureEnabled(feature)) return <Outlet />;

  return (
    <main className="careerState universityComingSoon">
      <span>COMING SOON</span>
      <h1>{universityFeatureLabels[feature]}は準備中です</h1>
      <p>{university?.name}向けのデータと機能を準備しています。</p>
    </main>
  );
}
