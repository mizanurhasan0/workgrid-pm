import React from 'react';
import Image from './Image';

/**
 * Overlapping avatars with a +N overflow chip.
 * @param {Object} props
 * @param {Array} props.avatars Users with id and avatar.
 * @param {number} [props.maxAvatars=3] How many to show before +N.
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 */
export default function AvatarGroup({ avatars = [], maxAvatars = 3, size = 'md' }) {
  const avatarStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };
  const avatarCount = avatars?.length || 0;
  const maxDisplayedAvatars = Math.min(maxAvatars, avatarCount) || 0;
  const hidden = avatarCount - maxDisplayedAvatars;
  // Ring (not border) keeps the full circle size so the label stays centred.
  const circle = `box-border shrink-0 rounded-full ring-2 ring-surface ${avatarStyles[size] ?? avatarStyles.md}`;
  return (
    <div className="flex items-center -space-x-3">
      {
        avatars?.slice(0, maxDisplayedAvatars).map((avatar) => (
          <div key={avatar.id} className={`${circle} inline-flex overflow-hidden`}>
            <Image className="h-full w-full rounded-full object-cover" src={avatar.avatar} />
          </div>
        ))
      }
      {
        hidden > 0 && (
          <span
            className={`${circle} inline-flex items-center justify-center overflow-hidden bg-brand-soft font-semibold leading-none tabular text-brand`}
            title={`${hidden} more`}
            aria-label={`${hidden} more`}
          >
            <span aria-hidden="true">{`+${hidden > 99 ? 99 : hidden}`}</span>
          </span>
        )
      }
    </div>
  );
}
