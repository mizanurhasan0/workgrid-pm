import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Call2,
  Location,
  Mail,
  Video2,
} from '../../../../assets';
import Image from '../../../../Components/Image';
import { useAuth } from '../../../../Context/AuthProvider';
import { useChatCtx } from '../../Context/ChatProvider';
import CallActions from '../CallActions';

export default function DetailsCard({ personInfo }) {
  const { getNameTruncate, getAvatar } = useChatCtx();
  const { user } = useAuth();
  const { id } = useParams();
  const activeChat = useSelector((state) => state.chatsStore.chats.find((c) => c.id === id));
  if (!activeChat) {return <div className="text-sm text-text-muted">Select a chat.</div>;}

  // Contact details belong to the other person in a two-person chat, not to the signed-in user.
  const partner = activeChat.members?.length === 2
    ? activeChat.members.find((m) => m.id !== user?.id)
    : null;

  const contact = 'flex items-center gap-3';
  const actionBtn = 'flex h-11 w-11 items-center justify-center rounded-lg bg-on-brand/20 text-on-brand hover:bg-on-brand/30 focus-visible:outline-2 focus-visible:outline-on-brand';

  return (
    <div className="flex shrink-0 flex-col gap-3 rounded-xl bg-brand-solid p-4 text-on-brand">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-on-brand/20">
          <Image src={getAvatar(activeChat)} alt="" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-6">{getNameTruncate(activeChat, 1)}</p>
          {personInfo?.profession && <p className="text-sm text-on-brand/80">{personInfo.profession}</p>}
        </div>
      </div>
      <div className="border-b border-white/30" />
      <div className="flex gap-2">
        <CallActions
          chat={activeChat}
          AudioIcon={Call2}
          VideoIcon={Video2}
          buttonClass={actionBtn}
          iconClass="h-5 w-5"
          joinClass="h-11 rounded-lg bg-on-brand px-4 text-sm font-semibold text-brand-solid focus-visible:outline-2 focus-visible:outline-on-brand"
        />
      </div>
      {partner && (partner.email || partner.phone || partner.company) && (
        <>
          <p className="text-sm text-on-brand/80">Contact</p>
          <div className="space-y-3 text-sm">
            {partner.email && (
              <div className={contact}>
                <Mail className="h-5 w-5 shrink-0" />
                <p className="truncate">{partner.email}</p>
              </div>
            )}
            {partner.phone && (
              <div className={contact}>
                <Call2 className="h-5 w-5 shrink-0" />
                <p className="truncate">{partner.phone}</p>
              </div>
            )}
            {partner.company && (
              <div className={contact}>
                <Location className="h-5 w-5 shrink-0" />
                <p className="truncate">{partner.company}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
