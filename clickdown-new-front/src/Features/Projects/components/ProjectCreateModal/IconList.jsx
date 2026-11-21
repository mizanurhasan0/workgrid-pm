// Icon choices for a project. Keys are stored with the project, so they must not change.
import {
  Account, Custom, Error as ErrorIcon, MailOpen, Pin, ReturnHisto, Mute, UserGroup, Video,
  VideoCancel, Warning,
} from '../../../../assets';

const IconList = {
  Female: Account,
  Male: Account,
  Custom,
  Error: ErrorIcon,
  OpenMail: MailOpen,
  Warning,
  Pin,
  Return: ReturnHisto,
  Mute,
  Group: UserGroup,
  Video,
  VideoOff: VideoCancel,
};
export default IconList;
