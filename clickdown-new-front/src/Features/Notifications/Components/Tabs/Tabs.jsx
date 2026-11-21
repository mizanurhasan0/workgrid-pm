import React, { useRef } from 'react';

/**
 * Accessible tab strip. Scrolls horizontally on phones instead of wrapping.
 * @param {Object} props
 * @param {Array<{key: string, label: string, icon?: JSX.Element, badge?: number}>} props.tabs
 * @param {string} props.value Active tab key.
 * @param {function} props.onChange Called with the new key.
 * @param {string} props.label Accessible name of the tab list.
 * @param {string} props.idPrefix Prefix used for tab and panel ids.
 */
export default function Tabs({
  tabs, value, onChange, label, idPrefix,
}) {
  const refs = useRef({});

  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === 'ArrowRight') {next = (index + 1) % tabs.length;}
    if (e.key === 'ArrowLeft') {next = (index - 1 + tabs.length) % tabs.length;}
    if (e.key === 'Home') {next = 0;}
    if (e.key === 'End') {next = tabs.length - 1;}
    if (next === null) {return;}
    e.preventDefault();
    onChange(tabs[next].key);
    refs.current[tabs[next].key]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto px-4 sm:px-6 py-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      {tabs.map(({
        key, label: text, icon, badge,
      }, index) => {
        const active = value === key;
        return (
          <button
            key={key}
            ref={(el) => { refs.current[key] = el; }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${key}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${key}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`flex shrink-0 items-center gap-2 min-h-11 sm:min-h-10 px-4 rounded-t-md rounded-b-none text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${active
              ? 'border-brand-solid bg-brand-solid/10 text-brand'
              : 'border-transparent text-text-muted hover:bg-brand-solid/5'}`}
          >
            {icon}
            <span>{text}</span>
            {badge > 0 ? (
              <span className="min-w-5 rounded-full bg-brand-solid px-1.5 text-center text-xs font-semibold leading-5 text-on-brand">{badge > 99 ? '99+' : badge}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
