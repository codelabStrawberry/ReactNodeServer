import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const { user, login, logout, loading, error } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);

    if (result?.success) {
      setUsername("");
      setPassword("");
      navigate("/about");
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/about");
    }
  }, [user, navigate]);

  return (
    <Container>
      <Wrapper>
        <LeftWrap>
          <Title>
            자소서부터 면접까지,<br></br>
            <Highlight>AI</Highlight>로 한 흐름 안에
          </Title>
          <Content>
            내 이야기를 어떻게 쓰고 말해야 할지 고민될 때.<br></br>
            AI가 서류를 다듬고 면접 답변을 코칭해드립니다.
          </Content>
          <LoginWrap>
            <Form onSubmit={handleSubmit}>
              <InputWrap>
                <Input
                  type="text"
                  placeholder="ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="PW"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputWrap>
              <Button type="submit" disabled={loading}>
                {loading ? "로그인중..." : "LOGIN"}
              </Button>

              {error && <ErrorText>{error}</ErrorText>}
            </Form>
            <JoinBox onClick={() => alert("지금은 회원가입 기간이 아닙니다.")}>
              회원가입
            </JoinBox>
          </LoginWrap>
        </LeftWrap>
        <RightWrap>
          <img src="/assets/img/sai.PNG" />
        </RightWrap>
      </Wrapper>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;
const Wrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  gap: 40px;
`;
const LeftWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const Title = styled.h1`
  font-size: 3em;
  text-align: center;
  font-weight: 600;
`;
const Highlight = styled.span`
  color: var(--strawberry-color);
`;
const Content = styled.div`
  text-align: center;
`;
const LoginWrap = styled.div`
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 50px 50px 15px 50px;
`;

const InputWrap = styled.div`
  width: 100%;
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
`;
const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--strawberry-color);
  }
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

  &:hover {
    opacity: 0.9;
  }
`;
const ErrorText = styled.div``;
const JoinBox = styled.div`
  font-size: 0.7em;
  cursor: pointer;
  text-decoration: underline;
  color: #666;
`;
const RightWrap = styled.div`
  flex: 1;
  width: 70%;
  margin: auto;
  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
`;
