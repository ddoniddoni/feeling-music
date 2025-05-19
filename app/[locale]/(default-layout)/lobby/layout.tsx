import React from "react";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="layout-pages page-lobby">{children}</main>;
}
