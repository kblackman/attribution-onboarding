import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { HandCircle } from '../components/HandCircle'

/*
  The new Attribution setup flow, rebuilt from Kyle's Figma (file "Attribution": the onboarding flow section,
  the waiting room, and the full dashboard). Laid out in the frames' own 1440 x 900 pixel space and scaled
  as a whole by the walkthrough, so positions match the designs. Copy is the designs' own; customer data is
  mock. Colors are the fp-* tokens sampled from the frames.

  Anything the cursor moves to carries data-t="<target>"; the walkthrough measures it to place the cursor.
*/

export interface FlowUI {
  screen: 'setup' | 'waiting' | 'dashboard'
  /** Setup step, 1 to 4 (the progress indicator). */
  phase: 1 | 2 | 3 | 4
  drawer: boolean
  /** Text typed so far into the drawer's fields, and which one has focus. */
  name: string
  selector: string
  focus: 'name' | 'selector' | null
  /** Events created (0 or 1). */
  events: number
  low: boolean
  error: boolean
  /** The hand-drawn circle around "You can always set this up later". */
  later: boolean
  ai: boolean
  cursor: boolean
}

export const EVENT_NAME = 'Booked Appointment'
export const EVENT_SELECTOR = 'button[data-action="book"]'

const STEPS = ['Create an event', 'Define conversion events', 'Connect ad sources', 'Enable AI']
const fade = (reduced: boolean) => ({
  initial: { opacity: 0, y: reduced ? 0 : 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: reduced ? 0.15 : 0.35, ease: EASE_DECK },
})

export function FlowScreen({ ui, reduced }: { ui: FlowUI; reduced: boolean }) {
  return (
    <div className="relative flex h-[900px] w-[1440px] overflow-hidden bg-fp-bg text-fp-ink" style={{ fontSize: 14 }}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-[64px] flex-none border-b border-fp-line bg-white" />
        <div className="relative flex-1">
          {ui.screen === 'setup' && (
            <div className="mx-auto w-[700px] pt-[66px]">
              <p className="m-0 text-[12px] font-bold tracking-[0.06em] text-fp-indigo-soft">SETUP GUIDE</p>
              <h3 className="m-0 mt-[4px] text-[33px] font-semibold tracking-[-0.01em]">Getting started with Attribution</h3>
              <Progress phase={ui.phase} reduced={reduced} />
              <motion.div key={`${ui.phase}-${ui.events}`} {...fade(reduced)}>
                <SetupStep ui={ui} reduced={reduced} />
              </motion.div>
            </div>
          )}
          {ui.screen === 'waiting' && (
            <motion.div key="waiting" {...fade(reduced)}>
              <WaitingRoom reduced={reduced} />
            </motion.div>
          )}
          {ui.screen === 'dashboard' && (
            <motion.div key="dashboard" {...fade(reduced)}>
              <Dashboard />
            </motion.div>
          )}
        </div>
      </div>
      <Drawer ui={ui} reduced={reduced} />
    </div>
  )
}

/* ---------- chrome ---------- */

const NAV: { label: string; icon: IconName; badge?: boolean; chevron?: boolean }[] = [
  { label: 'Freshpaint AI', icon: 'spark', badge: true },
  { label: 'Sources', icon: 'sliders' },
  { label: 'Events', icon: 'route', chevron: true },
  { label: 'Destinations', icon: 'grid', chevron: true },
]
const INSIGHTS = ['Attribution', 'Web Analytics', 'Funnels', 'Heatmaps', 'Session Replay', 'Surveys']
const NAV_AFTER: { label: string; icon: IconName }[] = [
  { label: 'Audiences', icon: 'users' },
  { label: 'Consent', icon: 'check' },
  { label: 'Short Links', icon: 'link' },
  { label: 'Internal Tools', icon: 'wrench' },
]

function Sidebar() {
  return (
    <div className="flex h-full w-[240px] flex-none flex-col bg-fp-nav text-white">
      <div className="flex h-[64px] items-center gap-[12px] px-[24px]">
        <Logo />
        <span className="text-[21px] font-bold tracking-[-0.01em]">Freshpaint</span>
        <span className="ml-auto block h-[16px] w-[16px] rounded-[3px] border-[1.5px] border-white/70" />
      </div>
      <div className="mx-[12px] flex items-center gap-[12px] rounded-[8px] border border-white/15 px-[14px] py-[14px]">
        <Icon name="layers" />
        <span className="flex flex-col">
          <span className="text-[12px] text-white/70">Main</span>
          <span className="text-[14px] font-bold">Production</span>
        </span>
        <Icon name="chevronRight" className="ml-auto" />
      </div>
      <div className="mt-[16px] border-t border-white/10 pt-[10px]">
        {NAV.map((n) => (
          <NavRow key={n.label} {...n} />
        ))}
        <div className="mx-[12px] rounded-[8px] bg-white/[0.04] pb-[8px]">
          <NavRow label="Insights" icon="chart" chevron up flush />
          {INSIGHTS.map((label, i) => (
            <div key={label} className={`ml-[32px] mr-0 flex h-[40px] items-center rounded-l-[6px] pl-[12px] pr-[16px] text-[12.5px] ${i === 0 ? 'bg-fp-nav-active text-white' : 'text-white/85'}`}>
              {label}
              {i > 0 && <NewBadge />}
            </div>
          ))}
        </div>
        {NAV_AFTER.map((n) => (
          <NavRow key={n.label} {...n} chevron />
        ))}
      </div>
    </div>
  )
}

function NavRow({ label, icon, badge, chevron, up, flush }: { label: string; icon: IconName; badge?: boolean; chevron?: boolean; up?: boolean; flush?: boolean }) {
  return (
    <div className={`flex h-[52px] items-center gap-[12px] ${flush ? 'px-[12px]' : 'px-[24px]'} text-[14px] font-bold`}>
      <Icon name={icon} />
      {label}
      {badge && <NewBadge />}
      {chevron && <Icon name={up ? 'chevronUp' : 'chevronDown'} className="ml-auto" />}
    </div>
  )
}

const NewBadge = () => <span className="ml-auto rounded-[4px] bg-fp-new px-[7px] py-[2px] text-[11px] font-semibold text-fp-new-ink">New</span>

/** The Freshpaint mark, drawn from simple blocks in its two brand colors. */
function Logo() {
  return (
    <svg width="24" height="30" viewBox="0 0 24 30" aria-hidden="true">
      <rect x="0" y="0" width="24" height="6" className="fill-fp-logo" />
      <rect x="0" y="9" width="16" height="6" className="fill-fp-logo" />
      <rect x="0" y="9" width="6" height="12" className="fill-fp-logo" />
      <rect x="0" y="23" width="7" height="7" className="fill-fp-mint" />
      <rect x="9" y="16" width="7" height="5" className="fill-fp-mint" />
    </svg>
  )
}

function Progress({ phase, reduced }: { phase: number; reduced: boolean }) {
  return (
    <div className="mt-[40px]">
      <div className="relative h-[6px] overflow-hidden rounded-full bg-fp-track">
        <motion.div
          className="absolute inset-0 origin-left rounded-full bg-fp-indigo-soft"
          initial={false}
          animate={{ scaleX: phase / 4 }}
          transition={{ duration: reduced ? 0 : 0.6, ease: EASE_DECK }}
        />
      </div>
      <div className="mt-[14px] grid grid-cols-4 text-[12.5px]">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = n < phase
          const now = n === phase
          return (
            <span key={label} className={`flex items-center gap-[8px] ${i === 0 ? 'pl-[28px]' : i === 3 ? 'justify-center' : ''} ${done || now ? 'font-semibold text-fp-ink' : 'text-fp-muted'}`}>
              {done && (
                <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-fp-green text-white">
                  <Icon name="tick" size={11} />
                </span>
              )}
              {now && <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-fp-indigo-soft text-[10px] font-bold text-white">{n}</span>}
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- setup steps ---------- */

function SetupCard({ n, title, optional, children, body }: { n: number; title: string; optional?: boolean; body: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-[40px] rounded-[12px] border border-fp-line bg-white px-[40px] pb-[40px] pt-[42px]">
      <p className="m-0 text-[18px] font-semibold">
        <span className="mr-[6px]">{n}.</span>
        {title}
        {optional && <span className="ml-[5px] text-[12px] font-normal text-fp-muted">(Optional)</span>}
      </p>
      <p className="m-0 mt-[14px] max-w-[460px] text-[14px] leading-[1.45] text-fp-body">{body}</p>
      <div className="mt-[40px] flex flex-col gap-[6px]">{children}</div>
    </div>
  )
}

function Buttons({ back = true, label = 'Continue', enabled = true, arrow = true }: { back?: boolean; label?: string; enabled?: boolean; arrow?: boolean }) {
  return (
    <div className="mt-[40px] flex items-center justify-between">
      {back ? <span className="rounded-[6px] border border-fp-line bg-white px-[19px] py-[11px] text-[16px] font-medium">Back</span> : <span />}
      <span data-t="continue" className={`flex items-center gap-[8px] rounded-[6px] px-[20px] py-[11px] text-[16px] font-semibold text-white transition-colors duration-300 ${enabled ? 'bg-fp-indigo' : 'bg-fp-indigo-off'}`}>
        {label}
        {arrow && <Icon name="arrowRight" size={16} />}
      </span>
    </div>
  )
}

function SetupStep({ ui, reduced }: { ui: FlowUI; reduced: boolean }) {
  if (ui.phase === 1)
    return (
      <>
        <SetupCard n={1} title="Create an event" body="Add at least one event you want to track. You can add more than one, but one is enough to continue.">
          {ui.events > 0 && (
            <motion.div {...fade(reduced)}>
              <EventRow />
            </motion.div>
          )}
          <div className={`grid place-items-center rounded-[8px] border border-dashed border-fp-indigo-off/60 bg-fp-indigo-tint ${ui.events > 0 ? 'mt-[6px] h-[72px]' : 'h-[120px]'}`}>
            <span data-t="create" className="flex items-center gap-[8px] rounded-[6px] border border-fp-line bg-white px-[16px] py-[9px] text-[14px] font-medium">
              <Icon name="plus" size={14} />
              Create Event
            </span>
          </div>
        </SetupCard>
        {ui.events > 0 && <Buttons back={false} />}
      </>
    )
  if (ui.phase === 2)
    return (
      <>
        <SetupCard n={2} title="Define conversion events" body="Designate events as mid or low funnel. Only one low-funnel event is required to continue">
          <EventRow>
            <span className="flex overflow-hidden rounded-[6px] border border-fp-line text-[12.5px] font-medium">
              <span className="px-[16px] py-[8px]">Mid funnel</span>
              <span data-t="low" className={`border-l border-fp-line px-[16px] py-[8px] transition-colors duration-300 ${ui.low ? 'bg-fp-indigo text-white' : ''}`}>
                Low funnel
              </span>
            </span>
          </EventRow>
          <motion.div
            className="mx-auto mt-[22px] flex items-center gap-[10px] rounded-[6px] border border-fp-red-line bg-fp-red-tint px-[16px] py-[9px] text-[12.5px] text-fp-red"
            initial={false}
            animate={{ opacity: ui.error ? 1 : 0, y: ui.error || reduced ? 0 : -4 }}
            transition={{ duration: reduced ? 0.15 : 0.3 }}
          >
            <Icon name="warn" size={16} />
            At least one event must be marked Low Funnel to continue.
          </motion.div>
        </SetupCard>
        <Buttons enabled={ui.low} />
      </>
    )
  if (ui.phase === 3)
    return (
      <>
        <SetupCard
          n={3}
          title="Connect ad sources"
          optional
          body={
            <>
              Link the platforms you advertise on so Attribution can match spend and CPA to your conversions.{' '}
              <span data-t="later" className="relative whitespace-nowrap">
                You can always set this up later
                <span className="pointer-events-none absolute -inset-x-[16px] -inset-y-[12px]">
                  <HandCircle show={ui.later} reducedMotion={reduced} duration={0.7} variant={1} className="inset-0 h-full w-full" />
                </span>
              </span>
            </>
          }
        >
          {['Google Ads', 'Meta Ads', 'Bing Ads'].map((s) => (
            <Row key={s} lead={<SourceMark name={s} />} label={s}>
              <span className="flex items-center gap-[6px] rounded-[6px] border border-fp-line px-[12px] py-[8px] text-[12.5px] font-medium">
                <Icon name="plug" size={13} />
                Connect
              </span>
            </Row>
          ))}
        </SetupCard>
        <Buttons />
      </>
    )
  return (
    <>
      <SetupCard n={4} title="Enable AI recommendations" optional body="Freshpaint analyzes your conversion events and ad performance to surface recommendation cards. You can turn this on anytime.">
        <Row
          tinted={ui.ai}
          lead={
            <span className="grid h-[32px] w-[32px] place-items-center rounded-[6px] border border-fp-line bg-white text-fp-ai">
              <Icon name="spark" size={16} />
            </span>
          }
          label="AI recommendations"
        >
          <span data-t="toggle" className={`relative block h-[16px] w-[36px] rounded-full transition-colors duration-300 ${ui.ai ? 'bg-fp-indigo-off' : 'bg-fp-track'}`}>
            <motion.span
              className={`absolute top-1/2 block h-[20px] w-[20px] -translate-y-1/2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${ui.ai ? 'bg-fp-indigo' : 'bg-white'}`}
              initial={false}
              animate={{ x: ui.ai ? 18 : -2 }}
              transition={{ duration: reduced ? 0 : 0.25, ease: EASE_DECK }}
            />
          </span>
        </Row>
      </SetupCard>
      <Buttons label={ui.ai ? 'Finish & go to Attribution' : 'Continue'} arrow={!ui.ai} />
    </>
  )
}

function Row({ lead, label, children, tinted = false }: { lead: ReactNode; label: string; children: ReactNode; tinted?: boolean }) {
  return (
    <div className={`flex h-[66px] items-center gap-[12px] rounded-[8px] border border-fp-line px-[15px] transition-colors duration-300 ${tinted ? 'bg-fp-indigo-tint' : 'bg-white'}`}>
      {lead}
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="ml-auto">{children}</span>
    </div>
  )
}

function EventRow({ children }: { children?: ReactNode }) {
  return (
    <Row lead={<Avatar letter="B" />} label={EVENT_NAME}>
      {children}
    </Row>
  )
}

const Avatar = ({ letter, dark = false, size = 32 }: { letter: string; dark?: boolean; size?: number }) => (
  <span className={`grid flex-none place-items-center rounded-full font-semibold text-white ${dark ? 'bg-fp-teal' : 'bg-fp-mint'}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
    {letter}
  </span>
)

/** Simplified marks for the three ad platforms (not their logos). */
function SourceMark({ name }: { name: string }) {
  const c = name.startsWith('Google') ? '#FBBC04' : name.startsWith('Meta') ? '#0866FF' : '#008373'
  return (
    <span className="grid h-[32px] w-[32px] place-items-center rounded-[6px] border border-fp-line bg-white text-[14px] font-bold" style={{ color: c }}>
      {name[0]}
    </span>
  )
}

/* ---------- drawer ---------- */

function Drawer({ ui, reduced }: { ui: FlowUI; reduced: boolean }) {
  const tr = { duration: reduced ? 0 : 0.45, ease: EASE_DECK }
  return (
    <>
      <motion.div className="absolute inset-0 bg-[#0B0D18]/45" initial={false} animate={{ opacity: ui.drawer ? 1 : 0 }} transition={tr} />
      <motion.div
        className="absolute inset-y-0 right-0 flex w-[420px] flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.18)]"
        initial={false}
        animate={{ x: ui.drawer ? 0 : 440 }}
        transition={tr}
      >
        <div className="flex-1 overflow-hidden px-[24px] pt-[28px]">
          <div className="flex items-center justify-between">
            <span className="text-[19px] font-semibold">Create Event</span>
            <span className="text-[18px] text-fp-body">✕</span>
          </div>
          <Field label="Event name" required>
            <Input t="name" value={ui.name} focus={ui.focus === 'name'} placeholder={'e.g. "Booked Appt" or "Checkout: Submit Order"'} />
          </Field>
          <Field label="Library" aside="Whats this?">
            <Select value="Web" />
          </Field>
          <Field label="Event type">
            <Select value="Click" />
          </Field>
          <Field label="CSS selector" required>
            <div className="flex gap-[10px]">
              <Input t="selector" value={ui.selector} focus={ui.focus === 'selector'} placeholder={'e.g. button[data-action="book"]'} />
              <span className="flex flex-none items-center rounded-[6px] bg-fp-track px-[12px] text-[13px] font-semibold">Use Visual Tagger</span>
            </div>
          </Field>
          <Field label="Description">
            <div className="h-[80px] rounded-[6px] border border-fp-line px-[12px] py-[10px] text-[12.5px] text-fp-muted">e.g. "Fires when a user completes the appointment confirmation step"</div>
          </Field>
          <div className="mt-[24px] flex flex-col gap-[6px] text-[13px] font-semibold">
            <span className="rounded-[6px] border border-fp-line px-[12px] py-[10px]">+ Add filter</span>
            <span className="rounded-[6px] border border-fp-line px-[12px] py-[10px]">+ Add dynamic property</span>
          </div>
        </div>
        <div className="flex justify-end gap-[12px] border-t border-fp-line px-[24px] py-[12px]">
          <span className="rounded-[6px] border border-fp-line px-[16px] py-[10px] text-[15px] font-medium">Cancel</span>
          <span data-t="save" className="rounded-[6px] bg-fp-indigo px-[16px] py-[10px] text-[15px] font-semibold text-white">
            Create
          </span>
        </div>
      </motion.div>
    </>
  )
}

function Field({ label, required, aside, children }: { label: string; required?: boolean; aside?: string; children: ReactNode }) {
  return (
    <div className="mt-[22px]">
      <div className="mb-[8px] flex items-baseline justify-between text-[13px] font-semibold">
        <span>
          {label}
          {required && <span className="text-fp-red"> *</span>}
        </span>
        {aside && <span className="text-[11px] font-semibold text-fp-indigo">{aside}</span>}
      </div>
      {children}
    </div>
  )
}

function Input({ t, value, focus, placeholder }: { t: string; value: string; focus: boolean; placeholder: string }) {
  return (
    <div
      data-t={t}
      className={`flex h-[40px] min-w-0 flex-1 items-center rounded-[6px] border px-[12px] text-[13px] transition-colors duration-200 ${focus ? 'border-fp-indigo shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-fp-indigo)_15%,transparent)]' : 'border-fp-line'}`}
    >
      <span className={`truncate ${value ? 'text-fp-ink' : 'text-fp-muted'}`}>{value || (focus ? '' : placeholder)}</span>
      {focus && <span className="ml-[1px] block h-[16px] w-[1.5px] animate-pulse bg-fp-ink" />}
    </div>
  )
}

const Select = ({ value }: { value: string }) => (
  <div className="flex h-[40px] items-center justify-between rounded-[6px] border border-fp-line px-[12px] text-[13px]">
    {value}
    <Icon name="chevronDown" size={14} />
  </div>
)

/* ---------- waiting room ---------- */

function WaitingRoom({ reduced }: { reduced: boolean }) {
  return (
    <div className="mx-auto w-[700px] pt-[70px]">
      <div className="flex items-center gap-[18px]">
        <span className="text-[33px] font-semibold tracking-[-0.01em]">Attribution</span>
        <span className="rounded-full bg-fp-track px-[9px] py-[4px] text-[11px] font-semibold tracking-[0.02em]">PROCESSING</span>
      </div>
      <div className="mt-[40px] flex flex-col items-center rounded-[12px] border border-fp-line bg-white px-[100px] pb-[40px] pt-[40px] text-center">
        <span className="relative grid h-[56px] w-[56px] place-items-center rounded-[8px] bg-fp-indigo-soft">
          {!reduced && (
            <motion.span
              className="absolute h-[22px] w-[22px] rounded-full bg-white/50"
              animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <span className="block h-[22px] w-[22px] rounded-full bg-white/35" />
          <span className="absolute block h-[9px] w-[9px] rounded-full bg-white" />
        </span>
        <p className="m-0 mt-[26px] text-[18px] font-semibold">Listening for conversions</p>
        <p className="m-0 mt-[14px] text-[14px] leading-[1.45] text-fp-body">
          Everything's set up correctly. Attribution runs on a daily processing cycle, so your first charts and rankings will be ready after today's data is processed.
        </p>
      </div>
      <div className="mt-[40px] flex items-center justify-between">
        <span className="text-[16px] font-semibold">Events being tracked</span>
        <span className="flex items-center gap-[6px] rounded-[6px] border border-fp-line bg-white px-[12px] py-[9px] text-[12.5px] font-medium">
          <Icon name="gear" size={13} />
          Manage conversions
        </span>
      </div>
      <div className="mt-[16px] rounded-[8px] border border-fp-line bg-white px-[15px] py-[16px]">
        <p className="m-0 text-[12px] font-semibold tracking-[0.06em] text-fp-body">LOW-FUNNEL</p>
        <span className="mt-[14px] inline-flex items-center gap-[7px] rounded-[6px] border border-fp-line px-[8px] py-[7px] text-[12.5px] font-semibold">
          <Avatar letter="B" dark size={20} />
          {EVENT_NAME}
        </span>
      </div>
    </div>
  )
}

/* ---------- dashboard (top of the full Attribution page) ---------- */

// Source performance, share of each stage by source (mock, after the Figma frame's chart)
const BARS = [
  { label: 'Impressions', parts: [47, 43, 5, 0, 0, 3, 2] },
  { label: 'Landing page views', parts: [28, 28, 4, 10, 10, 0, 20] },
  { label: 'Mid-funnel conv.', parts: [28, 25, 2, 8, 18, 0, 19] },
  { label: 'Low-funnel conv.', parts: [27, 36, 8, 17, 4, 0, 8] },
]
const SERIES = ['Google Ads', 'Meta Ads', 'Bing Ads', 'Organic Search', 'Direct', 'theTradeDesk', 'Other']
// full class names so Tailwind emits the series colors
const SERIES_BG = ['bg-fp-s1', 'bg-fp-s2', 'bg-fp-s3', 'bg-fp-s4', 'bg-fp-s5', 'bg-fp-s6', 'bg-fp-s7']

function Dashboard() {
  return (
    <div className="px-[30px] pt-[80px]">
      <div className="flex items-center justify-between">
        <span className="text-[30px] font-semibold tracking-[-0.01em]">Attribution</span>
        <span className="flex overflow-hidden rounded-[6px] border border-fp-line bg-white text-[12px] font-medium">
          {['1 low-funnel', '0 of 3 sources connected', 'AI on'].map((c, i) => (
            <span key={c} className={`flex items-center gap-[6px] px-[12px] py-[8px] ${i ? 'border-l border-fp-line' : ''}`}>
              <span className={`block h-[7px] w-[7px] rounded-full ${i === 2 ? 'bg-fp-green' : 'bg-fp-indigo-soft'}`} />
              {c}
            </span>
          ))}
        </span>
      </div>
      <div className="mt-[22px] flex items-center gap-[14px] rounded-[10px] border border-fp-line bg-white px-[16px] py-[14px]">
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <circle cx="13" cy="13" r="10" fill="none" className="stroke-fp-track" strokeWidth="3" />
          <circle cx="13" cy="13" r="10" fill="none" className="stroke-fp-green" strokeWidth="3" strokeDasharray="47 63" transform="rotate(-90 13 13)" strokeLinecap="round" />
        </svg>
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold">Finish setting up attribution</span>
          <span className="text-[11.5px] text-fp-body">75% complete • Connect ad sources to get the full picture</span>
        </span>
        <span className="ml-auto text-[12.5px] font-semibold text-fp-indigo">Resume setup ›</span>
      </div>
      <div className="mt-[22px] flex gap-[20px] border-b border-fp-line text-[12.5px]">
        <span className="border-b-2 border-fp-indigo pb-[8px] font-semibold text-fp-indigo">Overview</span>
        <span className="pb-[8px] text-fp-body">Journeys</span>
      </div>
      <div className="mt-[22px] rounded-[10px] border border-fp-line bg-white px-[20px] pb-[18px] pt-[16px]">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold">Source performance</span>
          <span className="text-[11.5px] text-fp-body">Last 30 days</span>
        </div>
        <div className="mt-[18px] flex h-[330px] items-end gap-[90px] border-b border-fp-line px-[60px]">
          {BARS.map((b) => (
            <div key={b.label} className="flex h-full flex-1 flex-col-reverse overflow-hidden rounded-t-[3px]">
              {b.parts.map((p, i) => (
                <span key={i} className={`block ${SERIES_BG[i]}`} style={{ height: `${p}%` }} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-[8px] flex gap-[90px] px-[60px] text-center text-[11px] text-fp-body">
          {BARS.map((b) => (
            <span key={b.label} className="flex-1">
              {b.label}
            </span>
          ))}
        </div>
        <div className="mt-[18px] flex flex-wrap justify-center gap-x-[22px] gap-y-[6px] text-[11px] text-fp-body">
          {SERIES.map((s, i) => (
            <span key={s} className="flex items-center gap-[6px]">
              <span className={`block h-[9px] w-[9px] rounded-[2px] ${SERIES_BG[i]}`} />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- icons (simple line icons, standing in for the product's set) ---------- */

type IconName =
  | 'spark' | 'sliders' | 'route' | 'grid' | 'chart' | 'users' | 'check' | 'link' | 'wrench' | 'layers'
  | 'chevronRight' | 'chevronDown' | 'chevronUp' | 'tick' | 'plus' | 'arrowRight' | 'warn' | 'plug' | 'gear'

const PATHS: Record<IconName, string> = {
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  sliders: 'M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0M14 5v4M8 10v4M16 15v4',
  route: 'M5 19c0-6 3-9 9-9M14 10l4-4M6 19a1 1 0 100-2',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  chart: 'M4 20V4M4 20h16M8 16l4-5 3 3 5-6',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.5 3.5 0 010 6.5M18 14.8c2 .8 3.2 2.6 3.5 5.2',
  check: 'M3 13l4 4L17 7M13 17l8-10',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  wrench: 'M14 6a4 4 0 005 5l-9 9-3-3 9-9a4 4 0 01-2-2z',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  chevronRight: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  tick: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  warn: 'M12 4l9 16H3zM12 10v4M12 17v.5',
  plug: 'M9 3v5M15 3v5M7 8h10v3a5 5 0 01-10 0zM12 16v5',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
}

function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-none ${className}`} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}
