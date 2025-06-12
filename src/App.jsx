import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";

// PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Material from "./pages/Material";
import PaketMasuk from "./pages/PaketMasuk.jsx";
import PengirimanPaket from "./pages/PengirimanPaket.jsx";
import PengambilanPaket from "./pages/PengambilanPaket.jsx";

// COMPONENTS
import Frame from "./components/Frame";
import PrivateRoute from "./components/PrivateRoutes";
import PublicRoute from "./components/PublicRoutes";

const App = () => {
  const theme = createTheme({
    typography: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    palette: {
      red: {
        main: "#8E0000",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Route login tanpa Frame */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Routes lain dibungkus dalam Frame */}
          <Route
            path="*"
            element={
              <PrivateRoute>
                <Frame>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/material" element={<Material />} />
                    <Route path="/paket-masuk" element={<PaketMasuk />} />
                    <Route path="/pengiriman-paket" element={<PengirimanPaket />} />
                    <Route path="/pengambilan-paket" element ={<PengambilanPaket />}/>
                  </Routes>
                </Frame>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
