import { Title } from '@/components/UI/Title';
import { Button, Link, Snippet } from '@nextui-org/react';
import { auth } from '@/auth';
import { getStats } from '@/utils/stats';

export default async function Home() {
  const session = await auth();

  const username = session?.user?.name || 'forsen';
  const channel = session?.user?.name || 'kaicenat';

  const stats = await getStats();

  return (
    <main className="flex-grow flex flex-col">
      <header
        className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-primary-800 to-primary-900 text-center text-white px-6">
        <div className="max-w-6xl w-full">
          <Title level={1} mb="md" className="font-extrabold">
            explore twitch mods and vips
          </Title>
          <p className="text-lg sm:text-2xl mb-8 text-primary-300">
            welcome to modchecker, the ultimate tool for tracking twitch mods and vips.
          </p>
          <div>
            <Button
              as={Link}
              size="lg"
              radius="md"
              className="w-fit bg-primary-700 text-primary-100 hover:bg-primary-800 hover:text-white"
              href={`/channel`}
            >
              find channels
            </Button>
          </div>
        </div>
      </header>

      <section id="features" className="py-16 px-6 bg-primary-800 text-primary-100">
        <div className="max-w-6xl mx-auto">
          <Title level={2} size="xl" mb="lg" className="text-center text-primary-100">
            discover our features
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-primary-700 shadow-lg rounded-lg">
              <Title level={3} size="lg" mb="sm" className="text-primary-100">
                lookup mods & vips
              </Title>
              <p className="text-primary-200">
                view detailed information about any twitch channel, including its moderators and vips.
              </p>
            </div>
            <div className="p-8 bg-primary-700 shadow-lg rounded-lg">
              <Title level={3} size="lg" mb="sm" className="text-primary-100">
                explore user roles
              </Title>
              <p className="text-primary-200">
                find out where specific users hold moderator or vip roles across twitch.
              </p>
            </div>
            <div className="p-8 bg-primary-700 shadow-lg rounded-lg sm:col-span-2 lg:col-span-1">
              <Title level={3} size="lg" mb="sm" className="text-primary-100">
                share your stats
              </Title>
              <p className="text-primary-200">
                easily share your stats with our short url feature:
              </p>
              <Snippet
                size="sm"
                variant="flat"
                hideSymbol={true}
                classNames={{
                  base: 'w-full mt-2 bg-primary-600 text-xs sm:text-sm',
                  pre: 'overflow-x-hidden text-ellipsis',
                }}
                tooltipProps={{
                  delay: 200,
                  offset: 8,
                  color: 'foreground',
                  className: 'font-medium'
                }}
              >
                {`https://mdc.lol/c/${username}`}
              </Snippet>
              <br />
              <Snippet
                size="sm"
                variant="flat"
                hideSymbol={true}
                classNames={{
                  base: 'w-full mt-2 bg-primary-600 text-xs sm:text-sm',
                  pre: 'overflow-x-hidden text-ellipsis',
                }}
                tooltipProps={{
                  delay: 200,
                  offset: 8,
                  color: 'foreground',
                  className: 'font-medium'
                }}
              >
                {`https://mdc.lol/u/${channel}`}
              </Snippet>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 text-center bg-primary-900 px-6">
        <div className="max-w-6xl mx-auto">
          <Title level={2} size="xl" mb="lg" className="text-primary-100">
            stats overview
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-primary-800 rounded-lg shadow-lg">
              <p className="text-5xl font-bold text-primary-100">{`${stats.channels.formatted}+`}</p>
              <p className="text-primary-300">channels tracked</p>
            </div>
            <div className="p-8 bg-primary-800 rounded-lg shadow-lg">
              <p className="text-5xl font-bold text-primary-100">{`${stats.users.formatted}+`}</p>
              <p className="text-primary-300">users tracked</p>
            </div>
            <div className="p-8 bg-primary-800 rounded-lg shadow-lg">
              <p className="text-5xl font-bold text-primary-100">{`${stats.mods.formatted}+`}</p>
              <p className="text-primary-300">mods tracked</p>
            </div>
            <div className="p-8 bg-primary-800 rounded-lg shadow-lg">
              <p className="text-5xl font-bold text-primary-100">{`${stats.vips.formatted}+`}</p>
              <p className="text-primary-300">vips tracked</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
