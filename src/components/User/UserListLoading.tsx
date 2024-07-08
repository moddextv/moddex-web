import { FC } from 'react';
import { SvgIcon } from '@/components/Icons/SvgIcon';

export const UserListLoading: FC = () => {
    return (
        <>
            <p className="summary">Loading...</p>
            <div className="list loading">
                <div className="channel">
                    <div className="avatar">
                        <SvgIcon name="avatar" size={50}/>
                    </div>
                    <div className="details">
                        <div className="user">
                            <div className="loader-item-1"></div>
                            <div className="badges">
                                <div className="loader-item-2"></div>
                                <div className="loader-item-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};