import "./App.css";
import AppRouter from "./routes/AppRouter";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "react-hot-toast";

function App() {
  const loadSessionFromStorage = useAuthStore((s) => s.loadSessionFromStorage);

  useEffect(() => {
    loadSessionFromStorage();
    // sessionStorage flag set karo — ab se yeh session active hai
    sessionStorage.setItem("sa_active", "true");
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AppRouter />
    </>
  );
}

export default App;