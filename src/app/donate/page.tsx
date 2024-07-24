import { Title } from '@/components/UI/Title';
import { Tooltip } from '@/components/UI/Tooltip';
import { Button, Image, Link } from '@nextui-org/react';

export default async function DonatePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col-reverse md:flex-row gap-4 mb-10">
        <Image
          src="/peepoLove.png"
          alt="Thanks!"
          width={64}
          height={42}
          radius="none"
        />
        <Title className="uppercase">Thank you for your support!</Title>
      </div>
      <Title level={2} size="md">
        Information:
      </Title>
      <div className="mb-5 text-lg">
        Donations help us to keep our services up and bring you great features.
      </div>
      <Title level={2} size="md">
        Benefits:
      </Title>
      <div className="mb-5 text-lg">
        <div>
          Donating a minimum of 5€ or more qualifies you to receive a special
          donator badge displayed next to your name on our website{' '}
          <span className="inline-flex">
            <Tooltip content="donator">
              <Image
                src="/badges/donator.png"
                alt="Donator Badge"
                width={25}
                height={25}
                className="inline cursor-pointer"
              />
            </Tooltip>
          </span>
        </div>
        <div>
          In addition, the top contributor will receive an exclusive
          one-of-a-kind badge. This badge is uniquely granted to the highest
          donator only.{' '}
          <span className="inline-flex">
            <Tooltip content="top donator">
              <Image
                src="/badges/top_donator.png"
                alt="Top Donator Badge"
                width={25}
                height={25}
                className="inline cursor-pointer"
              />
            </Tooltip>
          </span>
        </div>
      </div>
      <Title level={2} size="md">
        Important:
      </Title>
      <div className="mb-5 text-lg">
        Please ensure to include your <strong>Twitch Username</strong> in the
        note/description field and select <strong>Friends and Family</strong> to
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
          Donations are non-refundable.
        </div>
      </div>
    </div>
  );
}
