import { Title } from '@/components/UI/Title';
import { Tooltip } from '@/components/UI/Tooltip';
import { Button, Link } from '@nextui-org/react';
import { Image } from '@/components/UI/Image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'donate',
  description: 'help support our project and maintain server cost by donating. receive exclusive badges in return'
}

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
          <p>
            donating a minimum of 5€ or more qualifies you to receive a special
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
          </p>
          <p>
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
          </p>
        </div>
      </div>
      <div>
        <Title level={2} size="md">
          important:
        </Title>
        <div className="mb-5 text-lg">
          please ensure to include your <strong>twitch username</strong> in the
          note/description field and select <strong>friends and family</strong> to
          ensure fees on both your end and ours, as this is considered a donation.
        </div>
        <div>
          <Button
            as={Link}
            href="https://paypal.me/modchecker"
            target="_blank"
            className="text-lg hover:bg-green-700 hover:text-white"
            variant="bordered"
            color="success"
            radius="sm"
            fullWidth={true}
            startContent={
              <Image src="/paypal.png" alt="PayPal Logo" width={25} height={25} />
            }
          >
            Donate with PayPal
          </Button>
          <div className="mt-2 text-center text-sm text-red-500">
            donations are non-refundable.
          </div>
        </div>
      </div>
    </main>
  );
}
