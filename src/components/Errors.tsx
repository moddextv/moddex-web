import { Title } from '@/components/UI/Title';
import { FC } from 'react';

type ErrorProps = {
  error?: string;
  message?: string;
  statusCode?: number;
};

const ErrorComponent: FC<ErrorProps> = ({ statusCode, message, error }) => (
  <div className="text-center">
    <Title className="text-danger-200">{statusCode}</Title>
    <Title mb="md" level={2}>
      {error}
    </Title>
    {message && <h3>{message}</h3>}
  </div>
);

export const BadRequest: FC<ErrorProps> = ({
  message = '',
  error = 'Bad Request'
}) => {
  return <ErrorComponent statusCode={400} error={error} message={message} />;
};

export const Forbidden: FC<ErrorProps> = ({
  message = '',
  error = 'Forbidden'
}) => {
  return <ErrorComponent statusCode={403} error={error} message={message} />;
};

export const NotFound: FC<ErrorProps> = ({
  message = '',
  error = 'Not Found'
}) => {
  return <ErrorComponent statusCode={404} error={error} message={message} />;
};

export const InternalServerError: FC<ErrorProps> = ({
  message = '',
  error = 'Internal Server Error'
}) => {
  return <ErrorComponent statusCode={500} error={error} message={message} />;
};
