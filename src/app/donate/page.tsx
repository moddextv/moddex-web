import { Title } from '@/components/UI/Title';
import { Tooltip } from '@/components/UI/Tooltip';
import { Image } from '@/components/UI/Image';
import { DonateForm } from '@/components/DonateForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'donate',
  description: 'help support our project and maintain server cost by donating. receive exclusive badges in return'
};

export default async function DonatePage() {
  return (
    <main className="container mx-auto max-w-3xl py-16 px-6 flex-grow flex flex-col gap-8">
      <div className="flex flex-col-reverse md:flex-row gap-4">
        <Image
          src="/peepoLove.png"
          alt="Thanks!"
          width={64}
          height={42}
          radius="none"
        />
        <Title className="uppercase">thank you for your support!</Title>
      </div>
      <div>
        <Title level={2} size="md">
          information:
        </Title>
        <p className="text-lg">
          donations help us to keep our services up and bring you great features.
        </p>
      </div>
      <div>
        <Title level={2} size="md">
          benefits:
        </Title>
        <div className="text-lg">
          donating 5$ or more qualifies you to receive a special
          donator badge displayed next to your name on our website{' '}
          <span className="inline-flex">
            <Tooltip content="donator">
              <Image
                src="/badges/donator.png"
                alt="donator badge"
                width={25}
                height={25}
                className="inline cursor-help"
              />
            </Tooltip>
          </span>
          <br />
          in addition, the top contributor will receive an exclusive
          one-of-a-kind badge. this badge is uniquely granted to the highest
          donator only.{' '}
          <span className="inline-flex">
            <Tooltip content="top donator">
              <Image
                src="/badges/top_donator.png"
                alt="top donator badge"
                width={25}
                height={25}
                className="inline cursor-help"
              />
            </Tooltip>
          </span>
        </div>
      </div>

      <DonateForm />
    </main>
  );
}
