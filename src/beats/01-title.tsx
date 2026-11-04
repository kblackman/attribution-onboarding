import type { Beat } from '../engine/types'
import { Reveal } from '../components/Reveal'
import { TagRow } from '../components/TagRow'
import { BeginRow } from '../components/BeginRow'
import { HeroBackdrop } from '../components/HeroBackdrop'
import { HorizonLine } from '../components/HorizonLine'
import { HeroSetupFlow } from '../visuals/HeroSetupFlow'

const beat: Beat = {
  slug: 'title',
  title: 'Diagnosing the problem, not the symptom',
  variant: 'hero',
  align: 'center',
  card: (
    <>
    <HeroBackdrop>
      <HeroSetupFlow />
    </HeroBackdrop>
    <div className="relative flex max-w-[max(1280px,calc(var(--u)*74))] flex-col items-center">
      <Reveal as="h1" className="m-0 text-hero font-extrabold">
        <span className="block text-balance">Diagnosing the problem,</span>
        <span className="block text-balance text-accent">not the symptom</span>
      </Reveal>
      {/* the Moments signature, introduced on the first screen so it reads as a motif later */}
      <HorizonLine show delay={0.35} width="min(40vw, max(520px, calc(var(--u) * 27)))" className="mt-[max(20px,calc(var(--u)*2.6))]" />
      <Reveal as="p" order={1} className="m-0 mt-[max(20px,calc(var(--u)*2.6))] max-w-[44ch] text-[length:max(17px,calc(var(--u)*1.6))] leading-[1.5] text-fg text-balance">
        How a few offhand moments on customer calls led to an onboarding framework at Freshpaint.
      </Reveal>
      <Reveal order={2} className="mt-[max(24px,calc(var(--u)*3))]">
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
