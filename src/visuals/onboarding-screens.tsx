import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_DECK } from '../engine/motion'
import { HandCircle } from '../components/HandCircle'

/*
  The new Attribution setup flow, rebuilt from Kyle's Figma (file "Attribution": the onboarding flow section,
  the waiting room, and the full dashboard). Laid out in the frames' own 1440 x 900 pixel space and scaled
  as a whole by the walkthrough. Measurements, type, and colors come from the frames' design context
  (setup steps, the Create Event drawer, the No Low Funnel state); the logo, nav icons, and ad platform
  logos are the frames' own assets (public/assets/showing-team/). Copy is the designs' own; data is mock.
  Page content is Inter, navigation and buttons Roboto, as in the product.

  Anything the cursor moves to carries data-t="<target>"; the walkthrough measures it to place the cursor,
  and passes `hover` so the button under the cursor shows its hover state.
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
  /** The event's funnel definition: none yet, then mid, then low. */
  funnel: 'none' | 'mid' | 'low'
  error: boolean
  /** The hand-drawn circle around "You can always set this up later". */
  later: boolean
  /** The hand-drawn circle around "Only one low-funnel event is required to continue". */
  rule: boolean
  ai: boolean
  /** Kyle's handwritten note on the waiting room. */
  note: boolean
  /** The dashboard's AI recommendations card (waiting on data) is collapsed. */
  aiCollapsed: boolean
  /** The dashboard scrolls down the whole page. */
  scroll: boolean
  cursor: boolean
}

export const EVENT_NAME = 'Booked Appointment'
export const EVENT_SELECTOR = 'button.booked-appt'
/** Seconds the dashboard takes to scroll from top to bottom. */
export const DASHBOARD_SCROLL = 7

const STEPS = ['Create an event', 'Define conversion events', 'Connect ad sources', 'Enable AI']
const PAGE_H = 900 - 56 // the main area under the top bar
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/showing-team/${name}.svg`
const Img = ({ name, size, className = '' }: { name: string; size: number; className?: string }) => (
  <img src={asset(name)} alt="" width={size} height={size} className={`block flex-none ${className}`} draggable={false} />
)
const fade = (reduced: boolean) => ({
  initial: { opacity: 0, y: reduced ? 0 : 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: reduced ? 0.15 : 0.35, ease: EASE_DECK },
})
// screen and step changes: the old one stays in place under the new one while they crossfade (opacity only,
// both in the same grid cell), so there is never a blank frame or a shift
const cross = (reduced: boolean) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: reduced ? 0.15 : 0.28, ease: 'easeOut' as const },
})
const STACK = '[grid-area:1/1]'

/** Every image the screens use, so the walkthrough can fetch them before they're on screen. */
export const ASSETS = [
  'logo', 'nav-collapse', 'nav-env', 'chevron-env', 'nav-ai', 'nav-ai-mask', 'nav-ai-spark', 'nav-sources', 'nav-events',
  'chevron-down', 'nav-destinations', 'nav-insights', 'chevron-up', 'nav-audiences', 'nav-consent', 'nav-short-links',
  'nav-internal-tools', 'bell', 'help', 'step-done', 'google-ads', 'plug', 'meta', 'bing-tile', 'arrow-right', 'close', 'plus', 'triangle-alert',
]
/** The product fonts, for the same reason (the page loads them with display=swap). */
export const FONTS = ['400 14px Inter', '500 14px Inter', '600 14px Inter', '700 14px Inter', '400 14px Roboto', '500 14px Roboto', '700 14px Roboto']

export function FlowScreen({ ui, hover, reduced }: { ui: FlowUI; hover: string | null; reduced: boolean }) {
  return (
    <div className="relative flex h-[900px] w-[1440px] overflow-hidden bg-fp-bg font-fp text-fp-ink" style={{ fontSize: 14 }}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="relative grid flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {ui.screen === 'setup' && (
              <motion.div key="setup" className={`${STACK} relative bg-fp-bg`} {...cross(reduced)}>
                <div className="mx-auto w-[700px] pt-[65px]">
                  <p className="m-0 text-[12px] font-bold tracking-[0.6px] text-fp-indigo-soft">SETUP GUIDE</p>
                  <h3 className="m-0 mt-[4px] text-[32px] font-semibold leading-normal tracking-[-0.64px]">Getting started with Attribution</h3>
                  <Progress phase={ui.phase} reduced={reduced} />
                  <div className="grid">
                    <AnimatePresence initial={false}>
                      <motion.div key={ui.phase} className={STACK} {...cross(reduced)}>
                        <SetupStep ui={ui} hover={hover} reduced={reduced} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
            {ui.screen === 'waiting' && (
              <motion.div key="waiting" className={`${STACK} relative bg-fp-bg`} {...cross(reduced)}>
                <WaitingRoom reduced={reduced} />
                <WaitingNote show={ui.note} reduced={reduced} />
              </motion.div>
            )}
            {ui.screen === 'dashboard' && (
              <motion.div key="dashboard" className={`${STACK} relative bg-fp-bg`} {...cross(reduced)}>
                <Dashboard scroll={ui.scroll} aiCollapsed={ui.aiCollapsed} hover={hover} reduced={reduced} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Drawer ui={ui} hover={hover} reduced={reduced} />
    </div>
  )
}

/* ---------- buttons (sizes and styles from the frames; hover states are ours, a step darker) ---------- */

type Kind = 'primary' | 'outline' | 'ghost'
const KIND: Record<Kind, { base: string; hover: string }> = {
  primary: { base: 'bg-fp-indigo text-white', hover: 'bg-fp-indigo-hover text-white' },
  outline: { base: 'border border-fp-line-strong bg-white text-fp-ink', hover: 'border border-fp-line-strong bg-fp-hover text-fp-ink' },
  ghost: { base: 'text-fp-ink', hover: 'bg-fp-hover text-fp-ink' },
}

function Button({ t, kind, hover, disabled = false, size = 'lg', children }: { t?: string; kind: Kind; hover: string | null; disabled?: boolean; size?: 'lg' | 'md' | 'sm'; children: ReactNode }) {
  const on = !disabled && !!t && hover === t
  const sizes = {
    lg: 'h-[44px] px-[20px] font-fp-ui text-[16px] font-medium leading-[20px] rounded-[6px]',
    md: 'h-[40px] px-[16px] text-[14px] font-semibold rounded-[8px]',
    sm: 'h-[36px] px-[12px] font-fp-ui text-[12px] font-medium leading-[16px] rounded-[6px]',
  }[size]
  return (
    <span
      data-t={t}
      className={`flex flex-none items-center justify-center gap-[6px] transition-[background-color,opacity] duration-150 ${sizes} ${on ? KIND[kind].hover : KIND[kind].base} ${disabled ? 'opacity-50' : ''}`}
    >
      {children}
    </span>
  )
}

/* ---------- chrome ---------- */

const NAV_TOP: { label: string; icon: string; chevron?: boolean }[] = [
  { label: 'Sources', icon: 'nav-sources' },
  { label: 'Events', icon: 'nav-events', chevron: true },
  { label: 'Destinations', icon: 'nav-destinations', chevron: true },
]
const INSIGHTS = ['Attribution', 'Web Analytics', 'Funnels', 'Heatmaps', 'Session Replay', 'Surveys']
const NAV_BOTTOM = [
  { label: 'Audiences', icon: 'nav-audiences' },
  { label: 'Consent', icon: 'nav-consent' },
  { label: 'Short Links', icon: 'nav-short-links' },
  { label: 'Internal Tools', icon: 'nav-internal-tools' },
]

function Sidebar() {
  return (
    <div className="relative z-10 flex h-full w-[240px] flex-none flex-col bg-fp-nav font-fp-ui text-white">
      <div className="flex h-[68px] flex-none items-center justify-between pl-[24px] pr-[16px]">
        <img src={asset('logo')} alt="Freshpaint" width={148.7} height={32} className="block" draggable={false} />
        <span className="grid h-[32px] w-[32px] place-items-center">
          <Img name="nav-collapse" size={18} />
        </span>
      </div>
      <div className="px-[12px] pb-[16px]">
        <div className="flex items-center gap-[12px] rounded-[8px] border border-white/10 px-[13px] py-[9px]">
          <Img name="nav-env" size={20} />
          <span className="flex h-[56px] flex-1 flex-col justify-center">
            <span className="text-[12px] font-bold leading-[16px] text-white/60">Main</span>
            <span className="text-[14px] font-bold leading-[20px]">Production</span>
          </span>
          <Img name="chevron-env" size={20} className="-rotate-90" />
        </div>
      </div>
      <div className="h-px flex-none border-b border-white/15 bg-fp-nav-line" />
      <div className="px-[6px] pb-[4px] pt-[6px]">
        <div className="p-[6px]">
          <NavRow label="Freshpaint AI" icon={<AiIcon />} badge />
        </div>
        {NAV_TOP.map((n) => (
          <div key={n.label} className="p-[6px]">
            <NavRow label={n.label} icon={<Img name={n.icon} size={20} />} chevron={n.chevron ? 'down' : undefined} />
          </div>
        ))}
        <div className="p-[6px]">
          <div className="rounded-t-[8px] bg-white/[0.07]">
            <NavRow label="Insights" icon={<Img name="nav-insights" size={20} />} chevron="up" />
          </div>
          <div className="rounded-b-[8px] bg-white/[0.07] pl-[16px] pt-[6px]">
            {INSIGHTS.map((label, i) => (
              <div key={label} className="h-[44px] pb-[4px] pl-[16px]">
                <div className={`flex h-[40px] w-[184px] items-center justify-between rounded-l-[8px] pl-[12px] pr-[4px] text-[12px] leading-[20px] tracking-[0.35px] ${i === 0 ? 'bg-fp-nav-active' : ''}`}>
                  {label}
                  {i > 0 && <NewBadge />}
                </div>
              </div>
            ))}
          </div>
        </div>
        {NAV_BOTTOM.map((n) => (
          <div key={n.label} className="p-[6px]">
            <NavRow label={n.label} icon={<Img name={n.icon} size={20} />} chevron="down" />
          </div>
        ))}
      </div>
    </div>
  )
}

function NavRow({ label, icon, badge, chevron }: { label: string; icon: ReactNode; badge?: boolean; chevron?: 'down' | 'up' }) {
  return (
    <div className="flex h-[40px] w-[216px] items-center rounded-[8px] px-[12px] text-[14px] font-bold leading-[20px] tracking-[0.35px]">
      <span className="pr-[8px]">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="pr-[4px]">
          <NewBadge />
        </span>
      )}
      {chevron && <Img name={chevron === 'up' ? 'chevron-up' : 'chevron-down'} size={20} />}
    </div>
  )
}

/** The product's top bar (from the 2026 Insights frame), with the breadcrumb reading Attribution, per Kyle. */
function TopBar() {
  return (
    <div className="relative z-10 flex h-[56px] flex-none items-center gap-[64px] border-b border-fp-line bg-white px-[32px] font-fp-ui">
      <span className="flex-1 text-[12px] font-bold leading-[24px] underline">Attribution</span>
      <span className="flex items-center gap-[4px]">
        <span className="relative grid h-[48px] w-[48px] place-items-center">
          <Img name="bell" size={24} />
          <span className="absolute right-[7px] top-[7px] rounded-full border border-white bg-fp-indigo px-[5px] py-[2px] text-[10px] font-medium leading-[12px] text-white">1</span>
        </span>
        <span className="grid h-[48px] w-[48px] place-items-center">
          <Img name="help" size={24} />
        </span>
        <span className="grid h-[48px] w-[48px] place-items-center">
          <span className="grid h-[36px] w-[36px] place-items-center rounded-full border border-white bg-fp-indigo-soft text-[14px] leading-[20px] text-white">AN</span>
        </span>
      </span>
    </div>
  )
}

const NewBadge = () => <span className="rounded-[6px] bg-fp-new px-[8px] py-[4px] text-[12px] font-medium leading-[16px] tracking-[0.35px] text-fp-new-ink">New</span>

/** Freshpaint AI's sparkle icon: two layers, the second masked, as in the frame. */
function AiIcon() {
  const mask = `url("${asset('nav-ai-mask')}")`
  return (
    <span className="relative block h-[20px] w-[20px] overflow-hidden">
      <img src={asset('nav-ai')} alt="" className="absolute inset-y-0 left-[5.56%] h-full w-[88.88%]" draggable={false} />
      <span
        className="absolute"
        style={{
          inset: '16.02% 35.97% 37.41% 17.46%',
          maskImage: mask,
          WebkitMaskImage: mask,
          maskPosition: '-0.621px -1.242px',
          WebkitMaskPosition: '-0.621px -1.242px',
          maskSize: '10.556px 10.556px',
          WebkitMaskSize: '10.556px 10.556px',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      >
        <img src={asset('nav-ai-spark')} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      </span>
    </span>
  )
}

function Progress({ phase, reduced }: { phase: number; reduced: boolean }) {
  return (
    <div className="mt-[40px] flex flex-col gap-[10px]">
      <div className="relative h-[8px] overflow-hidden rounded-[12px] bg-fp-line">
        <motion.div
          className="absolute inset-0 origin-left rounded-full bg-fp-indigo-soft"
          initial={false}
          animate={{ scaleX: phase / 4 }}
          transition={{ duration: reduced ? 0 : 0.6, ease: EASE_DECK }}
        />
      </div>
      <div className="flex">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = n < phase
          const now = n === phase
          return (
            <span key={label} className={`flex w-[175px] items-center justify-center gap-[8px] text-[12px] font-semibold ${done || now ? 'text-fp-ink' : 'text-fp-faint'}`}>
              {done && <Img name="step-done" size={18} />}
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

function SetupCard({ n, title, optional, body, children }: { n: number; title: string; optional?: boolean; body: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-[40px] flex min-h-[140px] flex-col gap-[40px] rounded-[12px] border border-black/[0.09] bg-white p-[40px] shadow-[0_0_3px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-[16px]">
        <p className="relative m-0 pl-[27px] text-[18px] font-semibold tracking-[-0.36px]">
          <span className="absolute left-[4px]">{n}.</span>
          {title}
          {optional && <span className="ml-[4px] text-[12px] font-normal tracking-normal text-fp-muted">(Optional)</span>}
        </p>
        <p className="m-0 w-[464px] text-[14px] leading-[20px]">{body}</p>
      </div>
      <div className="flex flex-col gap-[4px]">{children}</div>
    </div>
  )
}

function Footer({ hover, back = true, skip = false, label = 'Continue', enabled = true, arrow = true }: { hover: string | null; back?: boolean; skip?: boolean; label?: string; enabled?: boolean; arrow?: boolean }) {
  return (
    <div className="mt-[40px] flex items-center justify-between">
      {back ? (
        <Button t="back" kind="outline" hover={hover}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <span className="flex gap-[10px]">
        {skip && (
          <Button t="skip" kind="ghost" hover={hover}>
            Skip for now
          </Button>
        )}
        <Button t="continue" kind="primary" hover={hover} disabled={!enabled}>
          {label}
          {arrow && <Img name="arrow-right" size={18} />}
        </Button>
      </span>
    </div>
  )
}

function Row({ lead, label, sub, children, tinted = false }: { lead: ReactNode; label: string; sub?: string; children?: ReactNode; tinted?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-[10px] border border-fp-line p-[16px] transition-colors duration-300 ${tinted ? 'bg-fp-indigo-tint' : 'bg-white'}`}>
      <span className="flex items-center gap-[10px]">
        {lead}
        <span className="flex flex-col gap-[2px]">
          <span className="text-[14px] font-semibold">{label}</span>
          {sub && <span className="text-[12px] text-fp-muted">{sub}</span>}
        </span>
      </span>
      {children}
    </div>
  )
}

const Avatar = ({ letter, dark = false, size = 32 }: { letter: string; dark?: boolean; size?: number }) => (
  <span className={`grid flex-none place-items-center rounded-full font-semibold text-white ${dark ? 'bg-fp-teal' : 'bg-fp-mint'}`} style={{ width: size, height: size, fontSize: size * 0.44 }}>
    {letter}
  </span>
)

const EventRow = ({ sub, children }: { sub?: string; children?: ReactNode }) => (
  <Row lead={<Avatar letter="B" />} label={EVENT_NAME} sub={sub}>
    {children}
  </Row>
)

/** One half of the Mid / Low funnel selector (from the No Low Funnel frame). */
function Segment({ t, on, hover, side, children }: { t: string; on: boolean; hover: string | null; side: 'left' | 'right'; children: ReactNode }) {
  const shape = side === 'left' ? 'rounded-l-[6px] border' : 'rounded-r-[8px] border-y border-r'
  const look = on ? 'border-fp-indigo bg-fp-indigo text-white' : hover === t ? 'border-fp-line bg-fp-hover text-fp-ink-2' : 'border-fp-line bg-white text-fp-ink-2'
  return (
    <span data-t={t} className={`grid h-[32px] w-[95px] place-items-center transition-colors duration-200 ${shape} ${look}`}>
      {children}
    </span>
  )
}

type Platform = 'google-ads' | 'meta' | 'bing'

/** The ad platform logo tiles, as in the frame (Bing's tile is one asset, shadow included). */
function SourceTile({ name }: { name: Platform }) {
  if (name === 'bing')
    return (
      <span className="relative block h-[32px] w-[32px] flex-none">
        <img src={asset('bing-tile')} alt="" className="absolute block max-w-none" style={{ inset: '-12.5% -18.75% -25% -18.75%' }} draggable={false} />
      </span>
    )
  return (
    <span className="grid h-[32px] w-[32px] flex-none place-items-center rounded-[8px] border border-black/[0.08] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.07)]">
      <PlatformLogo name={name} />
    </span>
  )
}

/** The bare platform mark (Google Ads and Meta from the frame; Bing from its tile, scaled to sit like the others). */
function PlatformLogo({ name, scale = 1 }: { name: Platform; scale?: number }) {
  if (name === 'google-ads') return <img src={asset('google-ads')} alt="" width={17.5 * scale} height={16 * scale} draggable={false} />
  if (name === 'meta') return <img src={asset('meta')} alt="" width={17 * scale} height={11.3 * scale} draggable={false} />
  // the Bing tile's mark, cropped out of its 44px tile
  return (
    <span className="relative block overflow-hidden" style={{ width: 16 * scale, height: 16 * scale }}>
      <img src={asset('bing-tile')} alt="" className="absolute max-w-none" style={{ width: 44 * scale * 0.73, height: 44 * scale * 0.73, left: -8.3 * scale, top: -4.6 * scale }} draggable={false} />
    </span>
  )
}

function SetupStep({ ui, hover, reduced }: { ui: FlowUI; hover: string | null; reduced: boolean }) {
  if (ui.phase === 1)
    return (
      <>
        <SetupCard n={1} title="Create an event" body="Add at least one event you want to track. You can add more than one, but one is enough to continue.">
          {ui.events > 0 ? (
            // after the first event (Kyle's reference frame): the list, then Add another; the dashed zone is gone
            <>
              <motion.div {...fade(reduced)}>
                <EventRow sub={EVENT_SELECTOR}>
                  <Trash />
                </EventRow>
              </motion.div>
              <div className="mt-[20px] flex justify-center">
                <Button t="create" kind="outline" size="md" hover={hover}>
                  <Img name="plus" size={16} />
                  Add another
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-fp-indigo-line bg-fp-indigo-tint py-[40px]">
              <Button t="create" kind="outline" size="md" hover={hover}>
                <Img name="plus" size={16} />
                Create Event
              </Button>
            </div>
          )}
        </SetupCard>
        {ui.events > 0 && <Footer hover={hover} back={false} />}
      </>
    )
  if (ui.phase === 2)
    return (
      <>
        <SetupCard
          n={2}
          title="Define conversion events"
          body={
            <>
              Designate events as mid or low funnel.{' '}
              <span className="relative whitespace-nowrap">
                Only one low-funnel event is required to continue
                <span className="pointer-events-none absolute -inset-x-[14px] -top-[3px] -bottom-[7px]">
                  <HandCircle show={ui.rule} reducedMotion={reduced} duration={0.7} variant={2} className="inset-0 h-full w-full" />
                </span>
              </span>
            </>
          }
        >
          <EventRow>
            <span className="flex text-[12px] font-semibold">
              <Segment t="mid" on={ui.funnel === 'mid'} hover={hover} side="left">
                Mid funnel
              </Segment>
              <Segment t="low" on={ui.funnel === 'low'} hover={hover} side="right">
                Low funnel
              </Segment>
            </span>
          </EventRow>
          <motion.div className="flex justify-center pt-[24px]" initial={false} animate={{ opacity: ui.error ? 1 : 0, y: ui.error || reduced ? 0 : -4 }} transition={{ duration: reduced ? 0.15 : 0.3 }}>
            <span className="flex items-center gap-[10px] rounded-[8px] border border-fp-red-line bg-fp-red-tint px-[16px] py-[10px] text-[12px] font-medium text-fp-red">
              <Img name="triangle-alert" size={16} />
              At least one event must be marked Low Funnel to continue.
            </span>
          </motion.div>
        </SetupCard>
        <Footer hover={hover} enabled={ui.funnel === 'low'} />
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
                <span className="pointer-events-none absolute -inset-x-[14px] -top-[3px] -bottom-[7px]">
                  <HandCircle show={ui.later} reducedMotion={reduced} duration={0.7} variant={1} className="inset-0 h-full w-full" />
                </span>
              </span>
            </>
          }
        >
          {(
            [
              ['google-ads', 'Google Ads'],
              ['meta', 'Meta Ads'],
              ['bing', 'Bing Ads'],
            ] as const
          ).map(([logo, label]) => (
            <Row key={label} lead={<SourceTile name={logo} />} label={label}>
              <Button kind="outline" size="sm" hover={hover}>
                <Img name="plug" size={14} />
                Connect
              </Button>
            </Row>
          ))}
        </SetupCard>
        <Footer hover={hover} skip />
      </>
    )
  return (
    <>
      <SetupCard n={4} title="Enable AI recommendations" optional body="Freshpaint analyzes your conversion events and ad performance to surface recommendation cards. You can turn this on anytime.">
        <Row
          tinted={ui.ai}
          lead={
            <span className="grid h-[32px] w-[32px] place-items-center rounded-[8px] border border-black/[0.08] bg-white text-fp-ai shadow-[0_2px_6px_rgba(0,0,0,0.07)]">
              <Sparkle />
            </span>
          }
          label="AI recommendations"
        >
          <span data-t="toggle" className={`relative block h-[16px] w-[36px] rounded-full transition-colors duration-300 ${ui.ai ? 'bg-fp-indigo-line' : 'bg-fp-line-strong'}`}>
            <motion.span
              className={`absolute top-1/2 block h-[20px] w-[20px] -translate-y-1/2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${ui.ai ? 'bg-fp-indigo' : 'bg-white'}`}
              initial={false}
              animate={{ x: ui.ai ? 18 : -2 }}
              transition={{ duration: reduced ? 0 : 0.25, ease: EASE_DECK }}
            />
          </span>
        </Row>
      </SetupCard>
      <Footer hover={hover} label={ui.ai ? 'Finish & go to Attribution' : 'Continue'} arrow={!ui.ai} />
    </>
  )
}

/* ---------- drawer (from the Create Event Drawer frame) ---------- */

function Drawer({ ui, hover, reduced }: { ui: FlowUI; hover: string | null; reduced: boolean }) {
  const tr = { duration: reduced ? 0 : 0.45, ease: EASE_DECK }
  return (
    <>
      <motion.div className="absolute inset-0 z-20 bg-black/50" initial={false} animate={{ opacity: ui.drawer ? 1 : 0 }} transition={tr} />
      <motion.div className="absolute inset-y-0 right-0 z-20 flex w-[420px] flex-col gap-[10px] bg-white" initial={false} animate={{ x: ui.drawer ? 0 : 440 }} transition={tr}>
        <div className="flex items-center gap-[10px] p-[24px]">
          <p className="m-0 flex-1 text-[18px] font-bold tracking-[-0.27px] text-black">Create Event</p>
          <span className="grid h-[32px] w-[32px] place-items-center">
            <Img name="close" size={14} />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-[24px] overflow-hidden px-[24px]">
          <Field label="Event name" required>
            <Input t="name" value={ui.name} focus={ui.focus === 'name'} placeholder="e.g. “Booked Appt” or “Checkout: Submit Order”" />
          </Field>
          <Field label="Library" aside="Whats this?">
            <Select value="Web" />
          </Field>
          <Field label="Event type">
            <Select value="Click" />
          </Field>
          <Field label="CSS selector" required>
            <div className="flex gap-[10px]">
              <Input t="selector" grow value={ui.selector} focus={ui.focus === 'selector'} placeholder="e.g. button[data-action=”book”]" />
              <span className="flex h-[40px] flex-none items-center rounded-[8px] bg-fp-tagger px-[12px] text-[12px] font-semibold">Use Visual Tagger</span>
            </div>
          </Field>
          <Field label="Description">
            <div className="h-[80px] rounded-[8px] border border-fp-input p-[12px] text-[12px] text-fp-faint">e.g. “Fires when a user completes the appointment confirmation step”</div>
          </Field>
          <div className="flex flex-col gap-[6px] text-[12px] font-semibold text-black">
            <span className="h-[39px] rounded-[8px] border border-fp-input p-[12px]">+ Add filter</span>
            <span className="h-[39px] rounded-[8px] border border-fp-input p-[12px]">+ Add dynamic property</span>
          </div>
          <div className="flex flex-col gap-[20px] border-t border-fp-line pt-[24px]">
            <p className="m-0 text-[14px] font-semibold text-black">Event Destinations</p>
            <div className="flex flex-col gap-[4px]">
              {(
                [
                  ['meta', 'Facebook Conversions API'],
                  ['google-ads', 'Google Ads'],
                ] as const
              ).map(([logo, label]) => (
                <div key={label} className="flex h-[56px] items-center gap-[10px] rounded-[8px] border border-fp-input p-[12px]">
                  <span className="grid h-[20px] w-[20px] place-items-center">
                    <PlatformLogo name={logo} />
                  </span>
                  <span className="flex-1 text-[12px] text-black">{label}</span>
                  <span className="flex w-[32px] rounded-full bg-fp-faint p-[2px]">
                    <span className="block h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.06)]" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-[10px] border-t border-fp-line bg-white px-[24px] py-[12px]">
          <Button kind="outline" size="md" hover={hover}>
            Cancel
          </Button>
          <Button t="save" kind="primary" size="md" hover={hover}>
            Create
          </Button>
        </div>
      </motion.div>
    </>
  )
}

function Field({ label, required, aside, children }: { label: string; required?: boolean; aside?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between font-semibold">
        <span className="text-[12px] text-black">
          {label}
          {required && <span className="text-fp-required"> *</span>}
        </span>
        {aside && <span className="text-[10px] text-fp-indigo">{aside}</span>}
      </div>
      {children}
    </div>
  )
}

/** A drawer text field, 40px tall. `grow` fills a row beside another control (flex-1 in a column would collapse its height). */
function Input({ t, value, focus, placeholder, grow = false }: { t: string; value: string; focus: boolean; placeholder: string; grow?: boolean }) {
  return (
    <div
      data-t={t}
      className={`flex h-[40px] ${grow ? 'min-w-0 flex-1' : 'w-full flex-none'} items-center rounded-[8px] border px-[12px] text-[12px] transition-[border-color,box-shadow] duration-200 ${focus ? 'border-fp-indigo shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-fp-indigo)_15%,transparent)]' : 'border-fp-input'}`}
    >
      <span className={`truncate ${value ? 'text-fp-ink' : 'text-fp-faint'}`}>{value || (focus ? '' : placeholder)}</span>
      {focus && <span className="ml-[1px] block h-[15px] w-[1.5px] animate-pulse bg-fp-ink" />}
    </div>
  )
}

const Select = ({ value, className = '' }: { value: string; className?: string }) => (
  <div className={`flex h-[40px] items-center gap-[10px] rounded-[8px] border border-fp-input bg-white px-[12px] text-[12px] ${className}`}>
    <span className="flex-1">{value}</span>
    <Chevron />
  </div>
)

/* ---------- waiting room ---------- */

function WaitingRoom({ reduced }: { reduced: boolean }) {
  return (
    <div className="mx-auto w-[700px] pt-[32px]">
      <div className="flex items-center gap-[18px]">
        <span className="text-[32px] font-semibold tracking-[-0.64px]">Attribution</span>
        <span className="rounded-full bg-fp-line px-[9px] py-[4px] text-[11px] font-semibold tracking-[0.02em]">PROCESSING</span>
      </div>
      <div className="mt-[40px] flex flex-col items-center rounded-[12px] border border-black/[0.09] bg-white px-[100px] py-[40px] text-center shadow-[0_0_3px_rgba(0,0,0,0.08)]">
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
        <p className="m-0 mt-[14px] text-[14px] leading-[20px]">
          Everything's set up correctly. Attribution runs on a daily processing cycle, so your first charts and rankings will be ready after today's data is processed.
        </p>
      </div>
      <div className="mt-[40px] flex items-center justify-between">
        <span className="text-[16px] font-semibold">Events being tracked</span>
        <span className="flex h-[36px] items-center gap-[6px] rounded-[6px] border border-fp-line-strong bg-white px-[12px] font-fp-ui text-[12px] font-medium">
          <Gear />
          Manage conversions
        </span>
      </div>
      <div className="mt-[16px] rounded-[10px] border border-fp-line bg-white p-[16px]">
        <p className="m-0 text-[12px] font-semibold tracking-[0.06em] text-fp-muted">LOW-FUNNEL</p>
        <span className="mt-[14px] inline-flex items-center gap-[7px] rounded-[6px] border border-fp-line px-[8px] py-[7px] text-[12px] font-semibold">
          <Avatar letter="B" dark size={20} />
          {EVENT_NAME}
        </span>
      </div>
    </div>
  )
}

/**
 * Kyle's handwritten note on the waiting room (approved wording), in the annotation style: Caveat, magenta,
 * a slight tilt, and a hand-drawn arrow to the card. Sits in the margin right of the 700px column
 * (main-area coordinates: the card's right edge is at x 950).
 */
function WaitingNote({ show, reduced }: { show: boolean; reduced: boolean }) {
  const tr = (delay: number) => ({ duration: reduced ? 0.3 : 0.45, delay: show && !reduced ? delay : 0 })
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.svg
        className="absolute left-0 top-0 overflow-visible"
        width="1200"
        height="835"
        initial={false}
        animate={{ opacity: show ? 1 : 0 }}
        transition={tr(0.35)}
      >
        <g fill="none" stroke="var(--color-annotation)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M990,246 C976,236 966,222 960,196" />
          <path d="M951,207 L960,194 L969,206" />
        </g>
      </motion.svg>
      <motion.p
        className="absolute left-[982px] top-[252px] m-0 font-[family-name:var(--font-hand)] text-[34px] font-bold leading-[1.02] text-annotation"
        style={{ rotate: -4 }}
        initial={false}
        animate={{ opacity: show ? 1 : 0, y: show || reduced ? 0 : 6 }}
        transition={tr(0)}
      >
        The waiting room:
        <br />
        setup's done, data
        <br />
        is on its way
      </motion.p>
    </div>
  )
}

/* ---------- dashboard: the full Attribution page (after the Figma frame), scrolled top to bottom ---------- */

// Source performance, share of each stage by source (mock, after the Figma frame's chart)
const BARS = [
  { label: 'Impressions', parts: [47, 43, 5, 0, 0, 3, 2] },
  { label: 'Landing page views', parts: [28, 28, 4, 10, 10, 0, 20] },
  { label: 'Mid-funnel conv.', parts: [28, 25, 2, 8, 18, 0, 19] },
  { label: 'Low-funnel conv.', parts: [27, 36, 8, 17, 4, 0, 8] },
]
const SERIES = ['Google Ads', 'Meta Ads', 'Bing Ads', 'Organic Search', 'Direct', 'theTradeDesk', 'Other']
const SERIES_VALUES = ['6,230.00', '168.00', '133.00', '239.00', '239.00', '3,605.00', '188.00']
// full class names so Tailwind emits the series colors
const SERIES_BG = ['bg-fp-s1', 'bg-fp-s2', 'bg-fp-s3', 'bg-fp-s4', 'bg-fp-s5', 'bg-fp-s6', 'bg-fp-s7']

// the source table (mock numbers). Paid sources aren't connected yet, so their CPA and spend are locked.
const COLS = ['Impressions', 'Landing page views', 'Mid-funnel conv.', 'Low-funnel conv.', 'CPA ($)', 'Total spend']
const PAID: { name: string; logo: Platform; values: string[] }[] = [
  { name: 'Google Ads', logo: 'google-ads', values: ['87,206', '10,609.40', '3,228.50', '1,151.10'] },
  { name: 'Meta Ads', logo: 'meta', values: ['72,455', '8,353.10', '1,953.10', '1,109.60'] },
  { name: 'Bing Ads', logo: 'bing', values: ['10,331', '1,128.10', '341.60', '181.50'] },
]
const UNPAID: { name: string; values: string[] }[] = [
  { name: 'TheTradeDesk', values: ['10,331', '300', '0', '0', '—', '—'] },
  { name: 'Organic Search', values: ['10,331', '300', '0', '0', '—', '—'] },
  { name: 'Direct', values: ['10,331', '300', '0', '0', '—', '—'] },
  { name: 'Referral', values: ['10,331', '300', '0', '0', '—', '—'] },
]
const TOTALS = ['200,985', '20,690.60', '5,523.20', '2,442.20', '—', '—']

function Dashboard({ scroll, aiCollapsed, hover, reduced }: { scroll: boolean; aiCollapsed: boolean; hover: string | null; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [travel, setTravel] = useState(0)
  // measured when the scroll starts, after the AI card has collapsed
  useLayoutEffect(() => {
    if (ref.current) setTravel(Math.max(0, ref.current.offsetHeight - PAGE_H))
  }, [scroll])
  return (
    <motion.div
      ref={ref}
      className="px-[30px] pb-[40px] pt-[24px]"
      initial={false}
      // reduced motion: no scroll (a jump would skip the top of the page); it stays on the header and chart
      animate={{ y: scroll && !reduced ? -travel : 0 }}
      transition={{ duration: DASHBOARD_SCROLL, ease: [0.45, 0, 0.35, 1] }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[30px] font-semibold tracking-[-0.6px]">Attribution</span>
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
          <circle cx="13" cy="13" r="10" fill="none" className="stroke-fp-line" strokeWidth="3" />
          <circle cx="13" cy="13" r="10" fill="none" className="stroke-fp-green" strokeWidth="3" strokeDasharray="47 63" transform="rotate(-90 13 13)" strokeLinecap="round" />
        </svg>
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold">Finish setting up attribution</span>
          <span className="text-[11.5px] text-fp-muted">75% complete • Connect ad sources to get the full picture</span>
        </span>
        <span className="ml-auto text-[12.5px] font-semibold text-fp-indigo">Resume setup ›</span>
      </div>
      <div className="mt-[22px] flex gap-[20px] border-b border-fp-line text-[12.5px]">
        <span className="border-b-2 border-fp-indigo pb-[8px] font-semibold text-fp-indigo">Overview</span>
        <span className="pb-[8px] text-fp-muted">Journeys</span>
      </div>

      <AiWaiting collapsed={aiCollapsed} hover={hover} reduced={reduced} />

      {/* filters */}
      <div className="mt-[28px] flex items-end justify-between">
        <span className="flex gap-[16px]">
          <span className="flex flex-col gap-[6px] text-[11px] text-fp-muted">
            Group results by
            <Select value="Source & campaign" className="h-[34px] w-[190px]" />
          </span>
          <span className="flex flex-col gap-[6px] text-[11px] text-fp-muted">
            Attribution model
            <Select value="Last touch" className="h-[34px] w-[190px]" />
          </span>
        </span>
        <span className="flex items-center gap-[4px] rounded-[8px] border border-fp-line bg-white p-[4px] text-[11.5px] text-fp-muted">
          {['Custom', '7D', '30D', '3M', '6M', '12M'].map((r) => (
            <span key={r} className={`rounded-[6px] px-[9px] py-[5px] ${r === '30D' ? 'bg-fp-indigo-tint font-semibold text-fp-indigo' : ''}`}>
              {r}
            </span>
          ))}
          <span className="px-[8px]">Last 30 days</span>
        </span>
      </div>

      {/* source performance */}
      <div className="mt-[14px] rounded-[10px] border border-fp-line bg-white px-[20px] pb-[18px] pt-[16px]">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold">Source performance</span>
          <span className="flex rounded-[6px] border border-fp-line text-[11px]">
            <span className="px-[8px] py-[3px] text-fp-muted">Linear</span>
            <span className="border-l border-fp-line bg-fp-indigo-tint px-[8px] py-[3px] font-semibold text-fp-indigo">%</span>
          </span>
        </div>
        <div className="mt-[18px] flex h-[300px] items-end gap-[90px] border-b border-fp-line px-[60px]">
          {BARS.map((b) => (
            <div key={b.label} className="flex h-full flex-1 flex-col-reverse overflow-hidden rounded-t-[3px]">
              {b.parts.map((p, i) => (
                <span key={i} className={`block ${SERIES_BG[i]}`} style={{ height: `${p}%` }} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-[8px] flex gap-[90px] px-[60px] text-center text-[11px] text-fp-muted">
          {BARS.map((b) => (
            <span key={b.label} className="flex-1">
              {b.label}
            </span>
          ))}
        </div>
        <div className="mt-[18px] flex flex-wrap justify-center gap-x-[22px] gap-y-[6px] text-[11px]">
          {SERIES.map((s, i) => (
            <span key={s} className="flex items-start gap-[6px]">
              <span className={`mt-[3px] block h-[9px] w-[9px] rounded-[2px] ${SERIES_BG[i]}`} />
              <span className="flex flex-col">
                {s}
                <span className="text-fp-muted">({SERIES_VALUES[i]})</span>
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* unlock spend: the way back to the skipped step (after Kyle's reference: gradient, caret pointing at the table) */}
      <div className="relative mt-[36px] flex items-center gap-[8px] rounded-[12px] bg-linear-to-r from-fp-indigo to-fp-indigo-soft px-[20px] py-[20px] text-white">
        <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-white/25">
          <Lock size={18} />
        </span>
        <span className="mr-[8px] flex flex-1 flex-col gap-[5px]">
          <span className="text-[16px] font-semibold">Unlock spend & CPA on your ad sources</span>
          <span className="text-[12px] leading-[17px] text-white/90">
            Connecting your ad platforms unlocks campaign-level data, spend, and CPA, so you can see which campaigns actually pay off. <b className="font-semibold text-white">3 platforms left to connect.</b>
          </span>
        </span>
        {(
          [
            ['bing', 'Bing Ads'],
            ['meta', 'Meta Ads'],
            ['google-ads', 'Google Ads'],
          ] as const
        ).map(([logo, name]) => (
          <span key={name} className="flex h-[36px] flex-none items-center gap-[6px] rounded-[6px] bg-white px-[9px] text-[12px] font-medium text-fp-indigo">
            <PlatformLogo name={logo} scale={0.85} />
            Connect {name}
          </span>
        ))}
        <span className="flex h-[36px] flex-none items-center rounded-[6px] border border-white/80 px-[9px] text-[12px] font-medium">+ 3 more sources</span>
        <span className="absolute -bottom-[9px] left-[44px] h-0 w-0 border-x-[10px] border-t-[10px] border-x-transparent border-t-fp-indigo" aria-hidden="true" />
      </div>

      {/* source table */}
      <div className="mt-[10px] rounded-[10px] border border-fp-line bg-white">
        <div className="flex items-center justify-between px-[16px] py-[14px]">
          <span className="flex h-[32px] w-[220px] items-center rounded-[6px] border border-fp-line px-[10px] text-[11.5px] text-fp-faint">Search sources or campaigns</span>
          <span className="flex h-[32px] items-center rounded-[6px] border border-fp-line-strong px-[12px] font-fp-ui text-[11.5px] font-medium">Export CSV</span>
        </div>
        <TableRow head cells={['Source', ...COLS]} />
        <SectionLabel>Paid</SectionLabel>
        {PAID.map((p) => (
          <TableRow
            key={p.name}
            cells={[
              <span key="n" className="flex items-center gap-[8px]">
                <PlatformLogo name={p.logo} scale={0.85} />
                {p.name}
                <span className="rounded-full border border-fp-indigo-line px-[7px] py-[1px] text-[10.5px] font-medium text-fp-indigo">Connect</span>
              </span>,
              ...p.values,
              <Lock key="c" muted />,
              <Lock key="s" muted />,
            ]}
          />
        ))}
        <SectionLabel>Unpaid</SectionLabel>
        {UNPAID.map((u) => (
          <TableRow key={u.name} cells={[u.name, ...u.values]} />
        ))}
        <TableRow total cells={['Totals', ...TOTALS]} />
      </div>
    </motion.div>
  )
}

/**
 * AI recommendations while the first ones are generated (Kyle's reference). Hide collapses it to a slim bar
 * with Show (the collapsed look is ours, approved by Kyle). Its height animates so the page below moves up smoothly: a deliberate
 * exception to transform-and-opacity-only motion, for this one element of mock UI (transforms would misplace
 * the content under the stage's scale).
 */
function AiWaiting({ collapsed, hover, reduced }: { collapsed: boolean; hover: string | null; reduced: boolean }) {
  const tr = { duration: reduced ? 0 : 0.45, ease: EASE_DECK }
  return (
    <motion.div className="relative mt-[24px] overflow-hidden rounded-[12px] border border-fp-line bg-white" initial={false} animate={{ height: collapsed ? 54 : 316 }} transition={tr}>
      <span
        data-t="hide"
        className={`absolute right-[28px] flex items-center gap-[6px] rounded-[6px] px-[8px] py-[5px] text-[13px] font-semibold transition-[background-color,top] duration-200 ${hover === 'hide' ? 'bg-fp-hover' : ''}`}
        style={{ top: collapsed ? 12 : 30 }}
      >
        <Chevron up={!collapsed} size={14} />
        {collapsed ? 'Show' : 'Hide'}
      </span>
      {collapsed && <span className="absolute left-[24px] top-[17px] text-[13px] font-semibold">AI recommendations</span>}
      <motion.div className="flex flex-col items-center pt-[94px] text-center" initial={false} animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: reduced ? 0 : 0.2 }}>
        <span className="grid h-[43px] w-[43px] place-items-center rounded-full bg-fp-faint text-white">
          <Clock />
        </span>
        <p className="m-0 mt-[22px] text-[18px] font-semibold">We’re generating your first recommendations</p>
        <p className="m-0 mt-[8px] w-[460px] text-[13px] leading-[18px]">
          Your first AI recommendations will be ready within 24 hours. We're analyzing your conversion events and ad performance data to generate insights.
        </p>
      </motion.div>
    </motion.div>
  )
}

function TableRow({ cells, head = false, total = false }: { cells: ReactNode[]; head?: boolean; total?: boolean }) {
  return (
    <div className={`grid grid-cols-[2.2fr_repeat(6,1fr)] items-center border-t border-fp-line px-[16px] text-[12px] h-[53px] ${head ? 'text-[11px] font-semibold text-fp-ink-2' : ''} ${total ? 'bg-fp-bg font-semibold' : ''}`}>
      {cells.map((c, i) => (
        <span key={i} className={i === 0 ? '' : 'flex justify-end tabular-nums'}>
          {c}
        </span>
      ))}
    </div>
  )
}

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="flex h-[53px] items-center border-t border-fp-line bg-fp-bg px-[16px] text-[10.5px] font-semibold uppercase tracking-[0.08em] text-fp-muted">{children}</div>
)

/* ---------- small icons not in the pulled frames (line icons in the product's style) ---------- */

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const Chevron = ({ up = false, size = 16 }: { up?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...line} strokeWidth={2}>
    <path d={up ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
  </svg>
)
const Clock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...line}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)
const Sparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...line}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3v4M17 5h4" />
  </svg>
)
// a settings cog: toothed outline with a center hole
const Gear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" {...line}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const Trash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mr-[8px] text-fp-ink" {...line}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6" />
  </svg>
)
const Lock = ({ muted = false, size = 14 }: { muted?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={muted ? 'text-fp-faint' : ''} {...line}>
    <path d="M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 017 0V11" />
  </svg>
)
