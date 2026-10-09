/*
    Jim push korbe
*/

import SwapMark from "./SwapMark";

export default function AuthShell({ panelTitle, panelText, children }) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-(--radius-panel) border border-line bg-surface lg:min-h-136 lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-band p-10 text-on-band lg:flex">
        <SwapMark size={40} onBand />
        <div>
          <p className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance">
            {panelTitle}
          </p>
          <p className="mt-4 max-w-[34ch] text-band-soft">{panelText}</p>
        </div>
      </aside>

      <div className="flex items-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}