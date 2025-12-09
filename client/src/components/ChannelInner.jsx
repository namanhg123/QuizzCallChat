import React, { useState } from "react";
import {
  MessageList,
  MessageInput,
  Thread,
  Window,
  useChannelActionContext,
  Avatar,
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";
import Cookies from "universal-cookie";

import { ChannelInfo } from "../assets";
import VideoCall from "./meeting/VideoCall";

const cookies = new Cookies();

export const GiphyContext = React.createContext({});

const ChannelInner = ({ setIsEditing }) => {
  const [giphyState, setGiphyState] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isMeetingOngoing, setIsMeetingOngoing] = useState(false); // Track meeting status
  const { sendMessage } = useChannelActionContext();
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();

  const overrideSubmitHandler = (message) => {
    let updatedMessage = {
      attachments: message.attachments,
      mentioned_users: message.mentioned_users,
      parent_id: message.parent?.id,
      parent: message.parent,
      text: message.text,
    };

    if (giphyState) {
      updatedMessage = { ...updatedMessage, text: `/giphy ${message.text}` };
    }

    if (sendMessage) {
      sendMessage(updatedMessage);
      setGiphyState(false);
    }
  };

  return (
    <GiphyContext.Provider value={{ giphyState, setGiphyState }}>
      {showVideoCall && (
        <VideoCall
          channel={channel}
          onClose={() => {
            setShowVideoCall(false);
            setIsMeetingOngoing(false); // Update meeting status when call ends
          }}
          currentUser={client.user}
        />
      )}
      <div style={{ display: "flex", width: "100%" }}>
        <Window>
          <TeamChannelHeader
            setIsEditing={setIsEditing}
            onStartVideoCall={() => {
              setShowVideoCall(true);
              setIsMeetingOngoing(true); // Update meeting status when call starts
            }}
            isMeetingOngoing={isMeetingOngoing} // Pass meeting status to header
          />
          <MessageList />
          <MessageInput overrideSubmitHandler={overrideSubmitHandler} />
        </Window>
        <Thread />
      </div>
    </GiphyContext.Provider>
  );
};

const TeamChannelHeader = ({
  setIsEditing,
  onStartVideoCall,
  isMeetingOngoing,
}) => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const userRole = cookies.get("role") || "student";

  const MessagingHeader = () => {
    const members = Object.values(channel.state.members).filter(
      ({ user }) => user.id !== client.userID
    );
    const additionalMembers = members.length - 3;

    if (channel.type === "messaging") {
      return (
        <div className="team-channel-header__name-wrapper">
          {members.map(({ user }, i) => (
            <div key={i} className="team-channel-header__name-multi">
              <Avatar
                image={user.image}
                name={user.name || user.fullName || user.id}
                size={32}
              />
              <p className="team-channel-header__name user">
                {user.name || user.fullName || user.id}
              </p>
            </div>
          ))}

          {additionalMembers > 0 && (
            <p className="team-channel-header__name user">
              and {additionalMembers} more
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="team-channel-header__channel-wrapper">
        <p className="team-channel-header__name">
          <span className="channel-hash-icon">#</span>
          {channel.data.name}
        </p>
        {/* Chỉ Admin và Teacher mới có nút Edit channel */}
        {(userRole === "admin" || userRole === "teacher") && (
          <span style={{ display: "flex" }} onClick={() => setIsEditing(true)}>
            <ChannelInfo />
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="team-channel-header__container">
      <MessagingHeader />
      <div className="team-channel-header__right">
        <div
          className="team-channel-header__icon-button"
          onClick={onStartVideoCall}
          title={isMeetingOngoing ? "Join Meeting" : "Start Meeting"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 10L20 6V18L15 14V10Z"
              stroke="#6264A7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 8H11C12.1046 8 13 8.89543 13 10V14C13 15.1046 12.1046 16 11 16H4C2.89543 16 2 15.1046 2 14V10C2 8.89543 2.89543 8 4 8Z"
              stroke="#6264A7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ChannelInner;
