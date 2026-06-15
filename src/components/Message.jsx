function Message({ msg, isOwnMessage, senderName, senderAvatar }) {
  const hasAttachment = Boolean(msg.attachment?.url);
  const isVideo = msg.attachment?.type === "video";
  const isImage = msg.attachment?.type === "image";
  const isOther = msg.attachment?.type === "other";

  return (
    <div className={`message-row ${isOwnMessage ? "own" : "other"}`}>
      {!isOwnMessage && (
        <div className="message-avatar">
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName} />
          ) : (
            senderName?.charAt(0).toUpperCase()
          )}
        </div>
      )}

      <div className={`message-bubble ${isOwnMessage ? "sent" : "received"}`}>
        {!isOwnMessage && <div className="message-sender">{senderName}</div>}
        {hasAttachment && (
          <div className="message-attachment">
            {isVideo ? (
              <video controls src={msg.attachment.url} />
            ) : isImage ? (
              <img src={msg.attachment.url} alt={msg.attachment.name || "Attachment"} />
            ) : (
              <div className="attachment-file">
                <a
                  href={msg.attachment.url}
                  download={msg.attachment.name}
                  target="_blank"
                  rel="noreferrer"
                >
                  {msg.attachment.name || "Download file"}
                </a>
              </div>
            )}
            {msg.attachment?.name && (
              <div className="attachment-name">{msg.attachment.name}</div>
            )}
          </div>
        )}
        {msg.text && <p>{msg.text}</p>}
      </div>
    </div>
  );
}

export default Message;
