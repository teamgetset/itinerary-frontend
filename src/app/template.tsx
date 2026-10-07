import { ViewTransition } from "react";

/** Templates remount on navigation, so every route change gets the page enter/exit animation (see globals.css). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
