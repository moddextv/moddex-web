'use client';

import { Title } from '@/components/UI/Title';
import { FC } from 'react';
import { Button } from '@heroui/react';

type ErrorProps = {
  error?: string;
  message?: string;
  statusCode?: number;
  showReloadButton?: boolean;
};

const ErrorComponent: FC<ErrorProps> = ({ statusCode, message, error, showReloadButton }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col text-center">
      <Title mb="md">
        <span className="text-red-500">{statusCode}</span> <span>{error}</span>
      </Title>
      {message && <Title level={2} size="sm" className="font-lato">{message}</Title>}
      {showReloadButton && (
        <Button
          className="w-fit mt-4 mx-auto"
          onClick={handleReload}
        >
          check again
        </Button>
      )}
    </main>
  );
};

export const BannedUser: FC<ErrorProps> = ({
  message = '',
  error = 'user is banned',
  showReloadButton = false
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col text-center">
      <Title mb="md">
        <span>{error}</span>
      </Title>
      {message && <Title level={2} size="sm" className="font-lato">{message}</Title>}
      {showReloadButton && (
        <Button
          className="w-fit mt-4 mx-auto"
          onClick={handleReload}
        >
          check again
        </Button>
      )}
    </main>
  );
};

export const BadRequest: FC<ErrorProps> = ({
  message = '',
  error = 'bad request',
  showReloadButton = false
}) => {
  return <ErrorComponent statusCode={400} error={error} message={message} showReloadButton={showReloadButton} />;
};

export const Forbidden: FC<ErrorProps> = ({
  message = '',
  error = 'forbidden',
  showReloadButton = false
}) => {
  return <ErrorComponent statusCode={403} error={error} message={message} showReloadButton={showReloadButton} />;
};

export const NotFound: FC<ErrorProps> = ({
  message = '',
  error = 'not found',
  showReloadButton = false
}) => {
  return <ErrorComponent statusCode={404} error={error} message={message} showReloadButton={showReloadButton} />;
};

export const InternalServerError: FC<ErrorProps> = ({
  message = '',
  error = 'internal server error',
  showReloadButton = false
}) => {
  return <ErrorComponent statusCode={500} error={error} message={message} showReloadButton={showReloadButton} />;
};
