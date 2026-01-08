import RequireAuth from "./components/RequireAuth";
import { Routes, Route } from "react-router-dom";
import styled from "@emotion/styled";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./page/MainPage";
import AboutPage from "./components/AboutPage";
import TrendPage from "./page/TrendPage";
import ResumePage from "./page/ResumePage";
import QuestionPage from "./components/QuestionPage";
import CustomPage from "./components/CustomPage";
import ChatPage from "./page/ChatPage";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

import "./App.css";

function App() {
  const me = useAuthStore((s) => s.me);
  const hasCheckedAuth = useAuthStore((s) => s.hasCheckedAuth);

  useEffect(() => {
    me();
  }, [me]);

  // ✅ 세션 확인 전엔 라우트 자체를 렌더하지 않음
  if (!hasCheckedAuth) {
    return (
      <div className="App">
        <Header />
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <RoutesWrapper>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route
            path="/about"
            element={
              <RequireAuth>
                <AboutPage />
              </RequireAuth>
            }
          />
          <Route
            path="/trend"
            element={
              <RequireAuth>
                <TrendPage />
              </RequireAuth>
            }
          />
          <Route
            path="/resume"
            element={
              <RequireAuth>
                <ResumePage />
              </RequireAuth>
            }
          />
          <Route
            path="/question"
            element={
              <RequireAuth>
                <QuestionPage />
              </RequireAuth>
            }
          />
          <Route
            path="/custom"
            element={
              <RequireAuth>
                <CustomPage />
              </RequireAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            }
          />
        </Routes>
      </RoutesWrapper>
      <Footer />
    </div>
  );
}

export default App;

const RoutesWrapper = styled.div`
  padding-top: 2em;
`;
