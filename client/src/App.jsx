import React, { useState } from "react";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import Cookies from "universal-cookie";

import {
  ChannelListContainer,
  ChannelContainer,
  Auth,
  AdminChannelManager,
  Profile,
} from "./components";
import QuizDashboard from "./components/QuizDashboard";

import "stream-chat-react/dist/css/index.css";
import "./App.css";

const cookies = new Cookies();

const apikey = "fmrge7s99j4f";
const authToken = cookies.get("token");
const userRole = cookies.get("role") || "student";

const client = StreamChat.getInstance(apikey);

if (authToken) {
  // Đảm bảo fullName được ưu tiên cho hiển thị trong chat
  const fullName = cookies.get("fullName");
  const username = cookies.get("username");

  client.connectUser(
    {
      id: cookies.get("userId"),
      name: fullName || username, // Dùng fullName cho hiển thị trong chat, fallback sang username
      username: username, // Lưu username riêng cho định danh đăng nhập
      fullName: fullName, // fullName dùng cho hiển thị trong chat
      image: cookies.get("avatarURL"),
      hashedPassword: cookies.get("hashedPassword"),
      phoneNumber: cookies.get("phoneNumber"),
      role: userRole,
    },
    authToken
  );
}

const App = () => {
  const [createType, setCreateType] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState("chat"); // "chat", "admin", "profile", or "quiz"
  const [activeAdminTab, setActiveAdminTab] = useState("users"); // "users" or "channels"
  const [activeProfileTab, setActiveProfileTab] = useState("info"); // "info" or "password"
  const [isQuizMode, setIsQuizMode] = useState(false); // Quiz mode state

  if (!authToken) return <Auth />;
  return (
    <div className="app__wrapper">
      <Chat client={client} theme="team light">
        <ChannelListContainer
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          setCreateType={setCreateType}
          setIsEditing={setIsEditing}
          viewMode={viewMode}
          setViewMode={setViewMode}
          userRole={userRole}
          activeAdminTab={activeAdminTab}
          setActiveAdminTab={setActiveAdminTab}
          activeProfileTab={activeProfileTab}
          setActiveProfileTab={setActiveProfileTab}
          isQuizMode={isQuizMode}
          setIsQuizMode={setIsQuizMode}
        />
        {viewMode === "chat" ? (
          <ChannelContainer
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            createType={createType}
            userRole={userRole}
            isQuizMode={isQuizMode}
          />
        ) : viewMode === "admin" ? (
          <AdminChannelManager activeAdminTab={activeAdminTab} />
        ) : viewMode === "profile" ? (
          <Profile
            activeProfileTab={activeProfileTab}
            onBack={() => setViewMode("chat")}
          />
        ) : viewMode === "quiz" ? (
          <QuizDashboard userRole={userRole} />
        ) : null}
      </Chat>
    </div>
  );
};

export default App;
