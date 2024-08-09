import { Title } from '@/components/UI/Title';
import { FC } from 'react';

type ErrorProps = {
  error?: string;
  message?: string;
  statusCode?: number;
};

const ErrorComponent: FC<ErrorProps> = ({ statusCode, message, error }) => (
  <div className="text-center">
    <Title mb="md">
      <span className="text-red-500">{statusCode}</span> <span>{error}</span>
    </Title>
    {message && <Title level={2} size="sm" className="font-lato">{message}</Title>}
  </div>
);

export const BadRequest: FC<ErrorProps> = ({
  message = '',
  error = 'bad request'
}) => {
  return <ErrorComponent statusCode={400} error={error} message={message} />;
};

export const Forbidden: FC<ErrorProps> = ({
  message = '',
  error = 'forbidden'
}) => {
  return <ErrorComponent statusCode={403} error={error} message={message} />;
};

export const NotFound: FC<ErrorProps> = ({
  message = '',
  error = 'not found'
}) => {
  return <ErrorComponent statusCode={404} error={error} message={message} />;
};

export const InternalServerError: FC<ErrorProps> = ({
  message = '',
  error = 'internal server error'
}) => {
  return <ErrorComponent statusCode={500} error={error} message={message} />;
};
