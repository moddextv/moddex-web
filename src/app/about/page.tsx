import { openGraphFor } from '@/misc/metadata';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { Ext, Inline } from '@/components/Legal';
import { config } from '@/config';
import { Metadata } from 'next';
import { CSSProperties, FC, ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  openGraph: openGraphFor('/about'),
  title: 'About',
  description: `Who runs ${config.brand.domain}, where it came from, and what happened to donations made back when it was modchecker.com.`
};

const Para: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-read text-primary-300 max-w-prose">{children}</p>
);

const Panel: FC<{ title: string; icon?: ReactNode; children: ReactNode }> = ({
  title,
  icon,
  children
}) => (
  <div className="panel">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-h2">{title}</h2>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export default function AboutPage() {
  const { name, domain, discordUrl, githubUrl, authorUrl } = config.brand;

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-3 max-w-[24ch]">What {name} is, and who runs it</h1>
          <p className="text-lead text-primary-300 max-w-prose">
            {name} records which Twitch accounts hold moderator, VIP or founder status in which
            channels, and the day they got it. Twitch shows a broadcaster their own list. {name}{' '}
            keeps the other half.
          </p>
        </header>

        <section
          className="enter grid gap-6 lg:grid-cols-2 pb-4"
          style={{ '--i': 1 } as CSSProperties}
        >
          <Panel title="Who runs it">
            <Para>
              One person, and that is the whole team. The domain, the server, the database and the
              code all sit in the same pair of hands, and no part of {name} is operated by anybody
              else.
            </Para>
            <Para>
              More about the person behind it at <Ext href={authorUrl}>maersux.dev</Ext>, and the
              code can be read at <Ext href={githubUrl}>github.com/moddextv</Ext>.
            </Para>
          </Panel>

          <Panel title="It used to be modchecker.com">
            <Para>
              {name} started out under the name modchecker.com. In August 2026 the project separated
              from that domain and from its original owner, moved to {domain}, and was rebuilt along
              the way into four separate services.
            </Para>
            <Para>
              What changed hands was the name: the original owner held the domain and the Discord
              server. The database was never theirs. It has been on the same server, in the same
              hands, the whole way through, and it did not move for the rename.
            </Para>
            <Para>
              Ownership, hosting, the domain, the database and the code now sit entirely with the
              person running this site. There is no shared control and no arrangement of any kind
              with the old domain or with anyone behind it. If you followed a modchecker link here,
              that is the whole of what changed.
            </Para>
          </Panel>

          <Panel
            title="If you donated back when it was modchecker"
            icon={
              <Image
                src="/badges/donator.svg"
                alt="The donator badge"
                width={28}
                height={28}
                radius="sm"
                className="shrink-0"
              />
            }
          >
            <Para>
              Your donation still counts here. We decided to honor every donation made under the old
              name rather than start the ledger over, so the donator badge you earned then came
              across with the rest of the data and is on your profile now.
            </Para>
            <Para>
              That is the likely answer if you are wearing a badge on a site you don&apos;t remember
              giving anything to. There is nothing to claim and nothing to renew, and it
              doesn&apos;t expire. If you did donate back then and the badge isn&apos;t showing, say
              so in <Ext href={discordUrl}>the Discord</Ext> and it will be put right by hand.
            </Para>
          </Panel>

          <Panel title="What it costs you">
            <Para>
              Nothing. There is no paid tier, no advertising, nothing behind a login, and the{' '}
              <Ext href={config.brand.docsUrl}>api</Ext> is open.{' '}
              <Inline href="/donate">Donations</Inline> are the only thing keeping it that way, and
              the badges they carry are cosmetic.
            </Para>
            <Para>
              What is held about an account, and how to make it stop, is on the{' '}
              <Inline href="/privacy">privacy page</Inline>. The opt-out is one switch and takes
              effect immediately. The <Inline href="/tos">terms</Inline> say the rest. {name} is not
              affiliated with, endorsed by, or sponsored by Twitch Interactive, Inc.
            </Para>
          </Panel>
        </section>
      </Container>
    </main>
  );
}
