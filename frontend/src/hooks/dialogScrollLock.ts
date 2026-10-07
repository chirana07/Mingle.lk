let openDialogs = 0;
let originalOverflow = "";

/** Restore scrolling only after every dialog releases its lock. */
export function lockDialogScroll() {
  if (openDialogs === 0) originalOverflow = document.body.style.overflow;
  openDialogs += 1;
  document.body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    openDialogs -= 1;
    if (openDialogs === 0) document.body.style.overflow = originalOverflow;
  };
}
