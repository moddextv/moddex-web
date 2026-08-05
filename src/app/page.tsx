import { auth } from '@/auth';
import { Bracket } from '@/components/UI/Bracket';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { SearchUser } from '@/components/User/SearchUser';
import { config } from '@/config';
import { getStats } from '@/utils/stats';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  const username = session?.user?.login || 'forsen';

  const stats = await getStats();

  const counts = [
    { value: stats.channels.formatted, label: 'channels' },
    { value: stats.users.formatted, label: 'users' },
    { value: stats.mods.formatted, label: 'mods' },
    { value: stats.vips.formatted, label: 'vips' }
  ];

  return (
    <main className="flex-grow">
      <Container className="py-20 sm:py-28">
        {/* the mark, read out loud: one relationship, two ends */}
        <div className="flex items-center gap-3 mb-8 text-sm text-primary-400">
          <Mark size={18} split />
          <span>
            <span className="text-mod">mods</span>
            <span className="text-primary-600"> / </span>
            <span className="text-vip">vips</span>
            <span className="text-primary-500"> — both directions</span>
          </span>
        </div>

        <h1 className="font-cairo text-4xl sm:text-5xl leading-[1.05] tracking-tight max-w-xl mb-5">
          Every mod list on twitch, read backwards.
        </h1>

        <p className="text-lg text-primary-300 max-w-xl leading-relaxed mb-12">
          Twitch shows a broadcaster their own moderators. {config.brand.name} keeps
          the other half — every channel a person holds mod or vip in, and the day
          they were given it.
        </p>

        {/* brackets close around the search on load: the mark assembling */}
        <Bracket animate className="max-w-md p-3">
          <SearchUser type="channel" />
        </Bracket>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 mt-12 text-sm mono">
          {counts.map((count, index) => (
            <div
              key={count.label}
              className="enter-item flex flex-col"
              style={{ '--i': index } as React.CSSProperties}
            >
              <dd className="text-2xl text-primary-100">{count.value}</dd>
              <dt className="text-primary-500 text-xs uppercase tracking-widest">
                {count.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>

      {/* the two halves of the mark, at page scale: mod-green anchored top-left,
          vip-pink anchored bottom-right, 180° apart */}
      <div className="border-t border-primary-700">
        <Container className="py-20 grid gap-16 sm:grid-cols-2">
          <section className="sm:pr-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 border-2 border-b-0 border-r-0 border-mod" />
              <h2 className="font-cairo text-xl tracking-tight">
                Built by looking things up
              </h2>
            </div>
            <p className="text-primary-400 leading-relaxed">
              A channel enters the index the first time somebody searches for it —
              that read pulls its mod and vip lists in and keeps them. If a
              moderator you expect is missing, look up the channel they mod in,
              once.
            </p>
          </section>

          <section className="sm:pl-8 sm:text-right">
            <div className="flex items-center gap-2 mb-4 sm:justify-end">
              <h2 className="font-cairo text-xl tracking-tight">
                Two urls, one per direction
              </h2>
              <span className="w-3 h-3 border-2 border-t-0 border-l-0 border-vip" />
            </div>
            <p className="text-primary-400 leading-relaxed mb-5">
              Who mods <em>for</em> a channel, and where a person mods.
            </p>
            <div className="flex flex-col gap-2 mono text-sm">
              {(['c', 'u'] as const).map((prefix) => (
                <code
                  key={prefix}
                  className="px-3 py-2 bg-primary-800 border border-primary-700 text-primary-300"
                >
                  {config.brand.domain}/{prefix}/{username}
                </code>
              ))}
            </div>
          </section>
        </Container>
      </div>
    </main>
  );
}
