import { Starfield } from '../components/Starfield';
import { Hero } from '../scenes/Hero';
import { GravityFlame } from '../scenes/GravityFlame';
import { Pillars } from '../scenes/Pillars';
import { Constellation } from '../scenes/Constellation';
import { RelevancePreview } from '../scenes/RelevancePreview';
import { ComparePreview } from '../scenes/ComparePreview';
import { ToolsPreview } from '../scenes/ToolsPreview';
import { MissionContext } from '../scenes/MissionContext';
import { FinalCta } from '../scenes/FinalCta';

export function Landing() {
  return (
    <>
      <Starfield />
      <main id="main" className="landing">
        <Hero />
        <GravityFlame />
        <Pillars />
        <Constellation />
        <RelevancePreview />
        <ComparePreview />
        <ToolsPreview />
        <MissionContext />
        <FinalCta />
      </main>
    </>
  );
}