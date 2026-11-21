export default function ScrollToTop({ bodyMsgRef }) {
  try {
    const childes = bodyMsgRef?.current?.childNodes || [];
    return childes[childes.length - 1]?.scrollIntoView({
      behaviour: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  } catch (e) {
    console.log(e);
  }
}
