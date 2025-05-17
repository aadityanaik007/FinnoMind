export const metadata = {
  title: "Mindmap Generator",
  description: "Visualize financial data as mindmaps",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "roboto" }}>{children}</body>
    </html>
  );
}
