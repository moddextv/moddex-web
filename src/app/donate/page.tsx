import Image from 'next/image';

export default async function DonatePage() {
    return (
        <div className="donate">
            <h1>
                <Image src="/img/peepoLove.png" alt="Thanks!" width={64} height={42}/>
                Thank you for your support!
            </h1>
            <h2>Information:</h2>
            <div className="text">
                <p>Donations help us to keep our services up and bring you great features.</p>
            </div>
            <h2>Benefits:</h2>
            <div className="text">
                <p>Donating a minimum of 5€ or more qualifies you to receive a special donator badge displayed next to your name on our website (modchecker.com) <Image src="/img/badges/donator.png" alt="Donator Badge" width={25} height={25}/></p>
                <p>In addition, the top contributor will receive an exclusive one-of-a-kind badge. This badge is uniquely granted to the highest donator only. <Image src="/img/badges/top_donator.png" alt="Top Donator Badge" width={25} height={25}/>
                </p>
            </div>
            <h2>Important:</h2>
            <div className="text">
                <p>Please ensure to include your <strong>Twitch Username</strong> in the note/description field and
                    select <strong>Friends and Family</strong> to ensure fees on both your end and ours, as this is
                    considered a donation.</p>
                <a href="https://paypal.me/modchecker" target="_blank" className="paypal-button">
                    <Image src="/img/paypal.png" alt="PayPal Logo" width={25} height={25}/>Donate with PayPal
                </a>
                <p className="notice-small">Donations are non-refundable.</p>
            </div>
        </div>
    );
}