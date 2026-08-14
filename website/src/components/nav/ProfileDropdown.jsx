import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resolveMediaUrl } from '../../api/config';
import { PROFILE_MENU, openFloraChat } from '../../config/navConfig';
import FloraAvatar from '../FloraAvatar';
import shared from './navShared.module.css';

function getInitials(label) {
    const safe = (label || '').trim();
    if (!safe) return 'U';
    const parts = safe.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const ProfileDropdown = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const accountLabel = user?.name || user?.email || 'User';
    const avatarSrc = user?.avatar ? resolveMediaUrl(user.avatar) : '';

    useEffect(() => {
        const onDocClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onEsc = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, []);

    const close = () => setOpen(false);

    const handleItem = async (item) => {
        close();
        onNavigate?.();
        if (item.action === 'logout') {
            await logout();
            navigate('/');
            return;
        }
        if (item.action === 'flora') {
            openFloraChat();
        }
    };

    return (
        <div className={shared.dropdownWrap} ref={ref}>
            <button
                type="button"
                className="flex items-center gap-2 text-gray-700 font-medium hover:text-primary-600 transition-colors max-w-[140px] xl:max-w-[180px] bg-transparent border-0 cursor-pointer p-0"
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="Menu tài khoản"
                onClick={() => setOpen((v) => !v)}
            >
                <span className="w-9 h-9 xl:w-10 xl:h-10 rounded-full border border-gray-200 hover:border-primary-500 transition-colors overflow-hidden flex items-center justify-center bg-white flex-shrink-0">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt={accountLabel} className="w-full h-full object-cover" />
                    ) : (
                        <span className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 text-xs font-semibold">
                            {getInitials(accountLabel)}
                        </span>
                    )}
                </span>
                <span className="text-gray-700 font-medium truncate hidden 2xl:inline">{accountLabel}</span>
            </button>
            {open && (
                <div className={shared.iconDropdownPanel}>
                    <div className={shared.profileUserHeader}>
                        <p className={shared.profileUserName}>{accountLabel}</p>
                        <p className={shared.profileUserEmail}>{user?.email}</p>
                    </div>
                    {PROFILE_MENU.map((item) => {
                        const content = (
                            <>
                                {item.action === 'flora' ? (
                                    <FloraAvatar className={shared.profileFlora} alt="" />
                                ) : (
                                    <span className={`material-icons-round ${shared.profileIcon}`}>{item.icon}</span>
                                )}
                                <span>{item.label}</span>
                            </>
                        );
                        return (
                            <React.Fragment key={item.label}>
                                {item.dividerBefore ? <div className={shared.dropdownDivider} /> : null}
                                {item.href ? (
                                    <Link
                                        to={item.href}
                                        className={`${shared.profileItem} ${item.action === 'logout' ? shared.profileItemDanger : ''}`}
                                        onClick={() => {
                                            close();
                                            onNavigate?.();
                                        }}
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        className={`${shared.profileItem} ${item.action === 'logout' ? shared.profileItemDanger : ''}`}
                                        onClick={() => handleItem(item)}
                                    >
                                        {content}
                                    </button>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
