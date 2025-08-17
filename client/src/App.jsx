import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-center"
        richColors
        visibleToasts={1}
        closeButton
        duration={10000}
        expand={true}
      />
    </>
  );
}

export default App;
