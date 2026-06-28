import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import shared from './navShared.module.css';

const NavDropdown = ({ label, items, isActive, onNavigate, loading = false }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

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

    return (
        <div className={shared.dropdownWrap} ref={ref}>
            <button
                type="button"
                className={`${shared.dropdownTrigger} ${isActive ? shared.dropdownTriggerActive : ''}`}
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen((v) => !v)}
            >
                <span>{label}</span>
                <ChevronDown className={`${shared.chevron} ${open ? shared.chevronOpen : ''}`} />
            </button>
            {open && (
                <div className={shared.dropdownPanel} role="menu">
                    {loading ? (
                        <span className={shared.dropdownLoading}>Đang tải danh mục...</span>
                    ) : (
                        items.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={shared.dropdownItem}
                                role="menuitem"
                                onClick={() => {
                                    close();
                                    onNavigate?.();
                                }}
                            >
                                <span className={shared.dropdownItemTitle}>{item.label}</span>
                                {item.description ? (
                                    <span className={shared.dropdownItemDesc}>{item.description}</span>
                                ) : null}
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NavDropdown;
