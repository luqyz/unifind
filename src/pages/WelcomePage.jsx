import { Link, useNavigate } from 'react-router-dom'

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

const steps = [
  {
    icon: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    title: 'Search the board',
    text: 'Browse lost and found listings from your community. Filter by category, location, or type to find what you\u2019re looking for.',
  },
  {
    icon: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    title: 'Post a listing',
    text: 'Lost something? Report it with a photo and description. Found something? Post it with a general description keep identifying details private until you verify the real owner.',
  },
  {
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    title: 'Message safely',
    text: 'Contact the poster directly through in-app messaging no need to share your phone number or email publicly.',
  },
  {
    icon: <polyline points="20 6 9 17 4 12" />,
    title: 'Reunite and resolve',
    text: 'Once an item is returned, mark the listing as resolved. Owners can even offer a reward to say thanks.',
  },
]

export default function WelcomePage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    localStorage.setItem('hasVisitedLostAndFound', 'true')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-navy grid-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/80 to-navy pointer-events-none" />

        {/* glow orb */}
        <div className="absolute left-1/2 top-10 -translate-x-1/2 h-72 w-72 rounded-full bg-amber/20 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3.5 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber pulse-dot" />
            <span className="font-mono text-[11px] tracking-widest uppercase text-amber">Universiti Kebangsaan Malaysia</span>
          </div>

          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber text-navy glow-amber mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 1024 1024">
              <path d="M474.9 489.3m-140.3 0a140.3 140.3 0 1 0 280.6 0 140.3 140.3 0 1 0-280.6 0Z" fill="#FFB89A" />
              <path d="M582.8 465.5c-13.3 0-24.6 8.7-28.5 20.7h-0.1c-2 6.4-4.6 12.7-7.7 18.7l0.2 0.1c-2.3 4.2-3.6 9.1-3.6 14.3 0 16.6 13.4 30 30 30 13 0 24-8.2 28.2-19.8 3.6-7.3 6.7-14.8 9.3-22.6 1.4-3.5 2.2-7.3 2.2-11.4 0-16.5-13.4-30-30-30z" fill="#33CC99" />
              <path d="M512 552.5c-6.8 0-13 2.3-18.1 6.1-17.9 9.6-38 14.6-58.8 14.6-33.4 0-64.8-13-88.4-36.6-23.6-23.6-36.6-55-36.6-88.4s13-64.8 36.6-88.4c23.6-23.6 55-36.6 88.4-36.6s64.8 13 88.4 36.6c15.6 15.6 26.6 34.7 32.2 55.4v0.2h0.1c2.9 13.5 14.9 23.7 29.3 23.7 16.6 0 30-13.4 30-30 0-3.5-0.6-6.8-1.7-9.9-21.5-78.4-93.2-136-178.4-136-102.2 0-185 82.8-185 185s82.8 185 185 185c33.6 0 65-8.9 92.1-24.6l-0.1-0.2c8.9-5.2 14.9-14.9 14.9-25.9 0.1-16.6-13.3-30-29.9-30z" fill="#33CC99" />
              <path d="M435.1 122.6c42.2 0 83.1 8.3 121.6 24.5 37.2 15.7 70.6 38.3 99.4 67s51.3 62.1 67 99.4c16.3 38.5 24.5 79.4 24.5 121.6 0 42.2-8.3 83.1-24.5 121.6-15.7 37.2-38.3 70.6-67 99.4-28.7 28.7-62.1 51.3-99.4 67-38.5 16.3-79.4 24.5-121.6 24.5s-83.1-8.3-121.6-24.5c-37.2-15.7-70.6-38.3-99.3-67-28.7-28.7-51.3-62.1-67-99.3-16.3-38.5-24.5-79.4-24.5-121.6s8.3-83.1 24.5-121.6c15.7-37.2 38.3-70.6 67-99.4 28.7-28.7 62.1-51.3 99.4-67 38.4-16.3 79.3-24.6 121.5-24.6m0-60c-205.7 0-372.5 166.8-372.5 372.5s166.8 372.5 372.5 372.5 372.5-166.8 372.5-372.5S640.8 62.6 435.1 62.6z" fill="#45484C" />
              <path d="M906.7 949.4L671.8 714.5c-11.7-11.7-11.7-30.8 0-42.4 11.7-11.7 30.8-11.7 42.4 0L949.1 907c11.7 11.7 11.7 30.8 0 42.4-11.6 11.6-30.7 11.6-42.4 0z" fill="#45484C" />
            </svg>
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-amber via-amber to-coral bg-clip-text text-transparent">
              UniFind
            </span>
            <br />
            <span className="text-cream">Your Campus Lost &amp; Found Platform</span>
          </h1>

          <p className="mt-5 text-base text-cream/60 max-w-xl mx-auto">
            Post, search, and message safely a modern board built to reunite people
            with what they lost, without exposing personal details publicly.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber px-6 py-3 text-sm font-semibold text-navy hover:bg-amber-dark glow-amber transition"
            >
              Enter the board
              <Icon className="h-4 w-4" path={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} />
            </button>
            <Link
              to="/post"
              onClick={() => localStorage.setItem('hasVisitedLostAndFound', 'true')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-cream/20 px-6 py-3 text-sm font-semibold text-cream hover:bg-cream/5 transition"
            >
              Post a listing
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-[11px] tracking-widest uppercase text-amber">01 &mdash; Process</span>
          <div className="h-px flex-1 bg-cream/10" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, i) => (
            <div key={step.title} className="glass-card rounded-xl p-5 relative overflow-hidden group hover:border-amber/40 transition">
              <span className="absolute -right-2 -top-4 font-mono text-6xl font-bold text-cream/[0.04] select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber/15 text-amber border border-amber/20">
                  <Icon className="h-5 w-5" path={step.icon} />
                </div>
                <div>
                  <p className="font-mono text-[11px] tracking-widest uppercase text-amber/70 mb-1">Step {i + 1}</p>
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-cream mb-1.5">{step.title}</h3>
                  <p className="text-sm text-cream/55 leading-relaxed">{step.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety note */}
        <div className="mt-6 flex items-center gap-3 mb-4">
          <span className="font-mono text-[11px] tracking-widest uppercase text-sage">02 &mdash; Safety</span>
          <div className="h-px flex-1 bg-cream/10" />
        </div>
        <div className="glass-card rounded-xl p-5 flex items-start gap-3">
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-sage/15 text-sage border border-sage/20">
            <Icon className="h-5 w-5" path={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />
          </div>
          <p className="text-sm text-cream/70">
            <span className="font-semibold text-cream">Your safety matters.</span> Contact details are never shown publicly,
            and found-item posts keep identifying details private until the real owner can verify them.
          </p>
        </div>
      </section>
    </div>
  )
}