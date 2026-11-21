# Third-party assets and licences

## Icons
All UI icons come from **lucide-react** (ISC licence, https://lucide.dev), installed as an npm package.
`src/assets/index.jsx` maps the names the app uses to lucide icons.

## Artwork and images (original to Workgrid)
These files were written for this project and carry no third-party licence:
- `public/logo.svg`, `public/navlogo.svg`: Workgrid mark and wordmark.
- `public/images/default-avatar.svg`, `public/images/project-default.svg`, `public/images/default-upload.svg`,
  `public/images/task-details.svg`, `public/images/chat-image.svg`: placeholder illustrations.
- `public/notify.js`: push-notification service worker.
- `src/assets/index.jsx` (`Logo`, `BgIcon`, `Scrumo`, file-type glyphs): drawn in code.

## Emoji
Emoji are Unicode characters rendered by the operating system font. No emoji artwork is shipped.

## Sounds
The incoming-call ringtone is generated in the browser with the Web Audio API (`src/Utils/ringtone.js`).
No audio file is shipped.

## Fonts
Inter and Poppins are loaded from Google Fonts (SIL Open Font License 1.1), see `src/index.css`.

## Removed assets (replaced, licence reason in brackets)
| Former file | Replacement |
| --- | --- |
| `src/assets/images/gallery.jpg` | Stock illustration carrying a Rawpixel Ltd copyright notice. Replaced by `public/images/project-default.svg`. |
| `src/assets/icons/*.svg`, `src/assets/icons/textArea/*.svg` (about 145 files) | Icon set of unclear origin, with Hugeicons-style names. Replaced by lucide-react (ISC). |
| `src/assets/emoji/*.svg` (31 files) | Emoji artwork of unclear origin. Replaced by Unicode emoji text. |
| `src/assets/files/*.svg` (15 files) | File-type badges of unclear origin. Replaced by a generic document glyph with a text label. |
| `src/assets/audio/ringtone.mp3` | Sound of unknown origin. Replaced by a generated tone. |
| `src/assets/logo.svg`, `Scrumo.svg`, `halfLogo.svg`, `navlogo.svg`, `logo.png`, `qr.svg`, `HourGlass.svg`, `logo2.svg`, `Scrumo 4.svg`, `navlogo2.png` | Former product branding. Replaced by the Workgrid mark. |
| `src/assets/images/*.png|jpg` (Rectangle 28/29/30, avatar, user, projectLogo, ProjectDf) | Unused raster images of unknown origin. Deleted. |
| `public/logo192.png`, `public/logo512.png`, `public/favicon.ico`, `public/navlogo.png` | Create React App defaults. Deleted. |

## Human review
Nothing is pending. If you add artwork from elsewhere, record its source and licence here.
