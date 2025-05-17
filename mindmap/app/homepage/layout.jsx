import NavBar from "../../components/Navbar/Navbar";

export default function HomepageLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url('/bg_img.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavBar />
      {children}
    </div>
  );
}
