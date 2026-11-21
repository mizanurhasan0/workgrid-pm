// Icon and image barrel for the app.
// Icons come from lucide-react (ISC license, see THIRD_PARTY.md). Every export keeps the
// name used before the migration so call sites did not need to change.
// URL-style exports (strings) are placeholder images served from /public.
import React from 'react';
import * as L from 'lucide-react';

// Wraps a lucide icon so it is decorative by default and accepts the usual SVG props.
const wrap = (Icon, displayName) => {
  const Wrapped = React.forwardRef((props, ref) => (
    <Icon ref={ref} aria-hidden="true" focusable="false" {...props} />
  ));
  Wrapped.displayName = displayName;
  return Wrapped;
};

// Generic document glyph with a file-type label (original artwork).
const fileBadge = (label) => {
  const Badge = (props) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <text x="12" y="17" textAnchor="middle" fill="currentColor" stroke="none" fontSize="5" fontWeight="700" fontFamily="Inter, Arial, sans-serif">{label}</text>
    </svg>
  );
  Badge.displayName = `FileIcon(${label})`;
  return Badge;
};

// Emoji are Unicode characters rendered with the system emoji font (no artwork shipped).
const emojiGlyph = (glyph, label) => {
  const Glyph = ({ className = '', style, ...rest }) => (
    <span role="img" aria-label={label} className={`inline-block leading-none ${className}`} style={style} {...rest}>{glyph}</span>
  );
  Glyph.displayName = `Emoji(${label})`;
  return Glyph;
};

// Workgrid mark (purple tile with a check). Original artwork.
export const Logo = ({ className = '', ...rest }) => (
  <svg viewBox="0 0 64 64" width="32" height="32" className={className} role="img" aria-label="Workgrid" {...rest}>
    <rect width="64" height="64" rx="14" fill="#6239ED" />
    <path d="M18 33l9 9 19-19" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Large decorative shape used behind the auth forms.
export const BgIcon = ({ className = '', ...rest }) => (
  <svg viewBox="0 0 400 400" width="400" height="400" className={className} aria-hidden="true" focusable="false" {...rest}>
    <circle cx="300" cy="100" r="180" fill="#6239ED" />
    <circle cx="340" cy="260" r="120" fill="#22C55E" />
  </svg>
);

// Horizontal wordmark (kept under the old export name).
export const Scrumo = ({ className = '', ...rest }) => (
  <svg viewBox="0 0 400 83" className={className} role="img" aria-label="Workgrid" {...rest}>
    <rect x="2" y="8" width="66" height="66" rx="16" fill="#6239ED" />
    <path d="M20 41l13 13 27-27" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <text x="84" y="56" fontFamily="Inter, Arial, sans-serif" fontSize="40" fontWeight="700" fill="currentColor">Workgrid</text>
  </svg>
);

// Image URL placeholders (served from /public).
export const Navlogo = '/navlogo.svg';
export const ScrumoLight = '/logo.svg';
export const Avatar2 = '/images/default-avatar.svg';
export const ProjectImg = '/images/project-default.svg';
export const defaultImg = '/images/default-upload.svg';
export const TaskDetails = '/images/task-details.svg';
export const ChatImg = '/images/chat-image.svg';

// Icons (lucide)
export const Edit = wrap(L.Pencil, 'Edit');
export const Drag = wrap(L.GripVertical, 'Drag');
export const Tag = wrap(L.Tag, 'Tag');
export const Leave = wrap(L.LogOut, 'Leave');
export const Selected = wrap(L.CircleCheck, 'Selected');
export const Hidden = wrap(L.EyeOff, 'Hidden');
export const Hide = Hidden;
export const Show = wrap(L.Eye, 'Show');
export const Custom = wrap(L.Sliders, 'Custom');
export const Subtask = wrap(L.ListTree, 'Subtask');
export const Bugs = wrap(L.Bug, 'Bugs');
export const IssueOthers = wrap(L.CircleHelp, 'IssueOthers');
export const IssueTypes1 = wrap(L.Shapes, 'IssueTypes1');
export const Dot = wrap(L.Circle, 'Dot');
export const Dot3 = wrap(L.EllipsisVertical, 'Dot3');
export const Dot32 = wrap(L.CircleDot, 'Dot32');
export const PointIcon = wrap(L.CircleDot, 'PointIcon');
export const CalendarIcon = wrap(L.Calendar, 'CalendarIcon');
export const Calender = wrap(L.CalendarDays, 'Calender');
export const MoveTaskIcon = wrap(L.ArrowRightLeft, 'MoveTaskIcon');
export const DuplicateIcon = wrap(L.Copy, 'DuplicateIcon');
export const ReturnHisto = wrap(L.History, 'ReturnHisto');
export const Tabs = wrap(L.PanelTop, 'Tabs');
export const GitMergeIcon = wrap(L.GitMerge, 'GitMergeIcon');
export const TopLoading = wrap(L.Loader, 'TopLoading');
export const TopTimeSchedule = wrap(L.Clock, 'TopTimeSchedule');
export const TopAddUser = wrap(L.UserPlus, 'TopAddUser');
export const TopCalender = wrap(L.CalendarDays, 'TopCalender');
export const TopDelete = wrap(L.Trash2, 'TopDelete');
export const Chat = wrap(L.MessageSquare, 'Chat');
export const Chate = wrap(L.MessageSquareText, 'Chate');
export const Chat2 = wrap(L.MessageSquareText, 'Chat2');
export const Message2 = wrap(L.MessageCircle, 'Message2');
export const Dashboard = wrap(L.LayoutDashboard, 'Dashboard');
export const Project = wrap(L.FolderKanban, 'Project');
export const Search = wrap(L.Search, 'Search');
export const SearchUser = wrap(L.UserSearch, 'SearchUser');
export const Pin = wrap(L.Pin, 'Pin');
export const ArrowRight = wrap(L.ArrowRight, 'ArrowRight');
export const ArrRight = ArrowRight;
export const ArrowRight2 = ArrowRight;
export const ArrowRight3 = ArrowRight;
export const RightArrow = wrap(L.ChevronRight, 'RightArrow');
export const ArrowDown = wrap(L.ChevronDown, 'ArrowDown');
export const Arrowdown = ArrowDown;
export const AngleLeft = wrap(L.ChevronLeft, 'AngleLeft');
export const ArrowUpDown = wrap(L.ArrowUpDown, 'ArrowUpDown');
export const Call = wrap(L.Phone, 'Call');
export const Call2 = wrap(L.PhoneCall, 'Call2');
export const Accept = wrap(L.Phone, 'Accept');
export const Decline = wrap(L.PhoneOff, 'Decline');
export const Video = wrap(L.Video, 'Video');
export const Video2 = Video;
export const Video3 = Video;
export const VideoCancel = wrap(L.VideoOff, 'VideoCancel');
export const Mick = wrap(L.Mic, 'Mick');
export const MickOff = wrap(L.MicOff, 'MickOff');
export const Mute = wrap(L.VolumeX, 'Mute');
export const Pause = wrap(L.Pause, 'Pause');
export const PauseIcon = wrap(L.CirclePause, 'PauseIcon');
export const Play = wrap(L.Play, 'Play');
export const PlusCircle = wrap(L.CirclePlus, 'PlusCircle');
export const Plus = wrap(L.Plus, 'Plus');
export const Cancel = wrap(L.X, 'Cancel');
export const Delete = wrap(L.Trash2, 'Delete');
export const HourIcon = wrap(L.Hourglass, 'HourIcon');
export const Timer = wrap(L.Timer, 'Timer');
export const Time = wrap(L.Clock, 'Time');
export const Upload = wrap(L.Upload, 'Upload');
export const Download = wrap(L.Download, 'Download');
export const Link = wrap(L.Link, 'Link');
export const InsetLink = Link;
export const Mail = wrap(L.Mail, 'Mail');
export const MailOpen = wrap(L.MailOpen, 'MailOpen');
export const Location = wrap(L.MapPin, 'Location');
export const Qr = wrap(L.QrCode, 'Qr');
export const Screen = wrap(L.MonitorUp, 'Screen');
export const Attach = wrap(L.Paperclip, 'Attach');
export const Smile = wrap(L.Smile, 'Smile');
export const Mood = Smile;
export const Mood2 = wrap(L.SmilePlus, 'Mood2');
export const EmojiAdd = Mood2;
export const Text = wrap(L.Type, 'Text');
export const Notification = wrap(L.Bell, 'Notification');
export const Setting = wrap(L.Settings, 'Setting');
export const Alert = wrap(L.TriangleAlert, 'Alert');
export const Warning = Alert;
export const Information = wrap(L.Info, 'Information');
export const Error = wrap(L.CircleX, 'Error');
export const Success = wrap(L.CircleCheck, 'Success');
export const CheckCircle = Success;
export const Checkmark = Success;
export const Flag = wrap(L.Flag, 'Flag');
export const Flag2 = Flag;
export const Star = wrap(L.Star, 'Star');
export const Favourite = Star;
export const Penta = wrap(L.Hexagon, 'Penta');
export const Diamond = wrap(L.Diamond, 'Diamond');
export const BlankDiamond = Diamond;
export const RectRed = wrap(L.Square, 'RectRed');
export const RectGrey = wrap(L.Square, 'RectGrey');
export const AddUser = wrap(L.UserPlus, 'AddUser');
export const AddMember = wrap(L.UserRoundPlus, 'AddMember');
export const Account = wrap(L.UserRound, 'Account');
export const Avatar = wrap(L.User, 'Avatar');
export const User1 = Avatar;
export const User2 = Avatar;
export const Contacts = wrap(L.Contact, 'Contacts');
export const UserGroup = wrap(L.Users, 'UserGroup');
export const UserGroup2 = wrap(L.UsersRound, 'UserGroup2');
export const Assignment = wrap(L.UserCheck, 'Assignment');
export const Share = wrap(L.Share2, 'Share');
export const Share1 = Share;
export const Share2 = Share;
export const ShareDotted = Share;
export const Send = wrap(L.Send, 'Send');
export const Sent = Send;
export const Loading = wrap(L.Loader2, 'Loading');
export const Layers2 = wrap(L.Layers, 'Layers2');
export const Paragraph = wrap(L.Pilcrow, 'Paragraph');
export const Bold = wrap(L.Bold, 'Bold');
export const Italy = wrap(L.Italic, 'Italy');
export const Underline = wrap(L.Underline, 'Underline');
export const LineThrough = wrap(L.Strikethrough, 'LineThrough');
export const A = wrap(L.Heading, 'A');
export const Aa = wrap(L.CaseSensitive, 'Aa');
export const LeftAlign = wrap(L.AlignLeft, 'LeftAlign');
export const RightAlign = wrap(L.AlignRight, 'RightAlign');
export const NumberList = wrap(L.ListOrdered, 'NumberList');
export const BulletList = wrap(L.List, 'BulletList');
export const Quote = wrap(L.Quote, 'Quote');
export const Code = wrap(L.Code, 'Code');
export const Image2 = wrap(L.Image, 'Image2');
export const ChatImgIcon = Image2;
export const File = wrap(L.FileText, 'File');
export const File2 = wrap(L.File, 'File2');
export const CalendarCheckIcon = wrap(L.CalendarCheck, 'CalendarCheckIcon');
export const CLEAN = wrap(L.Eraser, 'CLEAN');
export const Timer2 = Timer;

// Emoji (Unicode glyphs)
export const BlowingKiss = emojiGlyph('\u{1F618}', 'Blowing a kiss');
export const Crying = emojiGlyph('\u{1F622}', 'Crying face');
export const Heart = emojiGlyph('❤️', 'Red heart');
export const Laugh = emojiGlyph('\u{1F602}', 'Laughing face');

// File type glyphs (generic document with extension label)
export const AI = fileBadge('AI');
export const AVI = fileBadge('AVI');
export const DOC = fileBadge('DOC');
export const DOCS = fileBadge('DOC');
export const GIF = fileBadge('GIF');
export const JPG = fileBadge('JPG');
export const MKV = fileBadge('MKV');
export const MP3 = fileBadge('MP3');
export const PDF = fileBadge('PDF');
export const PPT = fileBadge('PPT');
export const SVG = fileBadge('SVG');
export const TXT = fileBadge('TXT');
