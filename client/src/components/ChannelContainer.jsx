import React from "react";
import { Channel, MessageTeam, useChatContext } from "stream-chat-react";

import { ChannelInner, CreateChannel, EditChannel } from "./";
import ChannelQuizView from "./ChannelQuizView";

const ChannelContainer = ({
  isCreating,
  setIsCreating,
  isEditing,
  setIsEditing,
  createType,
  userRole,
  isQuizMode,
  isCollapsed,
}) => {
  const { channel } = useChatContext();

  // Nếu ở quiz mode, hiển thị ChannelQuizView
  if (isQuizMode) {
    return (
      <div className={`channel__container ${isCollapsed ? "collapsed" : ""}`}>
        <ChannelQuizView userRole={userRole} />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className={`channel__container ${isCollapsed ? "collapsed" : ""}`}>
        <CreateChannel createType={createType} setIsCreating={setIsCreating} />
      </div>
    );
  }
  if (isEditing) {
    return (
      <div className={`channel__container ${isCollapsed ? "collapsed" : ""}`}>
        <EditChannel setIsEditing={setIsEditing} />
      </div>
    );
  }

  const EmptyState = () => (
    <div className="channel-empty__container">
      <p className="channel-empty__first">
        This is the beginning of your chat history.
      </p>
      <p className="channel-empty__second">
        Send messages, attachments, links, emojis, and more!
      </p>
    </div>
  );

  return (
    <div className={`channel__container ${isCollapsed ? "collapsed" : ""}`}>
      <Channel
        EmptyStateIndicator={EmptyState}
        Message={(messageProps, i) => <MessageTeam key={i} {...messageProps} />}
      >
        <ChannelInner setIsEditing={setIsEditing} />
      </Channel>
    </div>
  );
};

export default ChannelContainer;
