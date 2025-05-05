'use client';

import { Input } from '@heroui/react';
import { LoadingIcon, SearchIcon } from '@/components/Icons';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { regex } from '@/utils/regex';
import { validateUsername } from '@/utils/validation';

interface SearchUserProps {
  type: 'channel' | 'user';
}

export const SearchUser: FC<SearchUserProps> = ({ type }) => {
  const router = useRouter();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInput = (event: any) => {
    setInputValue(event.target.value.trim());
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!regex.username.test(inputValue)) {
      setError(
        'Invalid username. It can only contain 1-25 characters, including only alphanumeric and underscore.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await validateUsername(inputValue);
      if (isValid) {
        router.push(`/${type}/${inputValue}`);
      } else {
        setIsLoading(false);
        setError('No user found.');
      }
    } catch (error) {
      setIsLoading(false);
      setError('There was an error, please try again later!');
    }
  };

  const handleSubmitClick = async (event: any) => {
    event.preventDefault();
    await handleSubmit(event);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="username"
        placeholder={type}
        size="lg"
        minLength={1}
        maxLength={25}
        autoComplete="off"
        onChange={handleInput}
        variant="bordered"
        className="max-w-sm mx-auto"
        startContent={<span className="text-primary-400">twitch.tv/</span>}
        endContent={
          isLoading ? (
            <LoadingIcon size={20} />
          ) : (
            <div className="cursor-pointer" onClick={handleSubmitClick}>
              <SearchIcon size={20} />
            </div>
          )
        }
        isInvalid={!!error}
        errorMessage={error}
      />
    </form>
  );
};
