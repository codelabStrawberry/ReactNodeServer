import styled from "@emotion/styled";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Header() {
  const { user, logout, loading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <HeaderWrapper>
      <NavWrap>
        <img src="assets/img/sai.PNG" />
        <NavButton to="/about">About us</NavButton>
        <NavButton to="/trend">취업 트렌드</NavButton>
        <NavButton to="/resume">서류 분석</NavButton>
        <NavButton to="/question">예상 질문</NavButton>
        <NavButton to="/custom">맞춤 채용</NavButton>
        <NavButton to="/chat">면접 챗봇</NavButton>
      </NavWrap>

      {user && (
        <LogoutWrap>
          <User>{user.name ?? user.username ?? "사용자"}님</User>
          <Button type="submit" onClick={handleLogout} disabled={loading}>
            {loading ? "..." : "LOGOUT"}
          </Button>
        </LogoutWrap>
      )}
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
`;
const NavWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-height: 100%;
    width: auto;
    object-fit: contain;
  }
`;
const NavButton = styled(NavLink)`
  margin-left: 1.8em;
  text-decoration: none;
  color: #333;
  padding-bottom: 6px;

  &:hover {
    text-decoration: none;
  }

  &.active {
    color: var(--strawberry-color);
    border-bottom: 2px solid var(--strawberry-color);
  }
`;
const LogoutWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const User = styled.div`
  width: 100%;
  margin-right: 1.8em;
`;
const Button = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  background-color: var(--strawberry-color);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  margin-right: 1.8em;

  &:hover {
    opacity: 0.9;
  }
`;
