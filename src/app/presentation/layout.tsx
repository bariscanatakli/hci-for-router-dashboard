// Presentation page uses its own layout without the dashboard shell
export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
