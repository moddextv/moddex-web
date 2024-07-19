import { setIgnoredUser } from '@/actions/userIgnoreState';
import { CheckIcon, CloseIcon } from '@/components/Icons';
import React, { useState, useEffect, useTransition } from 'react';
import { useSwitch, VisuallyHidden, SwitchProps } from '@nextui-org/react';
import { useSession } from 'next-auth/react';

interface IgnoredSwitchProps extends SwitchProps {
  initialState: boolean;
}

export const IgnoredSwitch: React.FC<IgnoredSwitchProps> = (props) => {
  const { initialState, ...rest } = props;
  const { Component, slots, getBaseProps, getInputProps, getWrapperProps } =
    useSwitch(rest);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isSelected, setIsSelected] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setIsSelected(initialState);
  }, [initialState]);

  const handleClick = () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    startTransition(async () => {
      await setIgnoredUser(userId, !isSelected);
      setIsSelected(!isSelected);
      setLoading(false);
    });
  };

  return (
    <Component {...getBaseProps()} onClick={handleClick}>
      <VisuallyHidden>
        <input {...getInputProps()} checked={isSelected} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: [
            'w-8 h-8',
            'flex items-center justify-center',
            'rounded-lg bg-default-100 hover:bg-default-200',
            loading ? 'opacity-50 pointer-events-none' : ''
          ]
        })}
      >
        {isSelected ? <CheckIcon size={20} /> : <CloseIcon size={20} />}
      </div>
    </Component>
  );
};
