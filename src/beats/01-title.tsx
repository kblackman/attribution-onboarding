import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { TagRow } from '../components/TagRow'
import { BeginRow } from '../components/BeginRow'
import { HeroSetupCascade } from '../visuals/HeroSetupCascade'

const beat: Beat = {
  slug: 'title',
  title: 'Diagnosing the problem, not the symptom',
  variant: 'hero',
  align: 'center',
  card: (
    <>
    <HeroSetupCascade />
    <div className="relative flex max-w-[max(1280px,calc(var(--u-hero)*74))] flex-col items-center">
      <Reveal as="h1" className="m-0 text-hero font-extrabold">
        <span className="block text-balance">Diagnosing the problem,</span>
        <span className="block text-balance text-accent">not the symptom</span>
      </Reveal>
      <Reveal as="p" order={1} className="m-0 mt-[max(24px,calc(var(--u-hero)*3.2))] max-w-[44ch] text-[length:max(17px,calc(var(--u-hero)*1.6))] leading-[1.5] text-fg text-balance">
        How small observations made during customer calls turned into a platform-wide onboarding framework.
      </Reveal>
      <Reveal order={2} className="mt-[max(24px,calc(var(--u-hero)*3))]">
        <TagRow
          label="Skills"
          className="justify-center"
          fluid
          tags={['Root Cause Analysis', 'Codebase Investigation', 'Data-Informed Design', 'Rapid Prototyping', 'Cross-Functional Collaboration']}
        />
      </Reveal>
      <Reveal order={3}>
        <BeginRow center />
      </Reveal>
    </div>
    </>
  ),
}

export default beat
