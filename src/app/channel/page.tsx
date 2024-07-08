'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SvgIcon } from '@/components/Icons/SvgIcon';
import { regex } from '@/utils/regex';
import { validateUsername } from '@/utils/validation';

export default function ChannelPage() {
    const router = useRouter();

    const inputField: string = 'username';

    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInput = (event: any) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!regex.username.test(inputValue)) {
            setError('Invalid username. It can only contain 2-25 characters, including only alphanumeric and underscore.');
            return;
        }

        setIsLoading(true);

        try {
            const isValid = await validateUsername(inputValue);
            if (isValid) {
                router.push(`/channel/${inputValue}`);
            } else {
                setIsLoading(false);
                setError('No user found.');
            }
        } catch (error) {
            setIsLoading(false);
            setError('There was an error, please try again later!');
        }
    };

    return (
        <div className="center">
            <h1>modchecker</h1>
            <form onSubmit={handleSubmit}>
                <div className="field-wrapper">
                    <input
                        type="text"
                        aria-label={inputField}
                        name={inputField}
                        placeholder={inputField}
                        minLength={2}
                        maxLength={25}
                        autoComplete="off"
                        onChange={handleInput}
                    />

                    <span className="icon">
                         {isLoading
                             ? <SvgIcon name="loading" size={20} color="var(--color-font-dark)"/>
                             : <SvgIcon name="search" size={20} color="var(--color-font-dark)"/>
                         }
                    </span>
                </div>

                {error && <p data-error="username" className="error">{error}</p>}
            </form>
        </div>
    );
}